import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Mock users
const USERS = [
  { id: 1, username: 'etudiant1', password: '1234', role: 'etudiant',    name: 'Yassine Benali',     avatar: 'YB' },
  { id: 2, username: 'prof1',     password: '1234', role: 'enseignant',  name: 'Dr. Fatima Zahra',   avatar: 'FZ' },
  { id: 3, username: 'admin',     password: 'admin',role: 'admin',       name: 'Admin Système',      avatar: 'AS' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    const found = USERS.find(u => u.username === username && u.password === password);
    if (found) { setUser(found); return true; }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
