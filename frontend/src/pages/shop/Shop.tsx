import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const Shop: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: categoriesData, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const { data: productsData, isLoading: isLoadingProducts, isError: isErrorProducts, error: productsError } = useQuery({
    queryKey: ['products', debouncedSearch, selectedCategory],
    queryFn: () => productApi.getProducts({ 
      search: debouncedSearch || undefined, 
      categoryId: selectedCategory || undefined,
      limit: 100
    }),
  });

  const isLoading = isLoadingCategories || isLoadingProducts;
  const isError = isErrorCategories || isErrorProducts;

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay message={productsError instanceof Error ? productsError.message : 'Failed to load shop data'} />;

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1">Shop</h1>
        <p className="text-body mt-2">Browse our latest products.</p>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <label className="form-label">Search Products</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2 className="text-h2">No Products Found</h2>
          <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
            Try adjusting your search or category filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {products.map((product) => (
            <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 className="text-h3" style={{ margin: 0, flex: 1 }}>{product.name}</h3>
                  <span className="badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', marginLeft: '1rem' }}>
                    ${Number(product.price).toFixed(2)}
                  </span>
                </div>
                
                {product.category && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'block' }}>
                    {product.category.name}
                  </span>
                )}
                
                <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                  {product.description || 'No description available.'}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <span className="text-small" style={{ color: product.quantity > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '500' }}>
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                  </span>
                  
                  <button 
                    className="btn btn-primary" 
                    disabled={true} 
                    style={{ opacity: product.quantity > 0 ? 0.7 : 0.4, cursor: 'not-allowed' }}
                    title="Cart functionality coming soon"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
