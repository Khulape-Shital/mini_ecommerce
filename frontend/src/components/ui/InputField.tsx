import React, { type InputHTMLAttributes, useId } from 'react';

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  className = '',
  id,
  required,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.25rem' }}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="form-label"
          style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        className={`form-input ${className}`.trim()}
        style={{
          borderColor: error ? 'var(--danger)' : undefined,
          ...props.style
        }}
        {...props}
      />
      {error && (
        <span style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};
