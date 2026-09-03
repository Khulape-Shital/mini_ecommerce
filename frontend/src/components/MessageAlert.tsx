import React, { useState, useEffect } from 'react';

export type MessageAlertType = 'success' | 'error' | 'warning' | 'info';

export interface MessageAlertProps {
  type: MessageAlertType;
  message: string;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export const MessageAlert: React.FC<MessageAlertProps> = ({ type, message, onDismiss, dismissible = true }) => {
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
        return { bg: 'var(--accent-light, #e0e7ff)', text: 'var(--success, #22c55e)', border: 'var(--success, #22c55e)' };
      case 'error':
        return { bg: '#ffe6e6', text: 'var(--danger, #ef4444)', border: 'var(--danger, #ef4444)' };
      case 'warning':
        return { bg: '#fef3c7', text: 'var(--warning, #f59e0b)', border: 'var(--warning, #f59e0b)' };
      case 'info':
      default:
        return { bg: 'var(--bg-tertiary, #f1f5f9)', text: 'var(--text-primary, #0f172a)', border: 'var(--border-color, #e2e8f0)' };
    }
  };

  const styles = getStyles();

  return (
    <div style={{
      backgroundColor: styles.bg,
      color: styles.text,
      border: `1px solid ${styles.border}`,
      padding: '1rem',
      borderRadius: 'var(--radius-md, 8px)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.875rem'
    }}>
      <span>{message}</span>
      {dismissible && (
        <button 
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
            opacity: 0.7,
            padding: '0 0 0 1rem'
          }}
          aria-label="Dismiss message"
        >
          &times;
        </button>
      )}
    </div>
  );
};
