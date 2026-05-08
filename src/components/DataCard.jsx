import React from 'react';
import '../styles/tokens.css';

const DataCard = ({ title, value, unit, icon, children }) => {
  const cardStyle = {
    backgroundColor: 'var(--color-bg-surface)',
    borderRadius: 'var(--border-radius-md)',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
    fontFamily: 'var(--font-family-base)',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'var(--color-text-muted)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 500,
  };

  const valueContainerStyle = {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-xs)',
  };

  const valueStyle = {
    color: 'var(--color-text-main)',
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'bold',
    margin: 0,
  };

  const unitStyle = {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--font-size-sm)',
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span>{title}</span>
        {icon && <span>{icon}</span>}
      </div>
      <div style={valueContainerStyle}>
        <h3 style={valueStyle}>{value}</h3>
        {unit && <span style={unitStyle}>{unit}</span>}
      </div>
      {children && <div style={{marginTop: 'var(--spacing-sm)'}}>{children}</div>}
    </div>
  );
};

export default DataCard;
