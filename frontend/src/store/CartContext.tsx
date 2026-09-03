import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  quantity: number;
  availableStock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nexus_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.productId === newItem.productId);
      const quantityToAdd = newItem.quantity || 1;

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantityToAdd, existingItem.availableStock);
        return prevItems.map(i => 
          i.productId === newItem.productId ? { ...i, quantity: newQuantity } : i
        );
      }
      return [...prevItems, { ...newItem, quantity: Math.min(quantityToAdd, newItem.availableStock) }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(prevItems => {
      if (quantity <= 0) return prevItems.filter(i => i.productId !== productId);
      return prevItems.map(i => {
        if (i.productId === productId) {
          return { ...i, quantity: Math.min(quantity, i.availableStock) };
        }
        return i;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(i => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
