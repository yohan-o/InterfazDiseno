import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#003366';
const ACCENT  = '#AD3333';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) { setError('Ingrese usuario y contraseña.'); return; }
    setLoading(true);
    
    // Llamamos a nuestro nuevo login que ahora viaja por internet
    const result = await login(username.trim(), password);
    
    if (result.ok) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: '14px',
    fontFamily: FONT, color: '#222222',
    border: '1.5px solid #DADADA', borderRadius: '8px',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s', background: '#FAFAFA'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT, position: 'relative', overflow: 'hidden',
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(135deg, #001020 0%, #001f3f 55%, #003366 100%)
      `,
      backgroundSize: '48px 48px, 48px 48px, 100% 100%'
    }}>

      {/* Franja superior — colores institucionales UP */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: `linear-gradient(90deg, ${PRIMARY}, #0055a5, ${ACCENT}, #D48B00, #1A9E5A)`
      }} />

      {/* Círculos decorativos */}
      <div style={{ position:'absolute', top:'8%', right:'7%', width:'300px', height:'300px',
        borderRadius:'50%', background:'rgba(0,83,166,0.07)',
        border:'1px solid rgba(0,83,166,0.13)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'6%', left:'5%', width:'220px', height:'220px',
        borderRadius:'50%', background:'rgba(0,51,102,0.09)',
        border:'1px solid rgba(0,83,166,0.11)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'42%', left:'3%', width:'130px', height:'130px',
        borderRadius:'50%', background:'rgba(173,51,51,0.05)',
        border:'1px solid rgba(173,51,51,0.09)', pointerEvents:'none' }} />

      {/* Layout: panel izquierdo + card */}
      <div style={{
        display: 'flex', alignItems: 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '20px' : '52px',
        zIndex: 1, width: '100%', maxWidth: '860px',
        padding: isMobile ? '16px' : '24px'
      }}>

        {/* Panel izquierdo — branding (oculto en mobile) */}
        <div style={{ flex: '1', display: isMobile ? 'none' : 'flex', flexDirection: 'column',
          alignItems: 'flex-start', gap: '22px', color: '#FFFFFF' }}>

          <img src="/logo_U_png.png" alt="Universidad de Pamplona"
            style={{ height: '68px', width: 'auto', objectFit: 'contain', display: 'block',
              filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.28))' }}
          />

          <div>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '700', fontFamily: FONT,
              color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
              AS/RS<br />Sistema de Gestión<br />de Almacén
            </h1>
            <p style={{ margin: '14px 0 0 0', fontSize: '13px', fontFamily: FONT,
              color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '290px' }}>
              Plataforma HMI para la supervisión y control
              del sistema automatizado de almacenamiento
              y recuperación.
            </p>
          </div>

          {/* Indicadores de colores institucionales */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[PRIMARY, ACCENT, '#DADADA'].map((c, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c,
                border: c === '#DADADA' ? '1px solid rgba(255,255,255,0.3)' : 'none' }} />
            ))}
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px', fontFamily: FONT }}>
              Universidad de Pamplona
            </span>
          </div>
        </div>

        {/* Card de login */}
        <div style={{
          background: 'rgba(255,255,255,0.97)', borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          width: '100%', maxWidth: isMobile ? '100%' : '370px',
          overflow: 'hidden', flexShrink: 0
        }}>
          {/* Header card */}
          <div style={{ background: PRIMARY, padding: '28px 36px 22px', textAlign: 'center' }}>
            <img src="/logo_U_png.png" alt="Universidad de Pamplona"
              style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block',
                margin: '0 auto 14px', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.2))' }}
            />
            <h2 style={{ margin: 0, color: '#FFFFFF', fontSize: '16px', fontWeight: '700', fontFamily: FONT }}>
              Acceso al Sistema
            </h2>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontFamily: FONT }}>
              Universidad de Pamplona · Etapa 2
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ padding: '28px 36px 32px' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', fontFamily: FONT,
                color: PRIMARY, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Usuario
              </label>
              <input type="text" value={username} placeholder="Ingrese su usuario"
                autoComplete="username" onChange={e => setUsername(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = PRIMARY; e.target.style.background = '#FFF'; }}
                onBlur={e => { e.target.style.borderColor = '#DADADA'; e.target.style.background = '#FAFAFA'; }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', fontFamily: FONT,
                color: PRIMARY, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password}
                  placeholder="Ingrese su contraseña" autoComplete="current-password"
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => { e.target.style.borderColor = PRIMARY; e.target.style.background = '#FFF'; }}
                  onBlur={e => { e.target.style.borderColor = '#DADADA'; e.target.style.background = '#FAFAFA'; }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', fontSize:'15px', color:'#999', padding:'4px' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: '14px', padding: '10px 14px',
                background: 'rgba(173,51,51,0.07)', border: '1px solid rgba(173,51,51,0.25)',
                borderRadius: '8px', color: ACCENT, fontSize: '13px', fontWeight: '600',
                fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', fontSize: '13px', fontWeight: '700',
                letterSpacing: '1px', fontFamily: FONT, color: '#FFFFFF',
                background: loading ? '#5580a3' : PRIMARY, border: 'none',
                borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s', minHeight: '48px'
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#00204d'; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = PRIMARY; }}
            >
              {loading ? 'Verificando...' : 'INGRESAR AL SISTEMA'}
            </button>
          </form>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '18px', left: 0, right: 0, textAlign: 'center',
        color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: FONT }}>
        AS/RS Automatizado · Grupo Frontend/HMI · Universidad de Pamplona
      </div>
    </div>
  );
}
