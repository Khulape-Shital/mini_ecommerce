import React, { useState, useEffect } from 'react';

export type MessageAlertType = 'success' | 'error' | 'warning' | 'info';

export interface MessageAlertProps {
  type: MessageAlertType;
  message: string;
  onDismiss?: () => void;
  dismissible?: boolean;
  actionText?: string;
  onAction?: () => void;
}

const icons = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
};

export const MessageAlert: React.FC<MessageAlertProps> = ({ type, message, onDismiss, dismissible = true, actionText, onAction }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Reset visibility if a new message comes in
  useEffect(() => {
    if (message) {
      setIsVisible(true);
    }
  }, [message]);

  if (!isVisible || !message) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return { 
          bg: '#ecfdf5', 
          text: '#065f46', 
          border: '#a7f3d0',
          iconColor: '#10b981'
        };
      case 'error':
        return { 
          bg: '#fef2f2', 
          text: '#991b1b', 
          border: '#fecaca',
          iconColor: '#ef4444'
        };
      case 'warning':
        return { 
          bg: '#fffbeb', 
          text: '#92400e', 
          border: '#fde68a',
          iconColor: '#f59e0b'
        };
      case 'info':
      default:
        return { 
          bg: '#eff6ff', 
          text: '#1e40af', 
          border: '#bfdbfe',
          iconColor: '#3b82f6'
        };
    }
  };

  const styles = getStyles();

  return (
    <div style={{
      backgroundColor: styles.bg,
      color: styles.text,
      border: `1px solid ${styles.border}`,
      padding: '1rem 1.25rem',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '1.25rem',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      fontSize: '0.925rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      lineHeight: '1.5',
      animation: 'fadeIn 0.3s ease-out',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative left accent border */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: styles.iconColor
      }} />

      <div style={{ color: styles.iconColor, flexShrink: 0, marginTop: '2px' }}>
        {icons[type] || icons.info}
      </div>

      <div style={{ flex: 1, fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>{message}</div>
        {actionText && onAction && (
          <div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              style={{
                background: styles.iconColor,
                color: 'white',
                border: 'none',
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8125rem',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {actionText}
            </button>
          </div>
        )}
      </div>

      {dismissible && (
        <button 
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: styles.text,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6,
            borderRadius: '4px',
            marginLeft: 'auto',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Dismiss message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};
