import React, { useState } from 'react';
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
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Dropdown } from '../../components/ui/Dropdown';

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  price: z.number({ message: 'Price must be a number' }).min(0, 'Price must be greater than or equal to 0'),
  quantity: z.number({ message: 'Quantity must be a number' }).int().min(0, 'Quantity cannot be negative'),
  categoryId: z.string().uuid('Invalid category ID').optional().or(z.literal('')),
  imageUrl: z.string().max(2800000, 'Image is too large (max 2MB)').optional().nullable(),
});

type CreateProductFormValues = z.infer<typeof createProductSchema>;

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

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
      imageUrl: null,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    
    if (!file) {
      setImagePreview(null);
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be less than 2MB');
      e.target.value = ''; // Reset input
      setImagePreview(null);
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Only JPEG, PNG and WEBP images are supported');
      e.target.value = ''; // Reset input
      setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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

    if (imagePreview) {
      payload.imageUrl = imagePreview;
    }

    mutation.mutate(payload);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="text-h2">Create Product</h1>
      </div>

      {mutation.isError && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorDisplay message={mutation.error instanceof Error ? mutation.error.message : 'Failed to create product'} />
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex-col">
          <InputField
            label="Name"
            type="text"
            placeholder="e.g. Wireless Headphones"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              placeholder="Describe the product..."
              {...register('description')}
              rows={4}
            />
            {errors.description && <p className="text-small" style={{ color: 'var(--danger)', marginTop: '0.25rem' }}>{errors.description.message}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Price</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>₹</span>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                  placeholder="0.00"
                  {...register('price', { valueAsNumber: true })}
                />
              </div>
              {errors.price && <p className="text-small" style={{ color: 'var(--danger)', marginTop: '0.25rem' }}>{errors.price.message}</p>}
            </div>

            <div style={{ marginBottom: 0 }}>
              <InputField
                label="Quantity"
                type="number"
                placeholder="0"
                error={errors.quantity?.message}
                {...register('quantity', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Dropdown
              label="Category (optional)"
              error={errors.categoryId?.message}
              {...register('categoryId')}
              options={[
                { value: '', label: 'No Category' },
                ...(categoriesData?.data || []).map(cat => ({
                  value: cat.id,
                  label: cat.name
                }))
              ]}
            />
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Product Image (optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="form-input"
              onChange={handleImageChange}
            />
            <p className="text-small" style={{ color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Max size: 2MB. Supported formats: JPEG, PNG, WEBP.</p>
            {imageError && <p className="text-small" style={{ color: 'var(--danger)', marginTop: '0.25rem' }}>{imageError}</p>}
            
            {imagePreview && (
              <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setImagePreview(null);
                  }}
                  style={{ position: 'absolute', top: '-10px', right: '-10px', padding: '0.25rem 0.5rem', borderRadius: '50%', background: 'var(--surface-color)' }}
                >
                  &times;
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-4" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
              style={{
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                opacity: mutation.isPending ? 0.7 : 1,
              }}
            >
              {mutation.isPending ? 'Creating...' : 'Create Product'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/products')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
