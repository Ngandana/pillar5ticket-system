/**
 * hooks/useAuth.js
 * Auth state: persists token + user in localStorage, exposes login/logout.
 */
import { useState, useEffect } from 'react';
import { normalizeRole } from '../lib/roles';

const normalizeUser = (userData) =>
  userData ? { ...userData, role: normalizeRole(userData.role) } : userData;

export function useAuth() {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore session on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('p5_token');
      const savedUser  = localStorage.getItem('p5_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(normalizeUser(JSON.parse(savedUser)));
      }
    } catch (_) {}
    setReady(true);
  }, []);

  const login = (userData, tok) => {
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    setToken(tok);
    localStorage.setItem('p5_token', tok);
    localStorage.setItem('p5_user', JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('p5_token');
    localStorage.removeItem('p5_user');
  };

  return { user, token, ready, login, logout };
}
