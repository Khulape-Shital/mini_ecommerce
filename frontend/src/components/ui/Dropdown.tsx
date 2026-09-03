import React, { type SelectHTMLAttributes, useId, useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string | number;
  label: string;
}

export interface DropdownProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'options' | 'value' | 'defaultValue'> {
  label?: string;
  error?: string;
  options: DropdownOption[];
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  required,
  value,
  defaultValue,
  onChange,
  onBlur,
  name,
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | number>(
    value ?? defaultValue ?? ''
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Sync refs
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(selectRef.current);
    } else {
      ref.current = selectRef.current;
    }
  }, [ref]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync value if controlled or changed via RHF
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleSelect = (optionValue: string | number) => {
    setInternalValue(optionValue);
    setIsOpen(false);

    // Update the hidden native select manually to trigger RHF
    if (selectRef.current) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(selectRef.current, optionValue.toString());
      } else {
        selectRef.current.value = optionValue.toString();
      }
      
      // Dispatch change event for react-hook-form
      const event = new Event('change', { bubbles: true });
      selectRef.current.dispatchEvent(event);
    }
  };

  const selectedOption = options.find(opt => opt.value === internalValue) || 
                         (internalValue === '' && placeholder ? { label: placeholder, value: '' } : null);

  return (
    <div 
      className="form-group" 
      style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.25rem' }}
      ref={wrapperRef}
    >
      {label && (
        <label 
          htmlFor={selectId} 
          className="form-label"
          style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      {/* Hidden native select for form integration (e.g. react-hook-form) */}
      <select
        id={selectId}
        ref={selectRef}
        name={name}
        required={required}
        value={internalValue}
        onChange={(e) => {
          setInternalValue(e.target.value);
          if (onChange) onChange(e);
        }}
        onBlur={onBlur}
        {...props}
        style={{ display: 'none' }}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Custom UI */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`form-input ${className}`.trim()}
          style={{
            borderColor: error ? 'var(--danger)' : (isOpen ? 'var(--primary)' : 'var(--border-color)'),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: isOpen ? '0 0 0 3px rgba(67, 97, 238, 0.15)' : 'none',
            transition: 'all 0.2s ease',
            ...props.style
          }}
        >
          <span style={{ color: selectedOption ? 'inherit' : 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption ? selectedOption.label : (placeholder || 'Select an option')}
          </span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.2s ease',
              color: 'var(--text-secondary)',
              flexShrink: 0,
              marginLeft: '0.5rem'
            }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              maxHeight: '250px',
              overflowY: 'auto',
              animation: 'dropdownFadeIn 0.15s ease-out forwards'
            }}
          >
            <style>
              {`
                @keyframes dropdownFadeIn {
                  from { opacity: 0; transform: translateY(-4px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .dropdown-option {
                  padding: 0.625rem 1rem;
                  cursor: pointer;
                  transition: background-color 0.15s ease;
                }
                .dropdown-option:hover {
                  background-color: var(--bg-tertiary);
                }
                .dropdown-option.selected {
                  background-color: rgba(67, 97, 238, 0.1);
                  color: var(--accent-primary);
                  font-weight: 500;
                }
              `}
            </style>
            {options.length === 0 ? (
              <div style={{ padding: '0.75rem 1rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                No options available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  className={`dropdown-option ${internalValue === option.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <span style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';
