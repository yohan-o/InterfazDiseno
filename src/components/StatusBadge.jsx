import React from 'react';
import '../styles/tokens.css';

const StatusBadge = ({ status, label }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'success': return 'var(--color-success)';
      case 'warning': return 'var(--color-warning)';
      case 'error': return 'var(--color-error)';
      case 'info': return 'var(--color-info)';
      default: return 'var(--color-secondary)';
    }
  };

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    borderRadius: 'var(--border-radius-pill)',
    fontSize: 'var(--font-size-sm)',
    fontFamily: 'var(--font-family-base)',
    fontWeight: 'bold',
    backgroundColor: getStatusColor(),
    color: 'var(--color-text-inverse)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <span style={style}>
      {label}
    </span>
  );
};

export default StatusBadge;
