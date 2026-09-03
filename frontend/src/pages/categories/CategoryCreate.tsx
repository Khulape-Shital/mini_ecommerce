import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoryApi } from '../../api/category';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name must be 100 characters or less'),
});

type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const CategoryCreate: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema)
  });

  const mutation = useMutation({
    mutationFn: (data: CreateCategoryInput) => categoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      navigate('/categories');
    },
  });

  const onSubmit = (data: CreateCategoryInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="text-h2">Create Category</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input 
              {...register('name')} 
              className="form-input"
              placeholder="e.g. Electronics"
            />
            {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{errors.name.message}</span>}
          </div>

          {mutation.isError && (
            <div style={{ color: 'var(--danger)', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)' }}>
              Failed to create category. {mutation.error instanceof Error ? mutation.error.message : ''}
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save Category'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/categories')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
