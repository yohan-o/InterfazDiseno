import { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_USERS = [
  { id: 1, username: 'superadmin', password: 'SA@2025!',  role: 'superadmin', nombre: 'Super Administrador', nivelAcceso: 3 },
  { id: 2, username: 'admin',      password: 'Adm@2025!', role: 'admin',      nombre: 'Administrador',       nivelAcceso: 2 },
  { id: 3, username: 'operario',   password: 'Op@2025!',  role: 'operario',   nombre: 'Operario',            nivelAcceso: 1 },
];

function loadUsers() {
  try {
    const saved = localStorage.getItem('asrs_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
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
    try {
      // 1. Intentamos hablar con el servidor Backend (el endpoint que acabamos de crear)
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      // 2. Revisamos si el backend nos dijo que sí (status 200)
      if (response.ok) {
        const data = await response.json();
        
        // Armamos el objeto de usuario tal cual lo espera el Frontend
        const loggedUser = {
          username: username,
          role: data.role,
          token: data.access_token
        };
        
        setUser(loggedUser); // Guardamos la info del usuario en la memoria de React
        return { ok: true, user: loggedUser };
      } 
      
      // 3. Si el backend nos rechazó (ej. error 404 o 401)
      const errorData = await response.json();
      return { ok: false, error: errorData.detail || 'Error al iniciar sesión' };

    } catch (error) {
      // 4. Si el backend está apagado o aún no han subido el código, 
      // entramos a este CATCH y usamos el "simulador" antiguo como respaldo.
      console.warn("Backend inactivo. Usando login simulado de respaldo...");
      const found = users.find(u => u.username === username && u.password === password);
      if (found) {
        const { password: _, ...safeUser } = found;
        setUser(safeUser);
        return { ok: true, user: safeUser };
      }
      return { ok: false, error: 'Usuario o contraseña incorrectos (Simulación)' };
    }
  }

  function logout() { setUser(null); }

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
    <AuthContext.Provider value={{ user, users, login, logout, addUser, deleteUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
