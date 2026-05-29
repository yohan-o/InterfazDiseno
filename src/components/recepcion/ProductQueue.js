import React from "react";

const PRIMARY = '#003366';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";

export default function ProductQueue({ products = [] }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,51,102,0.08)', fontFamily: FONT }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: PRIMARY, display: 'flex', alignItems: 'center', gap: '8px' }}>
        📦 Productos en Cola
        <span style={{
          background: '#e8edf5', color: PRIMARY,
          padding: '2px 10px', borderRadius: '12px',
          fontSize: '12px', fontWeight: 700,
          border: `1px solid ${PRIMARY}30`,
        }}>
          {products.length}/1
        </span>
      </h3>

      {products.map((product, index) => (
        <div key={index} style={{
          padding: '14px 16px', background: '#f4f6f9', borderRadius: '8px',
          borderLeft: `5px solid ${PRIMARY}`,
          border: `1px solid #e0e6ef`,
          borderLeftWidth: '5px', borderLeftColor: PRIMARY,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: products.length > 1 ? '10px' : '0',
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: PRIMARY, marginBottom: '4px', fontFamily: MONO }}>
              {product.id}
            </div>
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '2px' }}>{product.status}</div>
            <div style={{ fontSize: '11px', color: '#999', fontFamily: MONO }}>Detectado: {product.time}</div>
          </div>
          <div style={{
            padding: '5px 12px', background: 'white',
            border: `1px solid #DADADA`, borderRadius: '8px',
            fontSize: '12px', fontWeight: 700, color: PRIMARY,
          }}>
            {product.state}
          </div>
        </div>
      ))}

      {products.length === 0 && (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#aaa' }}>
          No hay productos en cola
        </div>
      )}
    </div>
  );
}
