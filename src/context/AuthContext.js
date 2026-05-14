import { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_USERS = [
  { id: 1, username: 'superadmin', password: 'SA@2025!',  role: 'superadmin', nombre: 'Super Administrador', nivelAcceso: 3, intentosFallidos: 0, bloqueado: false },
  { id: 2, username: 'admin',      password: 'Adm@2025!', role: 'admin',      nombre: 'Administrador',       nivelAcceso: 2, intentosFallidos: 0, bloqueado: false },
  { id: 3, username: 'operario',   password: 'Op@2025!',  role: 'operario',   nombre: 'Operario',            nivelAcceso: 1, intentosFallidos: 0, bloqueado: false },
];

function loadUsers() {
  try {
    const saved = localStorage.getItem('asrs_users');
    const users = saved ? JSON.parse(saved) : DEFAULT_USERS;
    // Asegurar que todos los usuarios tengan las propiedades de bloqueo
    return users.map(u => ({
      ...u,
      intentosFallidos: u.intentosFallidos ?? 0,
      bloqueado: u.bloqueado ?? false,
    }));
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem('asrs_users', JSON.stringify(users));
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('asrs_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) sessionStorage.setItem('asrs_user', JSON.stringify(user));
    else sessionStorage.removeItem('asrs_user');
  }, [user]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  async function login(username, password) {
    // 1. Verificar si el usuario existe y está bloqueado
    const userData = users.find(u => u.username === username);
    
    if (userData && userData.bloqueado) {
      return { ok: false, error: `Cuenta bloqueada. Por favor, contacta al administrador.` };
    }

    try {
      // 2. Intentamos hablar con el servidor Backend
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      // 3. Revisamos si el backend nos dijo que sí (status 200)
      if (response.ok) {
        const data = await response.json();
        
        // Resetear intentos fallidos en login exitoso
        if (userData) {
          setUsers(prev => prev.map(u => 
            u.username === username ? { ...u, intentosFallidos: 0 } : u
          ));
        }
        
        // Armamos el objeto de usuario tal cual lo espera el Frontend
        const loggedUser = {
          username: username,
          role: data.role,
          token: data.access_token
        };
        
        setUser(loggedUser);
        return { ok: true, user: loggedUser };
      } 
      
      // 4. Si el backend nos rechazó, incrementar intentos (para operarios y admins)
      const errorData = await response.json();
      const puedeBloquearse = userData && (userData.role === 'operario' || userData.role === 'admin');
      if (puedeBloquearse) {
        const currentAttempts = (userData.intentosFallidos ?? 0);
        const newAttempts = currentAttempts + 1;
        setUsers(prev => prev.map(u => 
          u.username === username ? { 
            ...u, 
            intentosFallidos: newAttempts,
            bloqueado: newAttempts >= 3
          } : u
        ));
        
        if (newAttempts >= 3) {
          return { ok: false, error: '🔒 Cuenta bloqueada por seguridad. Contacta al administrador.' };
        }
        return { ok: false, error: `⚠️ Usuario o contraseña incorrectos. Intentos: ${newAttempts}/3` };
      }
      return { ok: false, error: errorData.detail || 'Error al iniciar sesión' };

    } catch (error) {
      // 5. Fallback al simulador local si el backend está inactivo
      console.warn("Backend inactivo. Usando login simulado de respaldo...");
      
      const found = users.find(u => u.username === username);
      
      if (!found) {
        return { ok: false, error: 'Usuario no encontrado' };
      }

      if (found.bloqueado) {
        return { ok: false, error: `🔒 Cuenta bloqueada. Por favor, contacta al administrador.` };
      }

      if (found.password === password) {
        // Login exitoso - resetear intentos
        setUsers(prev => prev.map(u => 
          u.username === username ? { ...u, intentosFallidos: 0 } : u
        ));
        const { password: _, ...safeUser } = found;
        setUser(safeUser);
        return { ok: true, user: safeUser };
      }

      // Contraseña incorrecta - incrementar intentos (para operarios y admins)
      const puedeBloquearseFallback = found.role === 'operario' || found.role === 'admin';
      if (puedeBloquearseFallback) {
        const currentAttempts = (found.intentosFallidos ?? 0);
        const newAttempts = currentAttempts + 1;
        setUsers(prev => prev.map(u => 
          u.username === username ? { 
            ...u, 
            intentosFallidos: newAttempts,
            bloqueado: newAttempts >= 3
          } : u
        ));

        if (newAttempts >= 3) {
          return { ok: false, error: '🔒 Cuenta bloqueada por seguridad. Contacta al administrador.' };
        }

        return { ok: false, error: `⚠️ Usuario o contraseña incorrectos. Intentos: ${newAttempts}/3` };
      }

      // Superadmin puede intentar ilimitadamente
      return { ok: false, error: `⚠️ Usuario o contraseña incorrectos` };
    }
  }

  function logout() { setUser(null); }

  function unlockUser(userId, requestingUserRole) {
    // Solo superadmin puede desbloquear
    if (requestingUserRole !== 'superadmin') {
      return { ok: false, error: 'No tienes permiso para desbloquear usuarios' };
    }
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, bloqueado: false, intentosFallidos: 0 } : u
    ));
    return { ok: true };
  }

  function addUser({ nombre, username, password, role }) {
    if (users.find(u => u.username === username)) {
      return { ok: false, error: 'El nombre de usuario ya existe' };
    }
    const nivelAcceso = role === 'superadmin' ? 3 : role === 'admin' ? 2 : 1;
    const newUser = {
      id: Date.now(),
      username: username.trim(),
      password,
      role,
      nombre: nombre.trim(),
      nivelAcceso,
      intentosFallidos: 0,
      bloqueado: false,
    };
    setUsers(prev => [...prev, newUser]);
    return { ok: true };
  }

  function deleteUser(id) {
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function updateUser(id, changes) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...changes } : u));
  }

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, deleteUser, updateUser, unlockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
