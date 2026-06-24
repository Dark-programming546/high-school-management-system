import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client.js';
import { parseJWT, isTokenExpired } from '../utils/helpers.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedUsername = localStorage.getItem('username');
    const mustChange = localStorage.getItem('mustChangePassword') === 'true';

    if (token && !isTokenExpired(token)) {
      const payload = parseJWT(token);
      if (payload) {
        setUser({
          id: payload.id,
          username: savedUsername || '',
          role: savedRole || 'admin',
          mustChangePassword: mustChange,
        });
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password, role = 'admin') => {
    try {
      const endpoints = {
        admin:         '/admin/login',
        registrar:     '/registrar/login',
        director:      '/director/login',
        vicedirector:  '/vice-director/login',
        teacher:       '/teacher-auth/login',
        student:       '/student-auth/login',
      };
      const response = await apiClient.post(endpoints[role], { username, password });
      const { token } = response.data;
      const userInfo = response.data.admin || response.data.staff || response.data.teacher || response.data.student || {};
      const resolvedUsername = userInfo.username || username;
      const mustChangePassword = userInfo.mustChangePassword || false;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', resolvedUsername);
      localStorage.setItem('mustChangePassword', mustChangePassword);

      const payload = parseJWT(token);
      setUser({ id: payload.id, username: resolvedUsername, role, mustChangePassword });

      return { success: true, mustChangePassword };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const clearMustChangePassword = () => {
    localStorage.setItem('mustChangePassword', 'false');
    setUser(prev => ({ ...prev, mustChangePassword: false }));
  };

  const logout = () => {
    ['token', 'role', 'username', 'mustChangePassword'].forEach(k => localStorage.removeItem(k));
    setUser(null);
  };

  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, clearMustChangePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
