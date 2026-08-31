import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customerApi } from '../../api/customer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import type { UpdateCustomerInput } from '../../types/customer';

const updateCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  email: z.string().email('Invalid email address').optional(),
  contact: z.string().optional(),
});

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerApi.getCustomerById(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateCustomerInput>({
    resolver: zodResolver(updateCustomerSchema),
    values: data?.data ? {
      name: data.data.name,
      email: data.data.email,
      contact: data.data.contact || '',
    } : undefined
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCustomerInput) => customerApi.updateCustomer(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => customerApi.deleteCustomer(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay message={error instanceof Error ? error.message : 'Failed to fetch customer'} />;
  if (!data?.data) return <ErrorDisplay message="Customer not found" />;

  const onSubmit = (formData: UpdateCustomerInput) => {
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Customer Details</h1>
        <div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              style={{ background: '#007bff', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
            >
              Edit
            </button>
          )}
          <button 
            onClick={handleDelete}
            style={{ background: '#dc3545', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
      </div>

      {!isEditing ? (
        <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '4px' }}>
          <p><strong>ID:</strong> {data.data.id}</p>
          <p><strong>Name:</strong> {data.data.name}</p>
          <p><strong>Email:</strong> {data.data.email}</p>
          <p><strong>Contact:</strong> {data.data.contact || '-'}</p>
          <p><strong>Created At:</strong> {new Date(data.data.createdAt).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(data.data.updatedAt).toLocaleString()}</p>
          <button 
            onClick={() => navigate('/customers')}
            style={{ marginTop: '2rem', background: '#6c757d', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Back to List
          </button>
        </div>
      ) : (
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

          {updateMutation.isError && (
            <div style={{ color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px' }}>
              Failed to update customer. {updateMutation.error instanceof Error ? updateMutation.error.message : ''}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="submit" 
              disabled={updateMutation.isPending}
              style={{ background: '#28a745', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: updateMutation.isPending ? 'not-allowed' : 'pointer' }}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                reset();
                setIsEditing(false);
              }}
              style={{ background: '#6c757d', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
