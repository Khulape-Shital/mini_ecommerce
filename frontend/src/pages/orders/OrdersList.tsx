import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/order';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';

export const OrdersList: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderApi.getOrders({ page, limit: 10 }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay message={error instanceof Error ? error.message : 'Failed to fetch orders'} />;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'var(--warning)';
      case 'CONFIRMED': return 'var(--accent-primary)';
      case 'SHIPPED': return '#0ea5e9';
      case 'DELIVERED': return 'var(--success)';
      case 'CANCELLED': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

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
      
      <div className="table-container">
        {!data?.data || data.data.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <p className="text-h3">No Orders Yet</p>
            <p className="text-body mt-2">When customers place orders, they will appear here.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                    <Link to={`/orders/${order.id}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }} className="hover:underline">
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>{order.customerId.slice(0, 8)}...</td>
                  <td style={{ fontWeight: '600' }}>₹{Number(order.total).toFixed(2)}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: `${getStatusColor(order.status)}20`, 
                        color: getStatusColor(order.status),
                        border: `1px solid ${getStatusColor(order.status)}`
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-between items-center" style={{ marginTop: '2rem' }}>
          <p className="text-small">
            Showing page <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{data.meta.page}</span> of <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{data.meta.totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={data.meta.page === 1}
              className="btn btn-secondary"
              style={{ opacity: data.meta.page === 1 ? 0.5 : 1, cursor: data.meta.page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
              disabled={data.meta.page === data.meta.totalPages}
              className="btn btn-secondary"
              style={{ opacity: data.meta.page === data.meta.totalPages ? 0.5 : 1, cursor: data.meta.page === data.meta.totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

