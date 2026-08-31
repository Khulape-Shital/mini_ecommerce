import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customerApi } from '../../api/customer';
import type { CreateCustomerInput } from '../../types/customer';

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  contact: z.string().optional(),
});

export const CustomerCreate: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema)
  });

  const mutation = useMutation({
    mutationFn: (data: CreateCustomerInput) => customerApi.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    },
  });

  const onSubmit = (data: CreateCustomerInput) => {
    mutation.mutate(data);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Create Customer</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
          <input 
            {...register('name')} 
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {errors.name && <span style={{ color: 'red' }}>{errors.name.message}</span>}
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input 
            type="email"
            {...register('email')} 
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {errors.email && <span style={{ color: 'red' }}>{errors.email.message}</span>}
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contact (Optional)</label>
          <input 
            {...register('contact')} 
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {errors.contact && <span style={{ color: 'red' }}>{errors.contact.message}</span>}
        </div>

        {mutation.isError && (
          <div style={{ color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px' }}>
            Failed to create customer. {mutation.error instanceof Error ? mutation.error.message : ''}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="submit" 
            disabled={mutation.isPending}
            style={{ background: '#28a745', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: mutation.isPending ? 'not-allowed' : 'pointer' }}
          >
            {mutation.isPending ? 'Saving...' : 'Save'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/customers')}
            style={{ background: '#6c757d', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
