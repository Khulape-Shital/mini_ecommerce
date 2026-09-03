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
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '2rem auto' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 className="text-h1" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Create Customer
        </h1>
        <p className="text-body mt-2">Add a new customer to your Shopora store.</p>
      </div>

      {mutation.isError && (
        <div style={{ marginBottom: '2rem', color: 'var(--danger)', padding: '1rem', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <span>Failed to create customer. {mutation.error instanceof Error ? mutation.error.message : ''}</span>
        </div>
      )}

      <div className="card glass-panel" style={{ padding: '2.5rem' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-col">
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Full Name</label>
            <input 
              {...register('name')} 
              className="form-input"
              placeholder="e.g. John Doe"
            />
            {errors.name && <span className="text-small" style={{ color: 'var(--danger)', marginTop: '0.5rem', display: 'block' }}>{errors.name.message}</span>}
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email"
              {...register('email')} 
              className="form-input"
              placeholder="e.g. john@example.com"
            />
            {errors.email && <span className="text-small" style={{ color: 'var(--danger)', marginTop: '0.5rem', display: 'block' }}>{errors.email.message}</span>}
          </div>
          
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label">Contact Number (Optional)</label>
            <input 
              {...register('contact')} 
              className="form-input"
              placeholder="e.g. +1 234 567 8900"
            />
            {errors.contact && <span className="text-small" style={{ color: 'var(--danger)', marginTop: '0.5rem', display: 'block' }}>{errors.contact.message}</span>}
          </div>

          <div className="flex gap-4" style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => navigate('/customers')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="btn btn-primary"
              style={{ cursor: mutation.isPending ? 'not-allowed' : 'pointer', opacity: mutation.isPending ? 0.8 : 1, minWidth: '140px' }}
            >
              {mutation.isPending ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
