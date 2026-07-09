import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('eventsnap_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.getProfile();
      setUser(data.data);
    } catch {
      localStorage.removeItem('eventsnap_access_token');
      localStorage.removeItem('eventsnap_refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('eventsnap_access_token', data.data.tokens.access);
    localStorage.setItem('eventsnap_refresh_token', data.data.tokens.refresh);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem('eventsnap_access_token', data.data.tokens.access);
    localStorage.setItem('eventsnap_refresh_token', data.data.tokens.refresh);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    const refresh = localStorage.getItem('eventsnap_refresh_token');
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // ignore - logout should always succeed client-side
    }
    localStorage.removeItem('eventsnap_access_token');
    localStorage.removeItem('eventsnap_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refreshProfile: loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
