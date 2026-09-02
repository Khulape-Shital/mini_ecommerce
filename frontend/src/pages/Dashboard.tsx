import React from 'react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="text-h1">Dashboard</h1>
          <p className="text-body mt-2">Welcome back to your Nexus store overview.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/products/new" className="btn btn-primary">
            + New Product
          </Link>
          <Link to="/orders" className="btn btn-secondary">
            View Orders
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Metric Cards */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</h3>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
          </div>
          <div className="text-h2" style={{ color: 'var(--text-primary)' }}>$45,231.89</div>
          <div className="text-small" style={{ color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>↑</span> 20.1% from last month
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Orders</h3>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
          </div>
          <div className="text-h2" style={{ color: 'var(--text-primary)' }}>+12,234</div>
          <div className="text-small" style={{ color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>↑</span> 15% from last month
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Customers</h3>
            <span style={{ fontSize: '1.5rem' }}>👥</span>
          </div>
          <div className="text-h2" style={{ color: 'var(--text-primary)' }}>+573</div>
          <div className="text-small" style={{ color: 'var(--danger)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>↓</span> 2.1% from last month
          </div>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conversion Rate</h3>
            <span style={{ fontSize: '1.5rem' }}>📈</span>
          </div>
          <div className="text-h2" style={{ color: 'var(--text-primary)' }}>3.42%</div>
          <div className="text-small" style={{ color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>↑</span> 1.2% from last month
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="text-h3 mb-4">Recent Activity</h2>
        <div className="flex-col gap-4" style={{ marginTop: '1.5rem' }}>
          {[
            { action: 'New order #1234', time: '5 minutes ago', status: 'Processing' },
            { action: 'Product "Wireless Headphones" restocked', time: '2 hours ago', status: 'Inventory' },
            { action: 'Customer John Doe registered', time: '5 hours ago', status: 'User' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center" style={{ padding: '1rem 0', borderBottom: i === 2 ? 'none' : '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-4">
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }}></div>
                <div>
                  <p style={{ fontWeight: '500' }}>{item.action}</p>
                  <p className="text-small">{item.time}</p>
                </div>
              </div>
              <span className="badge">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
