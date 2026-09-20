import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken]     = useState(localStorage.getItem('iit_token'));

  // Load user on mount
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch(e) {
      logout();
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('iit_token', data.token);
    localStorage.setItem('iit_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register(formData) {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('iit_token', data.token);
    localStorage.setItem('iit_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem('iit_token');
    localStorage.removeItem('iit_user');
    setToken(null);
    setUser(null);
  }

  async function updateProfile(formData) {
    const { data } = await api.patch('/auth/profile', formData);
    setUser(prev => ({ ...prev, ...data }));
    return data;
  }

  const isAdmin      = user?.role === 'admin' || user?.role === 'super_admin';
  const isInstructor = user?.role === 'instructor';
  const isStudent    = user?.role === 'student';
  const isLoggedIn   = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, token, isAdmin, isInstructor,
      isStudent, isLoggedIn,
      login, register, logout, updateProfile, fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
