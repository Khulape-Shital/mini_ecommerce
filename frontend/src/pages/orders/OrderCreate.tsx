import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api/product';
import { orderApi } from '../../api/order';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { useNavigate } from 'react-router-dom';

export const OrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    shippingAddress: '',
  });

  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);

  const { data: productsData, isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts({ limit: 100 }), // Fetching all for simple dropdown
  });

  const handleAddProduct = (productId: string) => {
    if (!productId) return;
    setItems((prev) => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter(item => item.productId !== productId));
    } else {
      setItems((prev) => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one product to the order.');
      return;
    }
    
    try {
      await orderApi.createOrder({
        name: formData.name,
        email: formData.email,
        contact: formData.contact || undefined,
        shippingAddress: formData.shippingAddress,
        items,
      });
      alert('Order created successfully!');
      navigate('/');
    } catch (err: any) {
      alert('Failed to create order: ' + (err.response?.data?.message || err.message));
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
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <tr key={item.productId}>
                        <td>{product?.name || item.productId}</td>
                        <td>
                          <input 
                            type="number"
                            min="1"
                            className="form-input"
                            style={{ width: '80px' }}
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          />
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
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
