import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import type { CreateProductInput } from '../../types/product';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { useQuery } from '@tanstack/react-query';

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  price: z.number({ message: 'Price must be a number' }).min(0, 'Price must be greater than or equal to 0'),
  quantity: z.number({ message: 'Quantity must be a number' }).int().min(0, 'Quantity cannot be negative'),
  categoryId: z.string().uuid('Invalid category ID').optional().or(z.literal('')),
});

type CreateProductFormValues = z.infer<typeof createProductSchema>;

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      categoryId: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProductInput) => productApi.createProduct(data),
    onSuccess: (data) => {
      navigate(`/products/${data.data.id}`);
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const onSubmit = (data: CreateProductFormValues) => {
    const payload: CreateProductInput = {
      name: data.name,
      price: data.price,
      quantity: data.quantity,
    };
    
    if (data.description) {
      payload.description = data.description;
    }
    
    if (data.categoryId && data.categoryId.trim() !== '') {
      payload.categoryId = data.categoryId;
    }

    mutation.mutate(payload);
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '2rem' }}>Create Product</h1>

      {mutation.isError && (
        <div style={{ marginBottom: '1rem' }}>
          <ErrorDisplay message={mutation.error instanceof Error ? mutation.error.message : 'Failed to create product'} />
        </div>
      )}

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
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category (optional)</label>
          <select
            {...register('categoryId')}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">No Category</option>
            {categoriesData?.data.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <p style={{ color: 'red', margin: '0.25rem 0 0' }}>{errors.categoryId.message}</p>}
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              opacity: mutation.isPending ? 0.7 : 1,
            }}
          >
            {mutation.isPending ? 'Creating...' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
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
    </div>
  );
};
