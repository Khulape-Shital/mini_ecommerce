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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Customers</h1>
        <Link 
          to="/customers/new" 
          style={{ background: '#007bff', color: 'white', padding: '0.5rem 1rem', textDecoration: 'none', borderRadius: '4px' }}
        >
          Create Customer
        </Link>
      </div>

      {data?.data.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Name</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Email</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Contact</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((customer) => (
              <tr key={customer.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '1rem' }}>{customer.name}</td>
                <td style={{ padding: '1rem' }}>{customer.email}</td>
                <td style={{ padding: '1rem' }}>{customer.contact || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <Link to={`/customers/${customer.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                    View / Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={() => handlePageChange(data.meta.page - 1)}
            disabled={data.meta.page === 1}
            style={{ padding: '0.5rem 1rem' }}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(data.meta.page + 1)}
            disabled={data.meta.page === data.meta.totalPages}
            style={{ padding: '0.5rem 1rem' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
