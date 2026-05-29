import React, { useState, useEffect, useCallback } from "react";

const PRIMARY  = '#003366';
const ACCENT   = '#AD3333';
const NEUTRAL  = '#DADADA';
const GREEN    = '#1A9E5A';
const WARN     = '#D48B00';
const FONT     = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO     = "'Roboto Mono', monospace";

const MAX_CAPACIDAD = 20; // 5 columnas × 4 filas de la matriz del almacén

// Mock data — misma estructura exacta que devuelve GET /inventario
const MOCK = [
  { id: 1,  sku: "CAJA-A101", pos_x: 0, pos_y: 0, status: "stored",     created_at: "2026-05-14T08:15:00" },
  { id: 2,  sku: "CAJA-A102", pos_x: 1, pos_y: 0, status: "stored",     created_at: "2026-05-14T09:20:00" },
  { id: 3,  sku: "CAJA-B201", pos_x: 2, pos_y: 1, status: "in_transit", created_at: "2026-05-15T10:05:00" },
  { id: 4,  sku: "CAJA-A103", pos_x: 0, pos_y: 2, status: "stored",     created_at: "2026-05-15T10:30:00" },
  { id: 5,  sku: "CAJA-C301", pos_x: 3, pos_y: 1, status: "stored",     created_at: "2026-05-15T11:00:00" },
  { id: 6,  sku: "CAJA-B202", pos_x: 1, pos_y: 3, status: "in_transit", created_at: "2026-05-15T11:45:00" },
  { id: 7,  sku: "CAJA-C302", pos_x: 4, pos_y: 0, status: "stored",     created_at: "2026-05-15T12:10:00" },
  { id: 8,  sku: "CAJA-A104", pos_x: 2, pos_y: 3, status: "stored",     created_at: "2026-05-15T13:00:00" },
  { id: 9,  sku: "CAJA-B203", pos_x: 3, pos_y: 0, status: "stored",     created_at: "2026-05-15T14:10:00" },
  { id: 10, sku: "CAJA-C303", pos_x: 4, pos_y: 2, status: "stored",     created_at: "2026-05-15T14:45:00" },
];

