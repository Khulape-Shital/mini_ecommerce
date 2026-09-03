import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customerApi } from '../../api/customer';
import type { CreateCustomerInput } from '../../types/customer';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { PageHeader } from '../../components/ui/PageHeader';

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
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <PageHeader
          title="Create Customer"
          description="Add a new customer to your Shopora store."
        />
      </div>

      {mutation.isError && (
        <div style={{ marginBottom: '2rem', color: 'var(--danger)', padding: '1rem', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <span>Failed to create customer. {mutation.error instanceof Error ? mutation.error.message : ''}</span>
        </div>
      )}

      <div className="card glass-panel" style={{ padding: '2.5rem' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-col">
          <InputField
            label="Full Name"
            placeholder="e.g. Shital R Khulape"
            error={errors.name?.message}
            {...register('name')}
          />

          <InputField
            type="email"
            label="Email Address"
            placeholder="e.g. shital@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <InputField
            label="Contact Number (Optional)"
            placeholder="e.g. +1 234 567 8900"
            error={errors.contact?.message}
            {...register('contact')}
          />

          <div className="flex gap-4" style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              onClick={() => navigate('/customers')}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              variant="primary"
              style={{ minWidth: '140px' }}
            >
              {mutation.isPending ? 'Saving...' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
