import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Almacenamiento from './Almacenamiento';
import Dispensa from './Dispensa';
import Recepcion from './recepcion';
import Robot from './robot';
import GestionUsuarios from './GestionUsuarios';
import AgvSupervisorWidget from '../components/AgvSupervisorWidget';

/* ── Paleta oficial Universidad de Pamplona ── */
const PRIMARY = '#003366';
const ACCENT  = '#AD3333';
const NEUTRAL = '#DADADA';
const GREEN   = '#1A9E5A';
const WARN    = '#D48B00';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";

const ROLE_META = {
  superadmin: { label: 'Super Admin',   color: ACCENT },
  admin:      { label: 'Administrador', color: WARN   },
  operario:   { label: 'Operario',      color: GREEN  }
};

const SIDEBAR_ITEMS = {
  operario: [
    { icon: '📊', label: 'Dashboard',    key: 'dashboard' },
    { icon: '📋', label: 'Crear Producto', key: 'dispensa' },
    { icon: '📦', label: 'Recepción',    key: 'recepcion' },
    { icon: '🗄️', label: 'Inventario',  key: 'almacenamiento' },
    { icon: '🤖', label: 'Robots',       key: 'robot' },
  ],
  admin: [
    { icon: '📊', label: 'Dashboard',     key: 'dashboard' },
    { icon: '📋', label: 'Crear Producto', key: 'dispensa' },
    { icon: '🗄️', label: 'Inventario',   key: 'almacenamiento' },
    { icon: '🤖', label: 'Robots',        key: 'robot' }
  ],
  superadmin: [
    { icon: '📊', label: 'Dashboard',    key: 'dashboard' },
    { icon: '📋', label: 'Crear Producto', key: 'dispensa' },
    { icon: '📦', label: 'Recepción',    key: 'recepcion' },
    { icon: '🗄️', label: 'Inventario',  key: 'almacenamiento' },
    { icon: '🤖', label: 'Robots',       key: 'robot' },
    { icon: '👥', label: 'Usuarios',     key: 'usuarios' },
  ]
};

