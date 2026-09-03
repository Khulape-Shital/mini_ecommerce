import React, { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  titleSize?: 'h1' | 'h2' | 'h3';
  children?: ReactNode; // For actions/buttons
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  titleSize = 'h1',
  children 
}) => {
  return (
    <div 
      className="page-header" 
      style={{
        padding: '2rem 2.5rem',
        borderRadius: '16px',
        marginBottom: '2.5rem',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4))',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center'
      }}
    >
      {/* Decorative gradient orb */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-50px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
        opacity: 0.7,
        zIndex: 0,
        pointerEvents: 'none',
        borderRadius: '50%'
      }}></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h1 
          className={`text-${titleSize}`}
          style={{ 
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            lineHeight: 1.2
          }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-body" style={{ color: 'var(--text-secondary)', fontWeight: 500, margin: 0, maxWidth: '600px' }}>
            {description}
          </p>
        )}
      </div>
      
      {children && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};

