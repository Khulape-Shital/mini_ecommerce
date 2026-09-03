import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoryApi } from '../../api/category';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { PageHeader } from '../../components/ui/PageHeader';

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
      <PageHeader title="Create Category" titleSize="h2" />

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputField
            label="Name"
            placeholder="e.g. Electronics"
            error={errors.name?.message}
            {...register('name')}
          />

          {mutation.isError && (
            <div style={{ color: 'var(--danger)', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)' }}>
              Failed to create category. {mutation.error instanceof Error ? mutation.error.message : ''}
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <Button 
              type="submit" 
              variant="primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save Category'}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate('/categories')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
