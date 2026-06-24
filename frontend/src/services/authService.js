import apiClient from '../api/client.js';

export const authService = {
  login: async (username, password, role = 'admin') => {
    const endpoint = role === 'teacher' ? '/teacher-auth/login' : '/admin/login';
    const response = await apiClient.post(endpoint, { username, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
  },
};
