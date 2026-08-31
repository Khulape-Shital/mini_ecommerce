import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import type { ProductListParams } from '../../types/product';

export const ProductsList: React.FC = () => {
  const [params, setParams] = useState<ProductListParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
  });

  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getProducts(params),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay message={error instanceof Error ? error.message : 'Failed to fetch products'} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Products</h1>
        <Link 
          to="/products/new" 
          style={{ background: '#007bff', color: 'white', padding: '0.5rem 1rem', textDecoration: 'none', borderRadius: '4px' }}
        >
          Create Product
        </Link>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ padding: '0.5rem', flex: 1, minWidth: '200px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <select
            value={params.categoryId || ''}
            onChange={(e) => setParams(prev => ({ ...prev, categoryId: e.target.value || undefined, page: 1 }))}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">All Categories</option>
            {categoriesData?.data.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={params.sortBy || 'createdAt'}
            onChange={(e) => setParams(prev => ({ ...prev, sortBy: e.target.value as ProductListParams['sortBy'], page: 1 }))}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="createdAt">Created At</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
          </select>
          <select
            value={params.sortOrder || 'desc'}
            onChange={(e) => setParams(prev => ({ ...prev, sortOrder: e.target.value as ProductListParams['sortOrder'], page: 1 }))}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <button type="submit" style={{ padding: '0.5rem 1rem', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Search
          </button>
        </form>
      </div>

      {data?.data.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Name</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Description</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Price</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Quantity</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Category</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '1rem' }}>{product.name}</td>
                <td style={{ padding: '1rem' }}>{product.description || '-'}</td>
                <td style={{ padding: '1rem' }}>${product.price.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>{product.quantity}</td>
                <td style={{ padding: '1rem' }}>{product.category?.name || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <Link to={`/products/${product.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
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
