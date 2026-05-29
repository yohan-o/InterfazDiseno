import React from "react";

const PRIMARY = '#003366';
const WARN    = '#D48B00';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";

export default function LocalAlerts({ alerts = [] }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,51,102,0.08)', fontFamily: FONT }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: PRIMARY, display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚠️ Alarmas Locales
        {alerts.length > 0 && (
          <span style={{
            background: '#fdf3e0', color: WARN,
            padding: '2px 8px', borderRadius: '12px',
            fontSize: '12px', fontWeight: 700,
            border: `1px solid ${WARN}40`,
          }}>
            {alerts.length}
          </span>
        )}
      </h3>

      {alerts.map((alert, index) => (
        <div key={index} style={{
          padding: '14px 16px', background: '#fdf3e0',
          border: `1px solid ${WARN}50`, borderRadius: '8px',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          marginBottom: index < alerts.length - 1 ? '10px' : '0',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: WARN, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, flexShrink: 0,
          }}>
            !
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '4px' }}>
              {alert.message}
            </div>
            <div style={{ fontSize: '11px', color: '#999', fontFamily: MONO }}>{alert.time}</div>
          </div>
        </div>
      ))}

      {alerts.length === 0 && (
        <div style={{
          padding: '32px 20px', textAlign: 'center', color: '#aaa',
          background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee',
        }}>
          Sin alarmas activas
        </div>
      )}
    </div>
  );
}
