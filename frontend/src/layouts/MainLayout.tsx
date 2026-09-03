import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/shop', label: 'Shop', icon: '🛍️' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/categories', label: 'Categories', icon: '🏷️' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/orders', label: 'Orders', icon: '🛒' },
  ];

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside 
        style={{ 
          width: '260px', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="text-h2" style={{ color: 'var(--accent-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>✨</span> Nexus
          </h2>
        </div>
        
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link 
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? '600' : '500',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-4">
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              AD
            </div>
            <div>
              <div className="text-body" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Admin User</div>
              <div className="text-small">admin@nexus.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
        <header 
          style={{ 
            height: '73px', 
            borderBottom: '1px solid var(--border-color)', 
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 2rem'
          }}
        >
          <div className="flex items-center gap-4">
            <button className="btn btn-secondary" style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem', width: '40px', height: '40px' }}>
              🔔
            </button>
          </div>
        </header>
        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