const STATUS_CFG = {
  stored:     { label: "En Estantería",  color: GREEN,  bg: "#e8f5ee" },
  in_transit: { label: "En Movimiento",  color: WARN,   bg: "#fff8e1" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, color: "#888", bg: "#f0f0f0" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "12px",
      fontSize: "11px", fontWeight: 700, fontFamily: FONT,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}40`,
    }}>
      {cfg.label}
    </span>
  );
}

export default function Almacenamiento() {
  const [inventario, setInventario] = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [search, setSearch]         = useState("");
  const [filtroStatus, setFiltro]   = useState("todos");
  const [isMobile, setIsMobile]     = useState(() => window.innerWidth < 768);
  const [ultimaActualizacion, setUltima] = useState(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchInventario = useCallback(async () => {
    try {
      const res  = await fetch("http://localhost:8000/inventario");
      if (!res.ok) throw new Error("error");
      const data = await res.json();
      setInventario(data.inventario || []);
    } catch {
      // Backend no disponible — mostrar datos de prueba
      setInventario(MOCK);
    } finally {
      setCargando(false);
      setUltima(new Date());
    }
  }, []);

  useEffect(() => {
    fetchInventario();
    const interval = setInterval(fetchInventario, 30000); // refresca cada 30 s
    return () => clearInterval(interval);
  }, [fetchInventario]);

  // Métricas
  const total       = inventario.length;
  const almacenados = inventario.filter(i => i.status === "stored").length;
  const enTransito  = inventario.filter(i => i.status === "in_transit").length;
  const ocupacion   = Math.min(Math.round((total / MAX_CAPACIDAD) * 100), 100);

  const barColor = ocupacion >= 80 ? ACCENT : ocupacion >= 50 ? WARN : GREEN;

  // Filtrado
  const filtrados = inventario.filter(item => {
    const matchSearch = item.sku?.toLowerCase().includes(search.toLowerCase()) ||
                        String(item.id).includes(search);
    const matchStatus = filtroStatus === "todos" || item.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ padding: isMobile ? "16px" : "28px", fontFamily: FONT, background: "#f4f6f9", minHeight: "100vh" }}>

      {/* TÍTULO */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? "20px" : "24px", fontWeight: 700, color: PRIMARY }}>
            Inventario del Almacén
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#777" }}>
            Estado en tiempo real · solo lectura
          </p>
        </div>
        {ultimaActualizacion && (
          <span style={{ fontSize: "11px", color: "#aaa", fontFamily: MONO }}>
            Actualizado: {ultimaActualizacion.toLocaleTimeString("es-CO")}
          </span>
        )}
      </div>

      {/* TARJETAS DE STATS */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Total registros",  value: total,       color: PRIMARY },
          { label: "En Estantería",    value: almacenados, color: GREEN   },
          { label: "En Movimiento",    value: enTransito,  color: WARN    },
          { label: "Capacidad usada",  value: `${ocupacion}%`, color: barColor },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: "1 1 140px", background: "white", borderRadius: "10px",
            padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            borderTop: `4px solid ${color}`,
          }}>
            <div style={{ fontSize: "26px", fontWeight: 700, fontFamily: MONO, color }}>{value}</div>
            <div style={{ fontSize: "12px", color: "#777", marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* BARRA DE OCUPACIÓN */}
      <div style={{ background: "white", borderRadius: "10px", padding: "18px 22px", marginBottom: "22px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: PRIMARY }}>Porcentaje de Ocupación</span>
          <span style={{ fontSize: "13px", fontFamily: MONO, color: barColor, fontWeight: 700 }}>
            {total} / {MAX_CAPACIDAD} posiciones · {ocupacion}%
          </span>
        </div>
        <div style={{ background: NEUTRAL, borderRadius: "8px", height: "14px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${ocupacion}%`,
            background: `linear-gradient(90deg, ${PRIMARY}, ${barColor})`,
            borderRadius: "8px", transition: "width 0.6s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
          {["0%", "25%", "50%", "75%", "100%"].map(p => (
            <span key={p} style={{ fontSize: "11px", color: "#aaa", fontFamily: MONO }}>{p}</span>
          ))}
        </div>
      </div>

      {/* TABLA */}
      <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>

        {/* Barra de filtros */}
        <div style={{
          padding: "14px 20px", borderBottom: `1px solid ${NEUTRAL}`,
          display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center",
        }}>
          <input
            type="text"
            placeholder="Buscar por ID o Código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: "160px", padding: "8px 12px",
              border: `1px solid ${NEUTRAL}`, borderRadius: "8px",
              fontSize: "13px", fontFamily: FONT, outline: "none",
            }}
            onFocus={e => e.target.style.borderColor = PRIMARY}
            onBlur={e  => e.target.style.borderColor = NEUTRAL}
          />
          <select
            value={filtroStatus}
            onChange={e => setFiltro(e.target.value)}
            style={{
              padding: "8px 12px", border: `1px solid ${NEUTRAL}`, borderRadius: "8px",
              fontSize: "13px", fontFamily: FONT, background: "white",
              color: "#333", cursor: "pointer",
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="stored">En Estantería</option>
            <option value="in_transit">En Movimiento</option>
          </select>
          <button
            onClick={fetchInventario}
            style={{
              padding: "8px 16px", border: `1px solid ${PRIMARY}`, borderRadius: "8px",
              background: "white", color: PRIMARY, fontSize: "13px",
              fontFamily: FONT, cursor: "pointer", fontWeight: 600,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.target.style.background = PRIMARY; e.target.style.color = "white"; }}
            onMouseLeave={e => { e.target.style.background = "white"; e.target.style.color = PRIMARY; }}
          >
            Actualizar
          </button>
          <span style={{ fontSize: "12px", color: "#aaa", whiteSpace: "nowrap" }}>
            {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Contenido */}
        {cargando ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#aaa", fontFamily: FONT }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
            Cargando inventario...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: PRIMARY }}>
                  {[
                    { label: "ID",              hint: "Identificador interno del almacén" },
                    { label: "Código",          hint: "Código de venta del producto (SKU)" },
                    { label: "Pos. X",          hint: "Columna en la matriz del almacén" },
                    { label: "Pos. Y",          hint: "Fila en la matriz del almacén" },
                    { label: "Estado",          hint: "En estantería o en movimiento" },
                    { label: "Fecha de ingreso",hint: "Cuándo ingresó al sistema" },
                  ].map(({ label, hint }) => (
                    <th
                      key={label}
                      title={hint}
                      style={{
                        padding: "12px 16px", textAlign: "left", color: "white",
                        fontFamily: FONT, fontWeight: 600, fontSize: "12px",
                        whiteSpace: "nowrap", letterSpacing: "0.4px",
                        cursor: "help",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "52px", textAlign: "center", color: "#bbb", fontFamily: FONT }}>
                      <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
                      No hay registros que coincidan con los filtros
                    </td>
                  </tr>
                ) : filtrados.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      background: idx % 2 === 0 ? "white" : "#fafbfc",
                      borderBottom: `1px solid ${NEUTRAL}`,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#eef2f8"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#fafbfc"}
                  >
                    {/* ID */}
                    <td style={{ padding: "12px 16px", fontFamily: MONO, color: "#999", fontSize: "12px" }}>
                      #{item.id}
                    </td>
                    {/* Código / SKU */}
                    <td style={{ padding: "12px 16px", fontFamily: MONO, fontWeight: 700, color: PRIMARY }}>
                      {item.sku}
                    </td>
                    {/* Pos X */}
                    <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: MONO, fontSize: "14px" }}>
                      {item.pos_x}
                    </td>
                    {/* Pos Y */}
                    <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: MONO, fontSize: "14px" }}>
                      {item.pos_y}
                    </td>
                    {/* Status */}
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={item.status} />
                    </td>
                    {/* Created_at */}
                    <td style={{ padding: "12px 16px", color: "#555", whiteSpace: "nowrap", fontSize: "12px", fontFamily: MONO }}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("es-CO", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
