import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { productApi } from '../../api/product';
import type { UpdateProductInput } from '../../types/product';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';

const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  price: z.number({ message: 'Price must be a number' }).min(0, 'Price must be greater than or equal to 0'),
  quantity: z.number({ message: 'Quantity must be a number' }).int().min(0, 'Quantity cannot be negative'),
  categoryId: z.string().uuid('Invalid category ID').optional().or(z.literal('')),
});

type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id!),
    enabled: !!id,
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
        price: data.data.price,
        quantity: data.data.quantity,
        categoryId: data.data.categoryId || '',
      });
    }
  }, [data, isEditing, reset]);

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
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Product Detail</h1>
        <button
          onClick={() => navigate('/products')}
          style={{ padding: '0.5rem 1rem', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Back to List
        </button>
      </div>

      {updateMutation.isError && (
        <div style={{ marginBottom: '1rem' }}>
          <ErrorDisplay message={updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to update product'} />
        </div>
      )}

      {deleteMutation.isError && (
        <div style={{ marginBottom: '1rem' }}>
          <ErrorDisplay message={deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete product'} />
        </div>
      )}

      {!isEditing ? (
        <div>
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Description:</strong> {product.description || '-'}</p>
            <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
            <p><strong>Quantity:</strong> {product.quantity}</p>
            <p><strong>Category:</strong> {product.category?.name || product.categoryId || 'None'}</p>
            <p><strong>Created At:</strong> {new Date(product.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(product.updatedAt).toLocaleString()}</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{ padding: '0.75rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Edit Product
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: deleteMutation.isPending ? 0.7 : 1,
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
            <input
              type="text"
              {...register('name')}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            {errors.name && <p style={{ color: 'red', margin: '0.25rem 0 0' }}>{errors.name.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
            <textarea
              {...register('description')}
              rows={4}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            {errors.description && <p style={{ color: 'red', margin: '0.25rem 0 0' }}>{errors.description.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Price</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            {errors.price && <p style={{ color: 'red', margin: '0.25rem 0 0' }}>{errors.price.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Quantity</label>
            <input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            {errors.quantity && <p style={{ color: 'red', margin: '0.25rem 0 0' }}>{errors.quantity.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category ID (optional, UUID)</label>
            <input
              type="text"
              {...register('categoryId')}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            {errors.categoryId && <p style={{ color: 'red', margin: '0.25rem 0 0' }}>{errors.categoryId.message}</p>}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: updateMutation.isPending ? 0.7 : 1,
              }}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#e0e0e0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
