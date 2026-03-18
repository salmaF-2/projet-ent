import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

// Mapping rôles backend (admin/teacher/student) → frontend (admin/enseignant/etudiant)
const mapRole = (role) => {
  if (role === 'teacher')   return 'enseignant';
  if (role === 'student')   return 'etudiant';
  if (role === 'enseignant') return 'enseignant';
  if (role === 'etudiant')  return 'etudiant';
  if (role === 'admin')     return 'admin';
  return 'etudiant'; // fallback
};

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) verifyStoredToken();
    else setLoading(false);
  }, []);

  const verifyStoredToken = async () => {
    try {
      const userData = await authService.verify();
      setUser({
        username: userData.preferred_username,
        name:     userData.preferred_username,
        role:     mapRole(userData.role),
        email:    userData.email || '',
        sub:      userData.sub,
        token:    localStorage.getItem('token'),
      });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);

      localStorage.setItem('token', data.access_token);
      if (data.refresh_token)
        localStorage.setItem('refresh_token', data.refresh_token);

      // Vérifier via /verify pour obtenir le rôle fiable depuis Keycloak
      let roleRaw = 'etudiant';
      let email   = '';
      let sub     = '';
      try {
        const verified = await authService.verify();
        roleRaw = verified.role;
        email   = verified.email || '';
        sub     = verified.sub   || '';
      } catch {
        // Fallback : lire le JWT directement
        try {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          if (payload.preferred_username === 'admin') roleRaw = 'admin';
          else if (payload.preferred_username?.includes('teacher')) roleRaw = 'teacher';
          email = payload.email || '';
          sub   = payload.sub   || '';
        } catch {}
      }

      const userData = {
        username: username,
        name:     username,
        role:     mapRole(roleRaw),
        email,
        sub,
        token: data.access_token,
      };

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.status === 401
          ? 'Identifiants incorrects'
          : 'Erreur de connexion au service d\'authentification';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: '100vh',
        color: '#1a4b8c', fontFamily: 'sans-serif',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{ fontSize: 32 }}>⏳</div>
        <div>Chargement de l'ENT…</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

