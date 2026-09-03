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
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Products</h1>
          <p className="text-body mt-2">Manage your inventory, prices, and categories.</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          + Create Product
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <form onSubmit={handleSearch} className="flex gap-4 items-center flex-wrap">
          <div style={{ flex: '1', minWidth: '250px' }}>
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-input"
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <select
              value={params.categoryId || ''}
              onChange={(e) => setParams(prev => ({ ...prev, categoryId: e.target.value || undefined, page: 1 }))}
              className="form-select"
            >
              <option value="">All Categories</option>
              {categoriesData?.data.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: '150px' }}>
            <select
              value={params.sortBy || 'createdAt'}
              onChange={(e) => setParams(prev => ({ ...prev, sortBy: e.target.value as ProductListParams['sortBy'], page: 1 }))}
              className="form-select"
            >
              <option value="createdAt">Created At</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
            </select>
          </div>
          <div style={{ minWidth: '150px' }}>
            <select
              value={params.sortOrder || 'desc'}
              onChange={(e) => setParams(prev => ({ ...prev, sortOrder: e.target.value as ProductListParams['sortOrder'], page: 1 }))}
              className="form-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <button type="submit" className="btn btn-secondary" style={{ height: '42px' }}>
            Filter
          </button>
        </form>
      </div>

      <div className="table-container">
        {data?.data.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <p className="text-h3">No products found</p>
            <p className="text-body mt-2">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((product) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-tertiary)' }}>
                          <span style={{ fontSize: '1rem' }}>📦</span>
                        </div>
                      )}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {product.description ? (product.description.length > 50 ? `${product.description.substring(0, 50)}...` : product.description) : '-'}
                  </td>
                  <td style={{ fontWeight: '600' }}>₹{Number(product.price).toFixed(2)}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: product.quantity > 10 ? 'var(--accent-light)' : 'rgba(245, 158, 11, 0.1)', color: product.quantity > 10 ? 'var(--accent-primary)' : 'var(--warning)' }}>
                      {product.quantity} in stock
                    </span>
                  </td>
                  <td>{product.category?.name || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/products/${product.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem' }}>
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
