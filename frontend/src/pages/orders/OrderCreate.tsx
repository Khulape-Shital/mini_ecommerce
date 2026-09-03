import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api/product';
import { orderApi } from '../../api/order';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { MessageAlert } from '../../components/MessageAlert';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';

export const OrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    shippingAddress: '',
  });

  const { items, addToCart, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);

  const { data: productsData, isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts({ limit: 100 }), // Fetching all for simple dropdown
  });

  const handleAddProduct = (productId: string) => {
    if (!productId) return;
    const product = productsData?.data?.find(p => p.id === productId);
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        availableStock: product.quantity,
      });
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, quantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (items.length === 0) {
      setMessage({ type: 'warning', text: 'Please add at least one product to the order.' });
      return;
    }
    
    try {
      await orderApi.createOrder({
        name: formData.name,
        email: formData.email,
        contact: formData.contact || undefined,
        shippingAddress: formData.shippingAddress,
        items: items.map(item => ({ productId: item.productId, quantity: item.quantity })),
      });
      clearCart();
      setMessage({ type: 'success', text: 'Order created successfully!' });
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err: any) {
      const serverMessage = err.response?.data?.error?.message || err.response?.data?.message;
      setMessage({ type: 'error', text: 'Failed to create order: ' + (serverMessage || err.message) });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay message={error instanceof Error ? error.message : 'Failed to fetch products'} />;

  const products = productsData?.data || [];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="text-h1">Checkout</h1>
      </div>

      {message && (
        <MessageAlert 
          type={message.type} 
          message={message.text} 
          onDismiss={() => setMessage(null)} 
        />
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            <h2 className="text-h3">Customer Information</h2>
            
            <div>
              <label className="form-label">Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                required
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Contact (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Shipping Address *</label>
              <textarea
                required
                className="form-input"
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 className="text-h3" style={{ marginBottom: '1rem' }}>Order Items</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <select 
                className="form-select" 
                style={{ flex: 1 }}
                onChange={(e) => {
                  handleAddProduct(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>-- Select a product to add --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                ))}
              </select>
            </div>

            {items.length > 0 && (
              <table className="data-table" style={{ marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                      <tr key={item.productId}>
                        <td>{item.name}</td>
                        <td>${Number(item.price).toFixed(2)}</td>
                        <td>
                          <input 
                            type="number"
                            min="1"
                            max={item.availableStock}
                            className="form-input"
                            style={{ width: '80px' }}
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          />
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </td>
                        <td>
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => handleUpdateQuantity(item.productId, 0)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="text-h3">
              Order Total: <span style={{ color: 'var(--accent-primary)' }}>${totalAmount.toFixed(2)}</span>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
