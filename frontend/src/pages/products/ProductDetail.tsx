import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import type { UpdateProductInput } from '../../types/product';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';

const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  price: z.number({ message: 'Price must be a number' }).min(0, 'Price must be greater than or equal to 0'),
  quantity: z.number({ message: 'Quantity must be a number' }).int().min(0, 'Quantity cannot be negative'),
  categoryId: z.string().uuid('Invalid category ID').optional().or(z.literal('')),
  imageUrl: z.string().max(2800000, 'Image is too large (max 2MB)').optional().nullable(),
});

type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id!),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
  });

  useEffect(() => {
    if (data?.data && isEditing) {
      reset({
        name: data.data.name,
        description: data.data.description || '',
        price: Number(data.data.price),
        quantity: data.data.quantity,
        categoryId: data.data.categoryId || '',
        imageUrl: data.data.imageUrl || null,
      });
      setImagePreview(data.data.imageUrl || null);
      setRemoveImage(false);
    }
  }, [data, isEditing, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    setRemoveImage(false);
    
    if (!file) {
      // Don't change existing preview if they cancel file dialog
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be less than 2MB');
      e.target.value = '';
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Only JPEG, PNG and WEBP images are supported');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateMutation = useMutation({
    mutationFn: (updateData: UpdateProductInput) => productApi.updateProduct(id!, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => productApi.deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
  });

  const onSubmit = (formData: UpdateProductFormValues) => {
    const payload: UpdateProductInput = {
      name: formData.name,
      price: formData.price,
      quantity: formData.quantity,
    };
    
    if (formData.description !== undefined) {
      payload.description = formData.description;
    }
    
    if (formData.categoryId && formData.categoryId.trim() !== '') {
      payload.categoryId = formData.categoryId;
    } else {
      payload.categoryId = null; // Send null to remove category if empty
    }

    if (removeImage) {
      payload.imageUrl = null;
    } else if (imagePreview && imagePreview !== data?.data?.imageUrl) {
      payload.imageUrl = imagePreview;
    }

    updateMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay message={error instanceof Error ? error.message : 'Failed to fetch product'} />;
  if (!data?.data) return <ErrorDisplay message="Product not found" />;

  const product = data.data;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#111827', fontWeight: 700, letterSpacing: '-0.025em' }}>Product Detail</h1>
        <button
          onClick={() => navigate('/products')}
          style={{ 
            padding: '0.625rem 1.25rem', 
            background: '#f1f5f9', 
            color: '#475569',
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          &larr; Back to List
        </button>
      </div>

      {updateMutation.isError && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorDisplay message={updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to update product'} />
        </div>
      )}

      {deleteMutation.isError && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorDisplay message={deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete product'} />
        </div>
      )}

      {!isEditing ? (
        <div style={{ 
          background: '#ffffff', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }}>
            {/* Image Section */}
            <div style={{ 
              flex: '1 1 400px', 
              background: '#f8fafc',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: '2rem',
              borderRight: '1px solid #f1f5f9'
            }}>
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px', 
                    aspectRatio: '1/1', 
                    objectFit: 'cover', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
                  }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  maxWidth: '400px', 
                  aspectRatio: '1/1', 
                  background: '#e2e8f0', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#64748b',
                  gap: '1rem'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span style={{ fontWeight: 500 }}>No Image Available</span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column', padding: '2.5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <span style={{ 
                    background: '#e0e7ff', 
                    color: '#4338ca', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {product.category?.name || product.categoryId || 'Uncategorized'}
                  </span>
                  <span style={{ 
                    background: product.quantity > 0 ? '#dcfce7' : '#fee2e2', 
                    color: product.quantity > 0 ? '#166534' : '#991b1b', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '2.25rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.2 }}>
                  {product.name}
                </h2>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>
                  ₹{Number(product.price).toFixed(2)}
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', color: '#1e293b', marginBottom: '0.75rem', fontWeight: 600 }}>About this product</h3>
                <p style={{ color: '#475569', lineHeight: '1.7', margin: 0, fontSize: '1rem' }}>
                  {product.description || 'No detailed description provided for this product.'}
                </p>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '2.5rem', 
                padding: '1.5rem', 
                background: '#f8fafc', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.375rem', fontWeight: 500 }}>Inventory</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{product.quantity} units</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.375rem', fontWeight: 500 }}>Added</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                    {new Date(product.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.375rem', fontWeight: 500 }}>Last Updated</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                    {new Date(product.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ 
                    flex: 1, 
                    padding: '0.875rem', 
                    background: '#2563eb', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 600, 
                    fontSize: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)'
                  }}
                >
                  Edit Product
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'white',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    opacity: deleteMutation.isPending ? 0.7 : 1,
                  }}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ 
          background: '#ffffff', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)', 
          padding: '2.5rem',
          border: '1px solid #f3f4f6'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '2rem', color: '#0f172a', fontSize: '1.75rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            Edit Product
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9375rem' }}>Product Name</label>
                <input
                  type="text"
                  {...register('name')}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem', color: '#0f172a', backgroundColor: '#f8fafc' }}
                />
                {errors.name && <p style={{ color: '#ef4444', margin: '0.375rem 0 0', fontSize: '0.875rem', fontWeight: 500 }}>{errors.name.message}</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9375rem' }}>Category</label>
                <select
                  {...register('categoryId')}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem', color: '#0f172a', backgroundColor: '#f8fafc' }}
                >
                  <option value="">No Category</option>
                  {categoriesData?.data.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p style={{ color: '#ef4444', margin: '0.375rem 0 0', fontSize: '0.875rem', fontWeight: 500 }}>{errors.categoryId.message}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9375rem' }}>Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem', color: '#0f172a', backgroundColor: '#f8fafc' }}
                />
                {errors.price && <p style={{ color: '#ef4444', margin: '0.375rem 0 0', fontSize: '0.875rem', fontWeight: 500 }}>{errors.price.message}</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9375rem' }}>Stock Quantity</label>
                <input
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem', color: '#0f172a', backgroundColor: '#f8fafc' }}
                />
                {errors.quantity && <p style={{ color: '#ef4444', margin: '0.375rem 0 0', fontSize: '0.875rem', fontWeight: 500 }}>{errors.quantity.message}</p>}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9375rem' }}>Description</label>
              <textarea
                {...register('description')}
                rows={4}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '1rem', color: '#0f172a', backgroundColor: '#f8fafc' }}
              />
              {errors.description && <p style={{ color: '#ef4444', margin: '0.375rem 0 0', fontSize: '0.875rem', fontWeight: 500 }}>{errors.description.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#334155', fontSize: '0.9375rem' }}>Product Image</label>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', padding: '1.5rem', border: '1px dashed #cbd5e1', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', color: '#475569' }}
                  />
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.75rem', lineHeight: 1.5 }}>
                    Upload a high-quality image of the product.<br/>Max size: 2MB. Supported formats: JPEG, PNG, WEBP.
                  </p>
                  {imageError && <p style={{ color: '#ef4444', margin: '0.5rem 0 0', fontSize: '0.875rem', fontWeight: 500 }}>{imageError}</p>}
                </div>
                
                <div style={{ minWidth: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {imagePreview && !removeImage && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setRemoveImage(true);
                        }}
                        style={{ 
                          position: 'absolute', top: '-10px', right: '-10px', 
                          width: '28px', height: '28px', borderRadius: '50%', 
                          background: '#ef4444', color: 'white', border: '2px solid white', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        title="Remove image"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                  {removeImage && (
                    <div style={{ color: '#b45309', background: '#fef3c7', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid #fde68a', textAlign: 'center', fontWeight: 500 }}>
                      Image will be removed upon saving
                    </div>
                  )}
                  {!imagePreview && !removeImage && (
                    <div style={{ width: '140px', height: '140px', borderRadius: '12px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>No image set</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                style={{
                  padding: '0.875rem 2.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  opacity: updateMutation.isPending ? 0.7 : 1,
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1)'
                }}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '0.875rem 2.5rem',
                  background: 'white',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
