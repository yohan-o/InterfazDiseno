import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PRIMARY = '#003366';
const ACCENT  = '#AD3333';
const GREEN   = '#1A9E5A';
const WARN    = '#D48B00';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";

const ROLE_LABELS = {
  superadmin: { label: 'Super Admin', color: ACCENT,  nivel: 3 },
  admin:      { label: 'Admin',       color: WARN,    nivel: 2 },
  operario:   { label: 'Operario',    color: GREEN,   nivel: 1 },
};

const EMPTY_FORM = { nombre: '', username: '', password: '', confirmar: '', role: 'operario' };

export default function GestionUsuarios() {
  // ========== HOOKS (ORDEN CORRECTO) ==========
  const { users, user: currentUser, addUser, deleteUser, unlockUser } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const [showFormPass, setShowFormPass] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmUnlock, setConfirmUnlock] = useState(null);
  const [filterRole, setFilterRole] = useState('todos');

  // Effects
  useEffect(() => {
    if (currentUser && currentUser.role !== 'superadmin') {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ========== VALIDACIONES Y CONDICIONES ==========
  if (currentUser?.role !== 'superadmin') {
    return (
      <div style={{ padding: '40px 28px', fontFamily: FONT, textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: ACCENT, fontSize: '16px', fontWeight: '600' }}>
          🔐 Acceso denegado. Solo el Super Admin puede gestionar usuarios.
        </div>
      </div>
    );
  }

  // ========== FUNCIONES ==========

  function validate() {
    const e = {};
    if (!form.nombre.trim())    e.nombre    = 'El nombre es requerido';
    if (!form.username.trim())  e.username  = 'El usuario es requerido';
    if (form.username.includes(' ')) e.username = 'Sin espacios en el usuario';
    if (form.password.length < 6)   e.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSuccess('');
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    const result = addUser({ nombre: form.nombre, username: form.username, password: form.password, role: form.role });
    if (result.ok) {
      setSuccess(`Usuario "${form.username}" creado exitosamente`);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setErrors({ username: result.error });
    }
  }

  function handleDelete(u) {
    if (u.id === currentUser?.id) return;
    deleteUser(u.id);
    setConfirmDelete(null);
  }

  function handleUnlock(u) {
    const result = unlockUser(u.id, currentUser?.role);
    if (result.ok) {
      setConfirmUnlock(null);
      setSuccess(`Usuario "${u.username}" desbloqueado exitosamente`);
      setTimeout(() => setSuccess(''), 3000);
    }
  }

  const filtered = filterRole === 'todos' ? users : users.filter(u => u.role === filterRole);

  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 12px', fontSize: '13px', fontFamily: FONT,
    border: `1.5px solid ${hasError ? ACCENT : '#DADADA'}`, borderRadius: '8px',
    outline: 'none', background: '#FAFAFA', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: '600', fontFamily: FONT,
    color: PRIMARY, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  return (
    <div style={{ padding: '24px 28px 48px', fontFamily: FONT }}>

      {/* Encabezado */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: PRIMARY, fontSize: '20px', fontWeight: '700', fontFamily: FONT }}>
          👥 Gestión de Usuarios
        </h1>
        <p style={{ margin: '4px 0 0', color: '#777', fontSize: '13px', fontFamily: FONT }}>
          Crear y administrar cuentas de acceso al sistema
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '380px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Panel de creación ── */}
        <div style={{ background: '#FFF', border: '1px solid #DADADA', borderRadius: '14px',
          boxShadow: '0 2px 10px rgba(0,51,102,0.07)', overflow: 'hidden' }}>

          <div style={{ background: PRIMARY, padding: '18px 24px' }}>
            <h2 style={{ margin: 0, color: '#FFF', fontSize: '15px', fontWeight: '600', fontFamily: FONT }}>
              ➕ Nuevo Usuario
            </h2>
            <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontFamily: FONT }}>
              Se guardará en el sistema local
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>

            {/* Nombre completo */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Nombre completo</label>
              <input type="text" placeholder="Ej: Juan Pérez" value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                style={inputStyle(errors.nombre)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e => e.target.style.borderColor = errors.nombre ? ACCENT : '#DADADA'}
              />
              {errors.nombre && <p style={{ margin: '4px 0 0', fontSize: '11px', color: ACCENT, fontFamily: FONT }}>{errors.nombre}</p>}
            </div>

            {/* Username */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Nombre de usuario</label>
              <input type="text" placeholder="Ej: jperez" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase() }))}
                style={inputStyle(errors.username)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e => e.target.style.borderColor = errors.username ? ACCENT : '#DADADA'}
              />
              {errors.username && <p style={{ margin: '4px 0 0', fontSize: '11px', color: ACCENT, fontFamily: FONT }}>{errors.username}</p>}
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showFormPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ ...inputStyle(errors.password), paddingRight: '40px' }}
                  onFocus={e => e.target.style.borderColor = PRIMARY}
                  onBlur={e => e.target.style.borderColor = errors.password ? ACCENT : '#DADADA'}
                />
                <button type="button" onClick={() => setShowFormPass(v => !v)}
                  style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', fontSize:'14px', color:'#999' }}>
                  {showFormPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p style={{ margin: '4px 0 0', fontSize: '11px', color: ACCENT, fontFamily: FONT }}>{errors.password}</p>}
            </div>

            {/* Confirmar contraseña */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input type="password" placeholder="Repita la contraseña" value={form.confirmar}
                onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
                style={inputStyle(errors.confirmar)}
                onFocus={e => e.target.style.borderColor = PRIMARY}
                onBlur={e => e.target.style.borderColor = errors.confirmar ? ACCENT : '#DADADA'}
              />
              {errors.confirmar && <p style={{ margin: '4px 0 0', fontSize: '11px', color: ACCENT, fontFamily: FONT }}>{errors.confirmar}</p>}
            </div>

            {/* Rol */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Rol del usuario</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.entries(ROLE_LABELS).map(([key, meta]) => (
                  <button key={key} type="button"
                    onClick={() => setForm(f => ({ ...f, role: key }))}
                    style={{
                      flex: 1, padding: '9px 6px', borderRadius: '8px', cursor: 'pointer',
                      fontFamily: FONT, fontSize: '12px', fontWeight: '600',
                      border: `2px solid ${form.role === key ? meta.color : '#DADADA'}`,
                      background: form.role === key ? `${meta.color}12` : '#FAFAFA',
                      color: form.role === key ? meta.color : '#777',
                      transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: '16px', marginBottom: '2px' }}>
                      {key === 'superadmin' ? '🔴' : key === 'admin' ? '🟡' : '🟢'}
                    </div>
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {success && (
              <div style={{ marginBottom: '14px', padding: '10px 14px',
                background: 'rgba(26,158,90,0.08)', border: '1px solid rgba(26,158,90,0.3)',
                borderRadius: '8px', color: GREEN, fontSize: '13px', fontWeight: '600',
                fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✅ {success}
              </div>
            )}

            <button type="submit" style={{
              width: '100%', padding: '12px', background: PRIMARY, color: '#FFF',
              border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
              fontFamily: FONT, cursor: 'pointer', letterSpacing: '0.5px', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.target.style.background = '#00204d'}
            onMouseLeave={e => e.target.style.background = PRIMARY}
            >
              CREAR USUARIO
            </button>
          </form>
        </div>

        {/* ── Lista de usuarios ── */}
        <div>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[['todos','Todos'], ['superadmin','Super Admin'], ['admin','Admin'], ['operario','Operario']].map(([val, lbl]) => (
              <button key={val} onClick={() => setFilterRole(val)}
                style={{
                  padding: '7px 16px', borderRadius: '20px', cursor: 'pointer', fontFamily: FONT,
                  fontSize: '12px', fontWeight: '600',
                  background: filterRole === val ? PRIMARY : '#FFF',
                  color: filterRole === val ? '#FFF' : '#555',
                  border: `1.5px solid ${filterRole === val ? PRIMARY : '#DADADA'}`,
                  transition: 'all 0.15s',
                }}>
                {lbl} {val !== 'todos' && <span style={{ opacity: 0.7 }}>({users.filter(u => u.role === val).length})</span>}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#999', fontFamily: MONO,
              alignSelf: 'center' }}>
              {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Tarjetas de usuarios */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(u => {
              const meta = ROLE_LABELS[u.role] || ROLE_LABELS.operario;
              const esCurrent = u.id === currentUser?.id || u.username === currentUser?.username;
              const isDeleting = confirmDelete === u.id;

              return (
                <div key={u.id} style={{
                  background: '#FFF', border: `1px solid ${isDeleting ? ACCENT : '#DADADA'}`,
                  borderLeft: `4px solid ${meta.color}`,
                  borderRadius: '12px', padding: '16px 20px',
                  boxShadow: '0 2px 6px rgba(0,51,102,0.05)',
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        background: `${meta.color}18`, border: `2px solid ${meta.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px',
                      }}>
                        {u.role === 'superadmin' ? '🔴' : u.role === 'admin' ? '🟡' : '🟢'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#222', fontFamily: FONT }}>
                            {u.nombre}
                          </span>
                          {esCurrent && (
                            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px',
                              fontWeight: '700', background: 'rgba(26,158,90,0.1)', color: GREEN,
                              fontFamily: FONT }}>● Sesión activa</span>
                          )}
                          {u.bloqueado && (
                            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px',
                              fontWeight: '700', background: 'rgba(173,51,51,0.1)', color: ACCENT,
                              fontFamily: FONT }}>🔒 Bloqueado</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '3px' }}>
                          <span style={{ fontFamily: MONO, fontSize: '12px', color: PRIMARY }}>@{u.username}</span>
                          <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '11px',
                            fontWeight: '600', color: meta.color, background: `${meta.color}14`,
                            fontFamily: FONT }}>{meta.label}</span>
                          <span style={{ fontSize: '11px', color: '#999', fontFamily: FONT }}>
                            Nivel {meta.nivel}
                          </span>
                          {currentUser?.role === 'superadmin' && (u.role === 'operario' || u.role === 'admin') && (
                            <span style={{ 
                              fontSize: '11px', color: '#666', fontFamily: MONO,
                              padding: '2px 6px', borderRadius: '4px',
                              background: u.bloqueado ? 'rgba(173,51,51,0.1)' : 'rgba(212,139,0,0.1)'
                            }}>
                              {u.bloqueado ? '🔒 Bloqueado' : `Intentos: ${u.intentosFallidos ?? 0}/3`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {/* Ver contraseña */}
                      <button onClick={() => setShowPasswords(p => ({ ...p, [u.id]: !p[u.id] }))}
                        title="Ver contraseña"
                        style={{ padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                          background: '#F5F7FA', border: '1px solid #DADADA', fontSize: '13px',
                          fontFamily: FONT, color: '#555' }}>
                        {showPasswords[u.id] ? '🙈' : '👁️'}
                      </button>

                      {/* Desbloquear */}
                      {currentUser?.role === 'superadmin' && (u.role === 'operario' || u.role === 'admin') && u.bloqueado && (
                        confirmUnlock === u.id ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleUnlock(u)}
                              style={{ padding: '6px 12px', borderRadius: '7px', cursor: 'pointer',
                                background: GREEN, border: 'none', color: '#FFF',
                                fontSize: '12px', fontWeight: '600', fontFamily: FONT }}>
                              Desbloquear
                            </button>
                            <button onClick={() => setConfirmUnlock(null)}
                              style={{ padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                background: '#F5F7FA', border: '1px solid #DADADA',
                                fontSize: '12px', color: '#555', fontFamily: FONT }}>
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmUnlock(u.id)}
                            title="Desbloquear usuario"
                            style={{ padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                              background: 'rgba(26,158,90,0.07)', border: '1px solid rgba(26,158,90,0.2)',
                              fontSize: '13px', color: GREEN }}>
                            🔓
                          </button>
                        )
                      )}

                      {/* Eliminar */}
                      {!esCurrent && (
                        isDeleting ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleDelete(u)}
                              style={{ padding: '6px 12px', borderRadius: '7px', cursor: 'pointer',
                                background: ACCENT, border: 'none', color: '#FFF',
                                fontSize: '12px', fontWeight: '600', fontFamily: FONT }}>
                              Confirmar
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              style={{ padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                background: '#F5F7FA', border: '1px solid #DADADA',
                                fontSize: '12px', color: '#555', fontFamily: FONT }}>
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(u.id)}
                            title="Eliminar usuario"
                            style={{ padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                              background: 'rgba(173,51,51,0.07)', border: '1px solid rgba(173,51,51,0.2)',
                              fontSize: '13px', color: ACCENT }}>
                            🗑️
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Contraseña visible */}
                  {showPasswords[u.id] && (
                    <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '7px',
                      background: '#F8F9FB', border: '1px solid #EBEBEB',
                      display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#999', fontFamily: FONT }}>Contraseña:</span>
                      <span style={{ fontFamily: MONO, fontSize: '13px', fontWeight: '600', color: PRIMARY }}>
                        {u.password}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontFamily: FONT }}>
                No hay usuarios en esta categoría
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
