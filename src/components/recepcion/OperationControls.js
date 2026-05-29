import React from "react";

const PRIMARY = '#003366';
const ACCENT  = '#AD3333';
const GREEN   = '#1A9E5A';
const NEUTRAL = '#DADADA';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";

export default function OperationControls({ onStart, onCallRobot, onPause, onAbort }) {
  const buttons = [
    {
      label: '▶ Iniciar',
      onClick: onStart,
      bg: GREEN, bgHover: '#157a46',
      color: 'white', border: 'none',
    },
    {
      label: '🤖 Llamar Robot',
      onClick: onCallRobot,
      bg: PRIMARY, bgHover: '#00204d',
      color: 'white', border: 'none',
    },
    {
      label: '⏸ Pausar',
      onClick: onPause,
      bg: 'white', bgHover: '#f4f6f9',
      color: PRIMARY, border: `1px solid ${NEUTRAL}`,
    },
    {
      label: '⏹ Abortar',
      onClick: onAbort,
      bg: ACCENT, bgHover: '#8B1A1A',
      color: 'white', border: 'none',
    },
  ];

  return (
    <div style={{
      background: 'white', borderRadius: '12px', padding: '18px 20px',
      boxShadow: '0 2px 8px rgba(0,51,102,0.08)', fontFamily: FONT,
    }}>
      <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: PRIMARY }}>
        Control de Operación
      </h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {buttons.map(({ label, onClick, bg, bgHover, color, border }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              padding: '10px 20px', background: bg, color, border,
              borderRadius: '8px', fontSize: '13px', fontWeight: 700,
              fontFamily: FONT, cursor: 'pointer', transition: 'all 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = bgHover}
            onMouseLeave={e => e.currentTarget.style.background = bg}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
