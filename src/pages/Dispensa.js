import React, { useState, useEffect } from "react";

const PRIMARY = '#003366';
const ACCENT  = '#AD3333';
const NEUTRAL = '#DADADA';
const GREEN   = '#1A9E5A';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";

const STORAGE_KEY = 'asrs_productos';

function loadProductos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveProductos(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const EMPTY_FORM = { codigo: '', peso: '', cantidad: '', precio: '' };

export default function Dispensa() {
  const [productos, setProductos] = useState(loadProductos);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [enviando, setEnviando]   = useState(false);
  const [errores, setErrores]     = useState({});
  const [exito, setExito]         = useState('');
  const [isMobile, setIsMobile]   = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    saveProductos(productos);
  }, [productos]);

  function validar() {
    const e = {};
    if (!form.codigo.trim())              e.codigo   = 'El código es obligatorio.';
    if (!form.peso || isNaN(form.peso) || Number(form.peso) <= 0)
                                          e.peso     = 'Ingresa un peso válido (kg).';
    if (!form.cantidad || isNaN(form.cantidad) || !Number.isInteger(Number(form.cantidad)) || Number(form.cantidad) <= 0)
                                          e.cantidad = 'Ingresa una cantidad entera positiva.';
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0)
                                          e.precio   = 'Ingresa un precio válido.';
    return e;
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setExito('');
    const e2 = validar();
    if (Object.keys(e2).length) { setErrores(e2); return; }
    setErrores({});
    setEnviando(true);

    let idBackend = null;
    let posicion  = null;

    try {
      // Enviar código al backend — guarda en tabla inventory
      const res = await fetch('http://localhost:8000/ordenar_paquete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: form.codigo.trim(), peso: Number(form.peso) }),
      });
      if (res.ok) {
        const data = await res.json();
        idBackend = data.id_paquete;
        posicion  = data.asignacion_fifo
          ? `(${data.asignacion_fifo.x}, ${data.asignacion_fifo.y})`
          : '—';
      }
    } catch {
      // Backend no disponible — solo guarda localmente
    }

    // Guardar producto completo en localStorage
    const nuevo = {
      id:         idBackend ?? Date.now(),
      codigo:     form.codigo.trim(),
      peso:       Number(form.peso),
      cantidad:   Number(form.cantidad),
      precio:     Number(form.precio),
      posicion:   posicion ?? 'Sin asignar',
      enBackend:  idBackend !== null,
      created_at: new Date().toISOString(),
    };

    setProductos(prev => [nuevo, ...prev]);
    setForm(EMPTY_FORM);
    setExito(`Producto "${nuevo.codigo}" registrado exitosamente.`);
    setEnviando(false);

    setTimeout(() => setExito(''), 4000);
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (errores[field]) setErrores(e => ({ ...e, [field]: undefined }));
  }

  function handleEliminar(id) {
    setProductos(prev => prev.filter(p => p.id !== id));
  }

  const totalProductos  = productos.length;
  const totalCantidad   = productos.reduce((s, p) => s + p.cantidad, 0);
  const totalValor      = productos.reduce((s, p) => s + p.precio * p.cantidad, 0);
  const enBackendCount  = productos.filter(p => p.enBackend).length;

  return (
    <div style={{ padding: isMobile ? '16px' : '28px', fontFamily: FONT, background: '#f4f6f9', minHeight: '100vh' }}>

      {/* TÍTULO */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: PRIMARY }}>
          Creación de Producto
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
          Registra un nuevo producto en el sistema. Se almacenará en el backend y quedará disponible para el almacén.
        </p>
      </div>

      {/* ESTADÍSTICAS */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Productos registrados', value: totalProductos,                color: PRIMARY },
          { label: 'Unidades totales',      value: totalCantidad,                 color: GREEN   },
          { label: 'Valor total inventario',value: `$${totalValor.toLocaleString('es-CO')}`, color: '#1565C0' },
          { label: 'Guardados en backend',  value: enBackendCount,                color: '#6A1B9A' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: 1, minWidth: '140px',
            background: 'white', borderRadius: '10px', padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: `4px solid ${color}`,
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: MONO, color }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '340px 1fr',
        gap: '22px', alignItems: 'start',
      }}>

        {/* ── FORMULARIO ── */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ background: PRIMARY, padding: '16px 20px' }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '15px', fontWeight: 700 }}>
              Nuevo Producto
            </h3>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              Complete todos los campos para registrar el producto
            </p>
          </div>

          <form onSubmit={handleGuardar} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Código */}
            <Field label="Código del Producto *" error={errores.codigo}>
              <input
                type="text"
                placeholder="Ej: CAJA-A101"
                value={form.codigo}
                onChange={e => handleChange('codigo', e.target.value)}
                style={inputStyle(!!errores.codigo, MONO)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e  => e.target.style.borderColor = errores.codigo ? ACCENT : NEUTRAL}
              />
            </Field>

            {/* Peso */}
            <Field label="Peso (kg) *" error={errores.peso}>
              <input
                type="number"
                placeholder="Ej: 2.5"
                min="0.01" step="0.01"
                value={form.peso}
                onChange={e => handleChange('peso', e.target.value)}
                style={inputStyle(!!errores.peso, MONO)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e  => e.target.style.borderColor = errores.peso ? ACCENT : NEUTRAL}
              />
            </Field>

            {/* Cantidad */}
            <Field label="Cantidad (unidades) *" error={errores.cantidad}>
              <input
                type="number"
                placeholder="Ej: 10"
                min="1" step="1"
                value={form.cantidad}
                onChange={e => handleChange('cantidad', e.target.value)}
                style={inputStyle(!!errores.cantidad, MONO)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e  => e.target.style.borderColor = errores.cantidad ? ACCENT : NEUTRAL}
              />
            </Field>

            {/* Precio */}
            <Field label="Precio unitario ($) *" error={errores.precio}>
              <input
                type="number"
                placeholder="Ej: 15000"
                min="0.01" step="0.01"
                value={form.precio}
                onChange={e => handleChange('precio', e.target.value)}
                style={inputStyle(!!errores.precio, MONO)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e  => e.target.style.borderColor = errores.precio ? ACCENT : NEUTRAL}
              />
            </Field>

            {/* Mensaje éxito */}
            {exito && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px',
                background: '#e8f5ee', border: `1px solid ${GREEN}50`,
                color: GREEN, fontSize: '13px',
              }}>
                {exito}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={enviando}
              style={{
                padding: '12px', borderRadius: '8px', border: 'none',
                background: enviando ? '#aaa' : PRIMARY,
                color: 'white', fontWeight: 700, fontSize: '14px',
                fontFamily: FONT, cursor: enviando ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s', marginTop: '4px',
              }}
              onMouseEnter={e => { if (!enviando) e.target.style.background = '#00408a'; }}
              onMouseLeave={e => { if (!enviando) e.target.style.background = PRIMARY; }}
            >
              {enviando ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </form>
        </div>

        {/* ── TABLA DE PRODUCTOS ── */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{
            padding: '16px 20px', borderBottom: `1px solid ${NEUTRAL}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: PRIMARY }}>
              Productos Registrados
            </h3>
            {totalProductos > 0 && (
              <span style={{
                padding: '3px 10px', borderRadius: '12px', fontSize: '12px',
                fontWeight: 700, color: PRIMARY, background: '#e8edf5',
                border: `1px solid ${PRIMARY}30`,
              }}>
                {totalProductos} producto{totalProductos !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {productos.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#bbb' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
              <div style={{ fontSize: '14px' }}>No hay productos registrados aún</div>
              <div style={{ fontSize: '12px', marginTop: '6px', color: '#ccc' }}>
                Usa el formulario para registrar el primer producto
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: PRIMARY, color: 'white' }}>
                    {['ID', 'Código', 'Peso (kg)', 'Cantidad', 'Precio unit.', 'Valor total', 'Posición', 'Backend', 'Fecha', ''].map(col => (
                      <th key={col} style={{
                        padding: '11px 14px', textAlign: 'left',
                        fontFamily: FONT, fontWeight: 600,
                        fontSize: '12px', whiteSpace: 'nowrap',
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, idx) => (
                    <tr key={p.id} style={{
                      background: idx % 2 === 0 ? 'white' : '#fafbfc',
                      borderBottom: `1px solid ${NEUTRAL}`,
                    }}>
                      <td style={{ padding: '11px 14px', fontFamily: MONO, color: '#888', fontSize: '12px' }}>
                        #{p.id}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: MONO, fontWeight: 700, color: PRIMARY }}>
                        {p.codigo}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: MONO, textAlign: 'right' }}>
                        {p.peso.toLocaleString('es-CO')}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: MONO, textAlign: 'right' }}>
                        {p.cantidad.toLocaleString('es-CO')}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: MONO, textAlign: 'right' }}>
                        ${p.precio.toLocaleString('es-CO')}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: MONO, textAlign: 'right', fontWeight: 600, color: '#1565C0' }}>
                        ${(p.precio * p.cantidad).toLocaleString('es-CO')}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: MONO, fontSize: '12px', color: '#555' }}>
                        {p.posicion}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 8px', borderRadius: '10px',
                          fontSize: '11px', fontWeight: 700, fontFamily: FONT,
                          color: p.enBackend ? GREEN : '#888',
                          background: p.enBackend ? '#e8f5ee' : '#f0f0f0',
                          border: `1px solid ${p.enBackend ? GREEN : '#ccc'}40`,
                        }}>
                          {p.enBackend ? 'Sí' : 'Local'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#777', whiteSpace: 'nowrap', fontSize: '11px', fontFamily: MONO }}>
                        {new Date(p.created_at).toLocaleString('es-CO', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <button
                          onClick={() => handleEliminar(p.id)}
                          title="Eliminar"
                          style={{
                            padding: '4px 10px', border: `1px solid ${ACCENT}50`,
                            borderRadius: '6px', background: 'white',
                            color: ACCENT, fontSize: '12px', cursor: 'pointer',
                            fontFamily: FONT,
                          }}
                          onMouseEnter={e => e.target.style.background = '#fdecea'}
                          onMouseLeave={e => e.target.style.background = 'white'}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers de estilo ──────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '13px', fontWeight: 600,
        color: '#444', marginBottom: '6px',
        fontFamily: "'Century Gothic', Candara, 'Trebuchet MS', sans-serif",
      }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#AD3333' }}>{error}</p>
      )}
    </div>
  );
}

function inputStyle(hasError, fontFamily = 'inherit') {
  return {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    border: `1px solid ${hasError ? '#AD3333' : '#DADADA'}`,
    borderRadius: '8px', fontSize: '14px', fontFamily,
    outline: 'none', transition: 'border-color 0.2s',
  };
}
