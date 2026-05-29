import React from "react";

const PRIMARY = '#003366';
const NEUTRAL = '#DADADA';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";

export default function QRScanner({ onScan }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,51,102,0.08)', fontFamily: FONT }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: PRIMARY }}>
        📱 Sensor QR y Verificación
      </h3>
      <button
        onClick={onScan}
        style={{
          padding: '10px 20px', background: 'white', fontFamily: FONT,
          border: `1px solid ${NEUTRAL}`, borderRadius: '8px',
          fontSize: '13px', fontWeight: 700, color: PRIMARY,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          gap: '8px', transition: 'all 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#e8edf5'; e.currentTarget.style.borderColor = PRIMARY; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = NEUTRAL; }}
      >
        📷 Iniciar Escaneo QR
      </button>
    </div>
  );
}