/* ─────────────────────────────────────────────
   BARRA SUPERIOR
───────────────────────────────────────────── */
function TopBar({ user, hora, onLogout, isMobile, onToggleSidebar }) {
  const meta = ROLE_META[user?.role] || ROLE_META.operario;
  return (
    <div style={{
      background: PRIMARY, padding: '0 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      minHeight: '60px', position: 'sticky', top: 0, zIndex: 200,
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            style={{
              background: 'none', border: 'none', color: '#FFF',
              fontSize: '22px', cursor: 'pointer', padding: '4px 6px',
              lineHeight: 1, flexShrink: 0
            }}
          >☰</button>
        )}
        <img src="/logo_U_png.png" alt="UP" style={{
          height: '32px', width: 'auto', objectFit: 'contain',
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.22))'
        }} />
        {!isMobile && (
          <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '600', fontFamily: FONT }}>
            AS/RS · Sistema de Gestión de Almacén
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '14px' }}>
        {!isMobile && (
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: MONO }}>{hora}</span>
        )}
        <span style={{
          padding: '4px 10px', borderRadius: '8px',
          background: meta.color, color: '#FFF',
          fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
          letterSpacing: '0.5px', fontFamily: FONT, whiteSpace: 'nowrap'
        }}>
          {isMobile ? (user?.role === 'superadmin' ? 'SA' : user?.role === 'admin' ? 'ADM' : 'OP') : meta.label}
        </span>
        {!isMobile && (
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontFamily: FONT }}>
            {user?.nombre}
          </span>
        )}
        <button onClick={onLogout} style={{
          padding: isMobile ? '6px 10px' : '7px 14px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: '7px',
          color: '#FFF', fontSize: '12px', fontWeight: '500',
          cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          {isMobile ? 'Salir' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */
function Sidebar({ role, activeSection, onNavigate, isMobile, isOpen, onClose }) {
  const items = SIDEBAR_ITEMS[role] || [];
  return (
    <div style={{
      width: '200px',
      flexShrink: 0,
      background: '#FFFFFF',
      borderRight: '1px solid #DADADA',
      position: isMobile ? 'fixed' : 'sticky',
      top: isMobile ? 0 : '60px',
      left: 0,
      height: isMobile ? '100vh' : 'calc(100vh - 60px)',
      overflowY: 'auto',
      zIndex: isMobile ? 500 : 10,
      boxShadow: isMobile ? '4px 0 24px rgba(0,0,0,0.18)' : '2px 0 8px rgba(0,51,102,0.05)',
      transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
      transition: 'transform 0.25s ease',
    }}>
      {isMobile && (
        <div style={{
          padding: '14px 16px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid #EBEBEB', background: PRIMARY
        }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFF', fontFamily: FONT }}>
            Menú
          </span>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px', color: '#FFF', fontSize: '16px',
            cursor: 'pointer', padding: '2px 8px', lineHeight: 1
          }}>✕</button>
        </div>
      )}

      <div style={{ padding: isMobile ? '10px 12px' : '16px 12px 8px' }}>
        {!isMobile && (
          <p style={{
            margin: 0, fontSize: '10px', fontWeight: '700', color: '#AAAAAA',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            padding: '0 8px 8px', fontFamily: FONT
          }}>Módulos</p>
        )}
        {items.map(item => {
          const active = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { onNavigate(item.key); if (isMobile) onClose(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '10px', padding: '11px 12px', borderRadius: '8px',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: active ? 'rgba(0,51,102,0.08)' : 'transparent',
                color: active ? PRIMARY : '#555555',
                fontWeight: active ? '600' : '400',
                fontSize: '13px', fontFamily: FONT,
                transition: 'all 0.15s ease',
                borderLeft: active ? `3px solid ${PRIMARY}` : '3px solid transparent',
                marginBottom: '2px'
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F5F7FA'; e.currentTarget.style.color = PRIMARY; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555555'; }}}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 16px', borderTop: '1px solid #EBEBEB', background: '#FAFAFA'
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#999', fontFamily: FONT }}>Conectado como</p>
        <p style={{ margin: '2px 0 0', fontSize: '12px', fontWeight: '600', color: PRIMARY, fontFamily: MONO }}>
          {role}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VISTA OPERARIO
───────────────────────────────────────────── */
function OperarioView({ datos, hora, estadoSistema, conexion, isMobile }) {
  const { ocupacion, robotsActivos, dispensa, recepcion, alarmas } = datos;
  const hayAlarmas = estadoSistema.alarmasActivas > 0;
  const sistemaOk  = estadoSistema.estado === 'normal';

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 28px 48px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: PRIMARY, fontSize: isMobile ? '18px' : '22px', fontWeight: '700', fontFamily: FONT }}>
          Panel de Control Operativo
        </h1>
        <p style={{ margin: '6px 0 0', color: '#777', fontSize: '13px', fontFamily: FONT }}>
          Bienvenido. Revise el estado del sistema y los módulos disponibles.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: isMobile ? '10px' : '14px',
        marginBottom: '24px'
      }}>
        <StatusCard label="Nivel de Ocupación"     value={ocupacion.value}     sub={ocupacion.footer}     color={PRIMARY} icon="📦" />
        <StatusCard label="Robots Activos"          value={robotsActivos.value} sub={robotsActivos.footer} color={PRIMARY} icon="🤖" />
        <StatusCard label="Productos en Dispensa"   value={dispensa.value}      sub={dispensa.footer}      color={GREEN}   icon="🚚" />
        <StatusCard label="Productos en Recepción"  value={recepcion.value}     sub={recepcion.footer}     color={GREEN}   icon="🏪" />
        <StatusCard label="Estado del Sistema"
          value={sistemaOk ? 'OPERATIVO' : 'ADVERTENCIA'}
          sub={sistemaOk ? 'Todo funciona correctamente' : 'Revise las alarmas'}
          color={sistemaOk ? GREEN : WARN} icon={sistemaOk ? '✅' : '⚠️'} />
        <StatusCard label="Alarmas Activas" value={alarmas.value}
          sub={hayAlarmas ? 'Requiere atención' : 'Sistema en calma'}
          color={hayAlarmas ? ACCENT : GREEN} icon={hayAlarmas ? '🚨' : '🔕'} />
      </div>

      <div style={{
        background: '#FFFFFF', border: '1px solid #DADADA', borderRadius: '14px',
        padding: isMobile ? '16px' : '20px 28px', boxShadow: '0 2px 10px rgba(0,51,102,0.06)'
      }}>
        <h2 style={{ margin: '0 0 14px', color: PRIMARY, fontSize: '16px', fontWeight: '600', fontFamily: FONT }}>
          📡 Estado de Conexión
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
            borderRadius: '10px', flex: '1',
            background: conexion === 'estable' ? 'rgba(26,158,90,0.07)' : 'rgba(173,51,51,0.07)',
            border: `1px solid ${conexion === 'estable' ? 'rgba(26,158,90,0.3)' : 'rgba(173,51,51,0.3)'}`
          }}>
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
              background: conexion === 'estable' ? GREEN : ACCENT,
              boxShadow: conexion === 'estable' ? '0 0 8px rgba(26,158,90,0.5)' : '0 0 8px rgba(173,51,51,0.5)'
            }} />
            <div>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', fontFamily: FONT,
                color: conexion === 'estable' ? GREEN : ACCENT }}>
                Conexión {conexion}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#777', fontFamily: FONT }}>
                Actualización: <span style={{ fontFamily: MONO }}>{hora}</span>
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
            borderRadius: '10px', flex: '1',
            background: 'rgba(0,51,102,0.05)', border: '1px solid rgba(0,51,102,0.15)'
          }}>
            <span style={{ fontSize: '24px' }}>🏭</span>
            <div>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: PRIMARY, fontFamily: FONT }}>Sistema AS/RS</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#777', fontFamily: FONT }}>Etapa 2 — Operación activa</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nuevo Widget Supervisor AGV */}
      <AgvSupervisorWidget isMobile={isMobile} />
      
    </div>
  );
}

function StatusCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: '#FFFFFF', borderLeft: `4px solid ${color}`,
      border: `1px solid ${color}22`, borderRadius: '12px', padding: '14px 16px',
      boxShadow: '0 2px 8px rgba(0,51,102,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ fontSize: '11px', color: '#777', fontWeight: '500', fontFamily: FONT }}>{label}</span>
      </div>
      <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color, fontFamily: MONO, lineHeight: 1 }}>{value}</p>
      <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#777', fontFamily: FONT }}>{sub}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VISTA ADMIN
───────────────────────────────────────────── */
function AdminView({ datos, estadoSistema, conexion, hora, isMobile }) {
  const { ocupacion, robotsActivos, dispensa, recepcion, alarmas } = datos;

  const metricas = [
    { label: 'Pedidos hoy',       value: '24',   unit: 'pedidos', color: PRIMARY, icon: '📋' },
    { label: 'Eficiencia',        value: '94.3', unit: '%',       color: GREEN,   icon: '📈' },
    { label: 'T. prom. despacho', value: '3.2',  unit: 'min',     color: WARN,    icon: '⏱️' },
    { label: 'Cola FIFO',         value: '7',    unit: 'items',   color: PRIMARY, icon: '🔄' },
    { label: 'Uptime',            value: '99.7', unit: '%',       color: GREEN,   icon: '🔗' },
    { label: 'Errores en turno',  value: '1',    unit: 'evento',  color: ACCENT,  icon: '⚠️' },
  ];
  const turnos = [
    { nombre: 'Turno 1', hora: '06:00–14:00', pedidos: 10, efic: '96%', estado: 'Completado', c: GREEN  },
    { nombre: 'Turno 2', hora: '14:00–22:00', pedidos: 14, efic: '93%', estado: 'En curso',   c: WARN   },
    { nombre: 'Turno 3', hora: '22:00–06:00', pedidos: 0,  efic: '—',   estado: 'Pendiente',  c: '#AAAAAA' },
  ];

  const panel = { background: '#FFF', border: '1px solid #DADADA', borderRadius: '12px',
    padding: isMobile ? '14px' : '20px 22px', boxShadow: '0 2px 8px rgba(0,51,102,0.05)' };
  const panelTitle = { margin: '0 0 14px', color: PRIMARY, fontSize: '15px', fontWeight: '600', fontFamily: FONT };

  return (
    <div style={{ padding: isMobile ? '14px' : '24px 24px 48px', flex: 1 }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ margin: 0, color: PRIMARY, fontSize: isMobile ? '17px' : '20px', fontWeight: '700', fontFamily: FONT }}>
          Panel de Administración
        </h1>
        <p style={{ margin: '4px 0 0', color: '#777', fontSize: '13px', fontFamily: FONT }}>
          Resumen del proceso y estadísticas del turno actual
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
        gap: '10px', marginBottom: '16px'
      }}>
        {[
          { icon: '📦', title: 'Ocupación', ...ocupacion },
          { icon: '🤖', title: 'Robots',    ...robotsActivos },
          { icon: '🚚', title: 'Dispensa',  ...dispensa },
          { icon: '🏪', title: 'Recepción', ...recepcion },
          { icon: '🚨', title: 'Alarmas',   ...alarmas, barColor: ACCENT, iconColor: ACCENT }
        ].map((k, i) => (
          <div key={i} style={{ background: '#FFF', border: '1px solid #DADADA',
            borderRadius: '10px', padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,51,102,0.05)' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '7px' }}>
              <span style={{ fontSize: '13px' }}>{k.icon}</span>
              <span style={{ fontSize: '11px', color: '#777', fontWeight: '500', fontFamily: FONT }}>{k.title}</span>
            </div>
            <p style={{ margin: 0, fontSize: '17px', fontWeight: '600', fontFamily: MONO,
              color: k.iconColor || PRIMARY }}>{k.value}</p>
            <div style={{ marginTop: '7px', height: '3px', background: '#DADADA', borderRadius: '2px' }}>
              <div style={{ height: '3px', width: `${k.progress}%`, background: k.barColor || PRIMARY, borderRadius: '2px' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
        gap: '16px', marginBottom: '16px'
      }}>
        <div style={panel}>
          <h2 style={panelTitle}>📈 Métricas del Proceso</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {metricas.map((m, i) => (
              <div key={i} style={{ background: '#F8F9FB', borderRadius: '10px', padding: '12px 14px', border: '1px solid #EBEBEB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px' }}>{m.icon}</span>
                  <span style={{ fontSize: '11px', color: '#777', fontWeight: '500', fontFamily: FONT }}>{m.label}</span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: '20px', fontWeight: '600', color: m.color }}>{m.value}</span>
                <span style={{ fontSize: '11px', color: '#999', marginLeft: '4px', fontFamily: FONT }}>{m.unit}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={panel}>
            <h2 style={{ ...panelTitle, marginBottom: '14px' }}>📊 Estado del Sistema</h2>
            <EstadoIndicador estado={estadoSistema.estado} alarmas={estadoSistema.alarmasActivas} />
            <div style={{
              marginTop: '12px', padding: '9px 12px', borderRadius: '8px', fontSize: '12px',
              background: conexion === 'estable' ? 'rgba(26,158,90,0.07)' : 'rgba(173,51,51,0.07)',
              border: `1px solid ${conexion === 'estable' ? 'rgba(26,158,90,0.3)' : 'rgba(173,51,51,0.3)'}`,
              color: conexion === 'estable' ? GREEN : ACCENT,
              fontWeight: '500', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: FONT
            }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', flexShrink:0,
                background: conexion === 'estable' ? GREEN : ACCENT }} />
              Conexión {conexion} · <span style={{ fontFamily: MONO }}>{hora}</span>
            </div>
          </div>
          <div style={panel}>
            <h2 style={{ ...panelTitle, marginBottom: '12px' }}>🔔 Eventos Recientes</h2>
            {[
              { t: '23:48', msg: 'Robot B2 en mantenimiento', c: WARN   },
              { t: '23:31', msg: 'Cola FIFO superó 5 ítems',  c: WARN   },
              { t: '22:10', msg: 'Turno 2 iniciado',          c: GREEN  }
            ].map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '7px 0',
                borderBottom: i < 2 ? '1px solid #F0F0F0' : 'none' }}>
                <span style={{ fontFamily: MONO, fontSize:'11px', color:'#999', flexShrink:0 }}>{ev.t}</span>
                <span style={{ fontSize:'12px', color:ev.c, fontWeight:'500', fontFamily: FONT }}>{ev.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...panel, overflowX: 'auto' }}>
        <h2 style={panelTitle}>🕐 Análisis de Turnos del Día</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
          <thead>
            <tr style={{ background: '#F5F7FA' }}>
              {['Turno', 'Horario', 'Pedidos', 'Eficiencia', 'Estado'].map(h => (
                <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: '#555',
                  fontWeight: '600', fontSize: '11px', textTransform: 'uppercase',
                  letterSpacing: '0.4px', borderBottom: '1px solid #DADADA', fontFamily: FONT }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {turnos.map((t, i) => (
              <tr key={i} style={{ borderBottom: i < 2 ? '1px solid #F0F0F0' : 'none' }}>
                <td style={{ padding: '11px 12px', fontWeight: '600', color: '#222', fontFamily: FONT }}>{t.nombre}</td>
                <td style={{ padding: '11px 12px', color: '#555', fontFamily: MONO, fontSize:'12px' }}>{t.hora}</td>
                <td style={{ padding: '11px 12px', fontFamily: MONO, color: PRIMARY, fontWeight:'600' }}>{t.pedidos}</td>
                <td style={{ padding: '11px 12px', fontFamily: MONO, color: t.c, fontWeight:'600' }}>{t.efic}</td>
                <td style={{ padding: '11px 12px' }}>
                  <span style={{ padding:'3px 10px', borderRadius:'6px', fontSize:'11px',
                    fontWeight:'600', color: t.c, background:`${t.c}18`, fontFamily: FONT }}>{t.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VISTA SUPER ADMIN
───────────────────────────────────────────── */
function SuperAdminView({ datos, estadoSistema, conexion, hora, currentUser, isMobile }) {
  const { ocupacion, robotsActivos, dispensa, recepcion, alarmas } = datos;

  const conexiones = [
    { nombre: 'MQTT Broker',   estado: 'Conectado',    c: GREEN  },
    { nombre: 'API REST',      estado: 'Conectado',    c: GREEN  },
    { nombre: 'Base de datos', estado: 'En revisión',  c: WARN   },
    { nombre: 'WebSocket',     estado: 'Desconectado', c: ACCENT },
  ];
  const sysInfo = [
    { k: 'Versión HMI', v: '2.0.0-draft' },
    { k: 'Framework',   v: 'React 19'     },
    { k: 'Protocolo',   v: 'MQTT / REST'  },
    { k: 'Entorno',     v: 'Desarrollo'   },
    { k: 'Uptime',      v: '99.7 %'       },
  ];
  const usuarios = [
    { u: 'superadmin', rol: 'Super Admin', nivel: 3, activo: currentUser?.username === 'superadmin' },
    { u: 'admin',      rol: 'Admin',       nivel: 2, activo: currentUser?.username === 'admin'      },
    { u: 'operario',   rol: 'Operario',    nivel: 1, activo: currentUser?.username === 'operario'   },
  ];

  const panel = { background: '#FFF', border: '1px solid #DADADA', borderRadius: '12px',
    padding: isMobile ? '14px' : '18px 20px', boxShadow: '0 2px 8px rgba(0,51,102,0.05)' };
  const panelTitle = { margin: '0 0 14px', color: PRIMARY, fontSize: '14px', fontWeight: '600', fontFamily: FONT };

  return (
    <div style={{ padding: isMobile ? '14px' : '24px 24px 48px', flex: 1 }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ margin: 0, color: PRIMARY, fontSize: isMobile ? '17px' : '20px', fontWeight: '700', fontFamily: FONT }}>
          Centro de Operaciones — Super Admin
        </h1>
        <p style={{ margin: '4px 0 0', color: '#777', fontSize: '13px', fontFamily: FONT }}>
          Vista técnica completa del sistema AS/RS
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
        gap: '10px', marginBottom: '14px'
      }}>
        {[
          { icon: '📦', title: 'Ocupación', ...ocupacion },
          { icon: '🤖', title: 'Robots',    ...robotsActivos },
          { icon: '🚚', title: 'Dispensa',  ...dispensa },
          { icon: '🏪', title: 'Recepción', ...recepcion },
          { icon: '🚨', title: 'Alarmas',   ...alarmas, barColor: ACCENT, iconColor: ACCENT }
        ].map((k, i) => (
          <div key={i} style={{ background: '#FFF', border: '1px solid #DADADA', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px' }}>{k.icon}</span>
              <span style={{ fontSize: '11px', color: '#777', fontWeight: '500', fontFamily: FONT }}>{k.title}</span>
            </div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', fontFamily: MONO,
              color: k.iconColor || PRIMARY }}>{k.value}</p>
            <div style={{ marginTop: '6px', height: '3px', background: '#DADADA', borderRadius: '2px' }}>
              <div style={{ height: '3px', width: `${k.progress}%`, background: k.barColor || PRIMARY, borderRadius: '2px' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 260px',
        gap: '14px', marginBottom: '14px'
      }}>
        <div style={panel}>
          <h3 style={panelTitle}>🖥️ Información del Sistema</h3>
          {sysInfo.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
              padding: '7px 0', borderBottom: i < sysInfo.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <span style={{ fontSize: '12px', color: '#777', fontFamily: FONT }}>{s.k}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: PRIMARY, fontFamily: MONO }}>{s.v}</span>
            </div>
          ))}
        </div>
        <div style={panel}>
          <h3 style={panelTitle}>🔌 Estado de Conexiones</h3>
          {conexiones.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: i < conexiones.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <span style={{ fontSize: '12px', color: '#555', fontFamily: FONT }}>{c.nombre}</span>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 9px',
                borderRadius: '6px', color: c.c, background: `${c.c}18`, fontFamily: FONT }}>{c.estado}</span>
            </div>
          ))}
        </div>
        <div style={panel}>
          <h3 style={panelTitle}>📊 Estado General</h3>
          <EstadoIndicador estado={estadoSistema.estado} alarmas={estadoSistema.alarmasActivas} />
          <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#999', fontFamily: MONO }}>{hora}</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '14px'
      }}>
        <div style={panel}>
          <h3 style={panelTitle}>📈 Métricas del Proceso</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Pedidos hoy', value: '24',   unit: 'ped',   color: PRIMARY },
              { label: 'Eficiencia',  value: '94.3', unit: '%',     color: GREEN   },
              { label: 'T. despacho', value: '3.2',  unit: 'min',   color: WARN    },
              { label: 'Cola FIFO',   value: '7',    unit: 'items', color: PRIMARY },
              { label: 'Uptime',      value: '99.7', unit: '%',     color: GREEN   },
              { label: 'Errores',     value: '1',    unit: 'ev.',   color: ACCENT  },
            ].map((m, i) => (
              <div key={i} style={{ background: '#F8F9FB', borderRadius: '8px', padding: '10px 11px', border: '1px solid #EBEBEB' }}>
                <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#777', fontWeight: '500', fontFamily: FONT }}>{m.label}</p>
                <p style={{ margin: 0, fontFamily: MONO, fontSize: '18px', fontWeight: '600', color: m.color, lineHeight: 1 }}>
                  {m.value}<span style={{ fontSize: '10px', color: '#999', marginLeft: '2px', fontFamily: FONT }}>{m.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...panel, border: '1px solid rgba(173,51,51,0.2)', overflowX: 'auto' }}>
          <h3 style={{ ...panelTitle, color: ACCENT }}>👥 Gestión de Usuarios</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '280px' }}>
            <thead>
              <tr style={{ background: '#F5F7FA' }}>
                {['Usuario', 'Rol', 'Nivel', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#555',
                    fontWeight: '600', fontSize: '11px', textTransform: 'uppercase',
                    borderBottom: '1px solid #DADADA', fontFamily: FONT }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => (
                <tr key={i} style={{ borderBottom: i < 2 ? '1px solid #F0F0F0' : 'none' }}>
                  <td style={{ padding: '10px', fontFamily: MONO, color: PRIMARY, fontWeight:'600' }}>{u.u}</td>
                  <td style={{ padding: '10px', color: '#555', fontFamily: FONT }}>{u.rol}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ width:'22px', height:'22px', borderRadius:'50%',
                      background: PRIMARY, color:'#FFF', fontSize:'11px', fontWeight:'700',
                      display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{u.nivel}</span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ padding:'2px 8px', borderRadius:'5px', fontSize:'11px', fontWeight:'600',
                      color: u.activo ? GREEN : '#999',
                      background: u.activo ? 'rgba(26,158,90,0.1)' : '#F0F0F0', fontFamily: FONT }}>
                      {u.activo ? '● Activo' : '○ Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Indicador de estado compartido ── */
function EstadoIndicador({ estado, alarmas }) {
  const ok = estado === 'normal';
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
        borderRadius: '8px', marginBottom: '8px',
        background: ok ? 'rgba(26,158,90,0.06)' : 'rgba(212,139,0,0.06)',
        border: `1px solid ${ok ? 'rgba(26,158,90,0.3)' : 'rgba(212,139,0,0.4)'}`
      }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
          background: ok ? GREEN : WARN,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
        }}>{ok ? '✅' : '⚠️'}</div>
        <div>
          <p style={{ margin: 0, fontWeight: '600', fontSize: '12px', color: '#222', fontFamily: FONT }}>Sistema</p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', fontWeight: '500', fontFamily: FONT,
            color: ok ? GREEN : WARN }}>{ok ? 'Operativo' : 'En advertencia'}</p>
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 12px', borderRadius: '8px',
        background: alarmas > 0 ? 'rgba(173,51,51,0.06)' : 'rgba(26,158,90,0.06)',
        border: `1px solid ${alarmas > 0 ? 'rgba(173,51,51,0.25)' : 'rgba(26,158,90,0.3)'}`
      }}>
        <span style={{ fontSize: '12px', fontWeight: '600', fontFamily: FONT,
          color: alarmas > 0 ? ACCENT : GREEN }}>
          {alarmas > 0 ? '🔴 Requiere atención' : '🟢 Sin alarmas'}
        </span>
        <span style={{
          width: '26px', height: '26px', borderRadius: '50%',
          background: alarmas > 0 ? ACCENT : GREEN, color: '#FFF',
          fontWeight: '700', fontSize: '12px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: MONO
        }}>{alarmas}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function Dashboard({
  ocupacion     = { value: '77%',           progress: 77, footer: 'Alta ocupación' },
  robotsActivos = { value: '2 / 5',         progress: 40, footer: 'En espera' },
  dispensa      = { value: '1 / 3 activos', progress: 33, footer: 'Sin' },
  recepcion     = { value: '1 / 2 activos', progress: 50, footer: 'En cola' },
  alarmas       = { value: '2 activas',     progress: 20, footer: 'Requiere atención' },
  estadoSistema = { estado: 'advertencia',  alarmasActivas: 2 },
  ultimaActualizacion: ultimaActualizacionProp,
  conexion      = 'estable'
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'operario';

  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hora, setHora] = useState(
    ultimaActualizacionProp || new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  );

  useEffect(() => {
    const id = setInterval(() => setHora(
      new Date().toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
    ), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleLogout() { logout(); navigate('/login', { replace: true }); }

  const datos = { ocupacion, robotsActivos, dispensa, recepcion, alarmas };

  function renderContent() {
    switch (activeSection) {
      case 'almacenamiento': return <Almacenamiento />;
      case 'dispensa':       return <Dispensa />;
      case 'recepcion':      return <Recepcion />;
      case 'robot':          return <Robot />;
      case 'usuarios':       return <GestionUsuarios />;
      default:
        if (role === 'admin')
          return <AdminView datos={datos} estadoSistema={estadoSistema} conexion={conexion} hora={hora} isMobile={isMobile} />;
        if (role === 'superadmin')
          return <SuperAdminView datos={datos} estadoSistema={estadoSistema} conexion={conexion} hora={hora} currentUser={user} isMobile={isMobile} />;
        return <OperarioView datos={datos} hora={hora} estadoSistema={estadoSistema} conexion={conexion} isMobile={isMobile} />;
    }
  }

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', fontFamily: FONT }}>
      <TopBar
        user={user} hora={hora} onLogout={handleLogout}
        isMobile={isMobile} onToggleSidebar={() => setSidebarOpen(v => !v)}
      />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', position: 'relative' }}>
        {/* Overlay backdrop en mobile */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.45)', zIndex: 499
            }}
          />
        )}
        <Sidebar
          role={role}
          activeSection={activeSection}
          onNavigate={setActiveSection}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
