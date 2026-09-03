import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { categoryApi } from '../../api/category';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { PageHeader } from '../../components/ui/PageHeader';

export const CategoriesList: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay message={error instanceof Error ? error.message : 'Failed to fetch categories'} />;

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Categories" 
        description="Manage product categories."
      >
        <Link to="/categories/new" className="btn btn-primary">
          + Create Category
        </Link>
      </PageHeader>

      <div className="table-container">
        {!data?.data || data.data.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
            <p className="text-h3">No Categories Yet</p>
            <p className="text-body mt-2">Get started by creating your first product category.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((category) => (
                <tr key={category.id}>
                  <td style={{ fontWeight: '500' }}>{category.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

