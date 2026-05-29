import React from "react";

const PRIMARY = '#003366';
const GREEN   = '#1A9E5A';
const ACCENT  = '#AD3333';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";

export default function StationStatus({ stationName = "D1", isActive = true }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,51,102,0.08)', fontFamily: FONT }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: PRIMARY, display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚡ Estado de Estación de Recepción
      </h3>

      <div style={{
        padding: '16px 20px', background: '#f4f6f9', borderRadius: '8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: `1px solid #e0e6ef`,
      }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: PRIMARY }}>
          Estación {stationName}
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700,
          background: isActive ? '#e8f5ee' : '#fdecea',
          color: isActive ? GREEN : ACCENT,
          border: `1px solid ${isActive ? GREEN : ACCENT}40`,
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          {isActive ? '● Activa' : '● Inactiva'}
        </div>
      </div>
    </div>
  );
}
