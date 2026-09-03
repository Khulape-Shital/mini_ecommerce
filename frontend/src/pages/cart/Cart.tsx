import React from 'react';
import { useCart } from '../../store/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalAmount } = useCart();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1">Shopping Cart</h1>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <h2 className="text-h2">Your cart is empty</h2>
          <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
            Looks like you haven't added any products to your cart yet.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '2rem' }}>
          <table className="data-table">
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
                  <td>
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                    <div className="text-small" style={{ color: 'var(--text-secondary)' }}>
                      Stock: {item.availableStock}
                    </div>
                  </td>
                  <td>₹{Number(item.price).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem' }}
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem' }}
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.availableStock}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </td>
                  <td>
                    <button 
                      className="btn" 
                      style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                      onClick={() => removeFromCart(item.productId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="text-h3">
              Total: <span style={{ color: 'var(--accent-primary)' }}>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/shop" className="btn btn-secondary">Continue Shopping</Link>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/orders/new')}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
