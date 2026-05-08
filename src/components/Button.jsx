import React from 'react';
import '../styles/tokens.css';

const Button = ({ children, variant = 'primary', onClick, disabled }) => {
  const baseStyle = {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'var(--font-family-base)',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
    opacity: disabled ? 0.6 : 1,
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-text-inverse)',
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-text-inverse)',
    },
    secondary: {
      backgroundColor: 'transparent',
      border: '1px solid var(--color-primary)',
      color: 'var(--color-primary)',
    }
  };

  return (
    <button 
      style={{ ...baseStyle, ...variantStyles[variant] }} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
