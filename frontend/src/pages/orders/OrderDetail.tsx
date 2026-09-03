import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../api/order';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { MessageAlert } from '../../components/MessageAlert';
import { Button } from '../../components/ui/Button';
import { Dropdown } from '../../components/ui/Dropdown';
import { PageHeader } from '../../components/ui/PageHeader';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: []
};

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrderById(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => orderApi.updateOrderStatus(id!, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      setMessage({ type: 'success', text: 'Order status updated successfully' });
    },
    onError: (err: any) => {
      const serverMessage = err.response?.data?.error?.message || err.response?.data?.message;
      setMessage({ type: 'error', text: 'Failed to update status: ' + (serverMessage || err.message) });
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay message={error instanceof Error ? error.message : 'Failed to fetch order'} />;
  if (!data?.data) return <ErrorDisplay message="Order not found" />;

  const order = data.data;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="Order Details">
        <Button className="btn btn-secondary" onClick={() => navigate('/orders')}>Back to Orders</Button>
      </PageHeader>

      {message && (
        <MessageAlert 
          type={message.type} 
          message={message.text} 
          onDismiss={() => setMessage(null)} 
        />
      )}

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="text-h3" style={{ marginBottom: '0.5rem' }}>Order #{order.id.substring(0, 8)}</h2>
            <p className="text-body-secondary">Date: {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Status:</label>
              <Dropdown 
                className="form-select"
                value={order.status}
                onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                disabled={updateStatusMutation.isPending || VALID_TRANSITIONS[order.status]?.length === 0}
                options={[
                  ...([order.status, ...(VALID_TRANSITIONS[order.status] || [])].map(status => ({
                    value: status,
                    label: status
                  })))
                ]}
              />
            </div>
            {updateStatusMutation.isPending && <span className="text-body-secondary" style={{ fontSize: '0.8rem' }}>Updating...</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 className="text-h4" style={{ marginBottom: '0.5rem' }}>Customer Details</h3>
            <p><strong>Customer ID:</strong> {order.customerId}</p>
          </div>
          <div>
            <h3 className="text-h4" style={{ marginBottom: '0.5rem' }}>Shipping Details</h3>
            <p><strong>Status:</strong> {order.shipping?.status || 'N/A'}</p>
            <p><strong>Address:</strong> {order.shipping?.address || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h3 className="text-h4" style={{ marginBottom: '1rem' }}>Order Items</h3>
          {order.items && order.items.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.productId.substring(0, 8)}...</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitPrice}</td>
                    <td>₹{(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No items found.</p>
          )}
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
          <p><strong>Subtotal:</strong> ₹{(Number(order.total) + Number(order.discountAmount || 0)).toFixed(2)}</p>
          {order.discountAmount && Number(order.discountAmount) > 0 && (
            <p className="text-body-secondary"><strong>Discount:</strong> -₹{order.discountAmount}</p>
          )}
          <p className="text-h3" style={{ marginTop: '0.5rem' }}><strong>Total:</strong> ₹{order.total}</p>
        </div>
      </div>
    </div>
  );
};
