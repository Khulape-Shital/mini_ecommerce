import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import { useCart } from '../../store/CartContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { MessageAlert } from '../../components/MessageAlert';
import { PageHeader } from '../../components/ui/PageHeader';

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
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertTimeout, setAlertTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
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
      <div style={{ marginBottom: '2rem' }}>
        <PageHeader 
          title="Shop" 
          description="Browse our latest products."
        />
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label className="form-label">Search Products</label>
          <InputField
            type="text"
            className="form-input"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Categories</label>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            <Button
              className={`btn ${selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
              onClick={() => setSelectedCategory('')}
            >
              All Categories
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
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
            <div key={product.id} className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {product.imageUrl ? (
                <div style={{ height: '220px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-bounce)' }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </div>
              ) : (
                <div style={{ height: '220px', width: '100%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '4rem' }}>📦</span>
                </div>
              )}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 className="text-h3" style={{ margin: 0, flex: 1, fontSize: '1.25rem' }}>{product.name}</h3>
                  <span className="badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', marginLeft: '1rem' }}>
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                </div>
                
                {product.category && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'block', fontWeight: 600 }}>
                    {product.category.name}
                  </span>
                )}
                
                <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1, fontSize: '0.95rem' }}>
                  {product.description || 'No description available.'}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                  <span className="text-small" style={{ color: product.quantity > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: product.quantity > 0 ? 'var(--success)' : 'var(--danger)', display: 'inline-block' }}></span>
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                  </span>
                  
                  <Button 
                    className="btn btn-primary" 
                    disabled={product.quantity <= 0} 
                    style={{ 
                      opacity: product.quantity > 0 ? 1 : 0.4, 
                      cursor: product.quantity > 0 ? 'pointer' : 'not-allowed',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.5rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={() => {
                      addToCart({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        availableStock: product.quantity,
                      });
                      setAlertMessage(`${product.name} has been added to your cart!`);
                      
                      if (alertTimeout) {
                        clearTimeout(alertTimeout);
                      }
                      const timeoutId = setTimeout(() => {
                        setAlertMessage(null);
                      }, 4000);
                      setAlertTimeout(timeoutId);
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {alertMessage && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, minWidth: '320px', maxWidth: '400px' }}>
          <MessageAlert 
            type="success" 
            message={alertMessage} 
            onDismiss={() => setAlertMessage(null)} 
          />
        </div>
      )}
    </div>
  );
};
