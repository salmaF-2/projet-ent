import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

const mapRole = (role) => {
  if (role === 'teacher'    || role === 'enseignant') return 'enseignant';
  if (role === 'student'    || role === 'etudiant')   return 'etudiant';
  if (role === 'admin')                               return 'admin';
  return 'etudiant';
};

const retryRequest = async (fn, maxRetries = 3, delayMs = 1500) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const buildUser = (username, roleRaw, email, sub) => ({
    username,
    name:  username,
    role:  mapRole(roleRaw),
    email: email || '',
    sub:   sub   || '',
    token: localStorage.getItem('token') || '',
  });

  const verifyStoredToken = useCallback(async () => {
    try {
      const verified = await retryRequest(() => authService.verify(), 3, 1500);
      setUser(buildUser(
        verified.preferred_username,
        verified.role,
        verified.email,
        verified.sub,
      ));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) verifyStoredToken();
    else       setLoading(false);
  }, [verifyStoredToken]);

  const login = async (username, password) => {
    try {
      const data = await retryRequest(
        () => authService.login(username, password),
        2, 1000
      );

      localStorage.setItem('token', data.access_token);
      if (data.refresh_token)
        localStorage.setItem('refresh_token', data.refresh_token);

      let roleRaw = 'student';
      let email   = '';
      let sub     = '';

      try {
        const verified = await retryRequest(() => authService.verify(), 3, 1000);
        roleRaw = verified.role  || 'student';
        email   = verified.email || '';
        sub     = verified.sub   || '';
      } catch {
        try {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          email = payload.email || '';
          sub   = payload.sub   || '';
        } catch {}
      }

      const userData = buildUser(username, roleRaw, email, sub);
      setUser(userData);
      return { success: true, user: userData };

    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.status === 401
          ? 'Identifiants incorrects. Vérifiez votre login et mot de passe.'
          : 'Service d\'authentification indisponible. Réessayez dans quelques secondes.';
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
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', color: '#1a4b8c', fontFamily: 'sans-serif',
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
