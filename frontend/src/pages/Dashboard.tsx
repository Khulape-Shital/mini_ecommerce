import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';

import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/order';
import { customerApi } from '../api/customer';

export const Dashboard: React.FC = () => {
  const { data: pendingOrders, isLoading: isLoadingPending } = useQuery({
    queryKey: ['dashboard_orders', 'PENDING'],
    queryFn: () => orderApi.getOrders({ limit: 1, status: 'PENDING' })
  });

  const { data: confirmedOrders, isLoading: isLoadingConfirmed } = useQuery({
    queryKey: ['dashboard_orders', 'CONFIRMED'],
    queryFn: () => orderApi.getOrders({ limit: 1, status: 'CONFIRMED' })
  });

  const { data: shippedOrders, isLoading: isLoadingShipped } = useQuery({
    queryKey: ['dashboard_orders', 'SHIPPED'],
    queryFn: () => orderApi.getOrders({ limit: 1, status: 'SHIPPED' })
  });

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['dashboard_customers'],
    queryFn: () => customerApi.getCustomers({ limit: 1 })
  });

  const { data: recentOrdersData, isLoading: isLoadingRecentOrders } = useQuery({
    queryKey: ['dashboard_recent_orders'],
    queryFn: () => orderApi.getOrders({ limit: 5 })
  });

  const { data: allOrdersData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['dashboard_revenue'],
    queryFn: () => orderApi.getOrders({ limit: 1000 })
  });

  const isLoadingOrders = isLoadingPending || isLoadingConfirmed || isLoadingShipped;
  const activeOrdersCount = (pendingOrders?.meta?.total || 0) + 
                            (confirmedOrders?.meta?.total || 0) + 
                            (shippedOrders?.meta?.total || 0);

  const totalRevenue = allOrdersData?.data
    ? allOrdersData.data
        .filter(order => order.status !== 'CANCELLED')
        .reduce((sum, order) => sum + Number(order.total), 0)
    : 0;


  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Welcome back to your Shopora store overview."
      >
        <div className="flex gap-4">
          <Link to="/products/new" className="btn btn-primary">
            + New Product
          </Link>
          <Link to="/orders" className="btn btn-secondary">
            View Orders
          </Link>
        </div>
      </PageHeader>

      <div className="dashboard-grid">
        {/* Metric Cards */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</h3>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
          </div>
          <div className="text-h2" style={{ color: 'var(--text-primary)' }}>
            {isLoadingRevenue ? '...' : `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="text-small" style={{ color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>↑</span> 20.1% from last month
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Orders</h3>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
          </div>
          <div className="text-h2" style={{ color: 'var(--text-primary)' }}>
            {isLoadingOrders ? '...' : activeOrdersCount}
          </div>
          <div className="text-small" style={{ color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>↑</span> 15% from last month
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Customers</h3>
            <span style={{ fontSize: '1.5rem' }}>👥</span>
          </div>
          <div className="text-h2" style={{ color: 'var(--text-primary)' }}>
            {isLoadingCustomers ? '...' : (customersData?.meta?.total || 0)}
          </div>
          <div className="text-small" style={{ color: 'var(--danger)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>↓</span> 2.1% from last month
          </div>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conversion Rate</h3>
            <span style={{ fontSize: '1.5rem' }}>📈</span>
          </div>
          <div className="text-h2" style={{ color: 'var(--text-primary)' }}>N/A</div>
          <div className="text-small" style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Visitor analytics not tracked</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="text-h3 mb-4">Recent Activity</h2>
        <div className="flex-col gap-4" style={{ marginTop: '1.5rem' }}>
          {isLoadingRecentOrders ? (
            <p className="text-body text-gray-500">Loading recent activity...</p>
          ) : recentOrdersData?.data && recentOrdersData.data.length > 0 ? (
            recentOrdersData.data.map((order, i) => (
              <div key={order.id} className="flex justify-between items-center" style={{ padding: '1rem 0', borderBottom: i === recentOrdersData.data.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }}></div>
                  <div>
                    <p style={{ fontWeight: '500' }}>New order #{order.id.substring(0, 8)}</p>
                    <p className="text-small">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span className="badge">{order.status}</span>
              </div>
            ))
          ) : (
            <p className="text-body text-gray-500">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
