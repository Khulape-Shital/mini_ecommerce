import React, { type ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  style,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary';
      case 'secondary': return 'btn-secondary';
      case 'danger': return 'btn-danger';
      case 'outline': return 'btn-outline';
      case 'ghost': return 'btn-ghost';
      default: return 'btn-primary';
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm': return { padding: '0.35rem 0.75rem', fontSize: '0.875rem' };
      case 'lg': return { padding: '0.875rem 1.5rem', fontSize: '1.125rem' };
      case 'md':
      default: return {}; // Use default btn styles from CSS
    }
  };

  const variantClass = getVariantClass();
  const sizeStyles = getSizeStyles();

  return (
    <button
      className={`btn ${variantClass} ${className}`.trim()}
      style={{ ...sizeStyles, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};
