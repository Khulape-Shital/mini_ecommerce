import React from 'react';
import { Link } from 'react-router-dom';

export const OrdersList: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Orders</h1>
          <p className="text-body mt-2">Manage customer orders and fulfillments.</p>
        </div>
        <Link to="/orders/new" className="btn btn-primary">
          + Create Order
        </Link>
      </div>
      
      <div className="card text-center" style={{ padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
        <h3 className="text-h3">No Orders Yet</h3>
        <p className="text-body mt-2">When customers place orders, they will appear here.</p>
      </div>
    </div>
  );
};
