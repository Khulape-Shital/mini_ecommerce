import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { customerApi } from '../../api/customer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import type { CustomerListParams } from '../../types/customer';

export const CustomersList: React.FC = () => {
  const [params, setParams] = useState<CustomerListParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerApi.getCustomers(params),
  });

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay message={error instanceof Error ? error.message : 'Failed to fetch customers'} />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Customers</h1>
          <p className="text-body mt-2">Manage your store's customer base.</p>
        </div>
        <Link to="/customers/new" className="btn btn-primary">
          + Create Customer
        </Link>
      </div>

      <div className="table-container">
        {data?.data.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <p className="text-h3">No customers found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: '500' }}>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{customer.contact || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/customers/${customer.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem' }}>
                      Edit
                    </Link>
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
              onClick={() => handlePageChange(data.meta.page - 1)}
              disabled={data.meta.page === 1}
              className="btn btn-secondary"
              style={{ opacity: data.meta.page === 1 ? 0.5 : 1, cursor: data.meta.page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(data.meta.page + 1)}
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
