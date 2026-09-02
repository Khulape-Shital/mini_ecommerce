import React from 'react';
import { Link } from 'react-router-dom';

export const CategoriesList: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Categories</h1>
          <p className="text-body mt-2">Manage product categories.</p>
        </div>
        <Link to="/categories/new" className="btn btn-primary">
          + Create Category
        </Link>
      </div>
      
      <div className="card text-center" style={{ padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
        <h3 className="text-h3">No Categories</h3>
        <p className="text-body mt-2">Get started by creating your first product category.</p>
      </div>
    </div>
  );
};
