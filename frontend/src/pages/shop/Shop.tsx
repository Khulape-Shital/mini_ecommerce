import React from 'react';

export const Shop: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1">Shop</h1>
        <p className="text-body mt-2">Browse our latest products.</p>
      </div>

      <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
        <h2 className="text-h2">Welcome to the Store</h2>
        <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
          Products will be displayed here soon.
        </p>
      </div>
    </div>
  );
};
