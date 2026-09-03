import React, { type SelectHTMLAttributes, useId } from 'react';

export interface DropdownOption {
  value: string | number;
  label: string;
}

export interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: DropdownOption[];
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  required,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.25rem' }}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="form-label"
          style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`form-input ${className}`.trim()}
        style={{
          borderColor: error ? 'var(--danger)' : undefined,
          ...props.style
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};
