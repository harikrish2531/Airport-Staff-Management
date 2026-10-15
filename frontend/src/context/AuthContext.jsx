/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('aeroops_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aeroops_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch active shift for current staff
  const refreshActiveShift = useCallback(async () => {
    if (!token) {
      setActiveShift(null);
      return;
    }
    try {
      const res = await api.get('/api/shifts/active');
      setActiveShift(res.data);
    } catch {
      setActiveShift(null);
    }
  }, [token]);

  // Initial user verification
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('aeroops_token');
      if (savedToken) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
          localStorage.setItem('aeroops_user', JSON.stringify(res.data));
          refreshActiveShift();
        } catch {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          localStorage.removeItem('aeroops_token');
          localStorage.removeItem('aeroops_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [refreshActiveShift]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { access_token, user: loggedUser } = res.data;
    localStorage.setItem('aeroops_token', access_token);
    localStorage.setItem('aeroops_user', JSON.stringify(loggedUser));
    setToken(access_token);
    setUser(loggedUser);
    refreshActiveShift();
    return loggedUser;
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/api/auth/register', { name, email, password, role });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('aeroops_token');
    localStorage.removeItem('aeroops_user');
    setToken(null);
    setUser(null);
    setActiveShift(null);
  };

  const isSupervisor = ['supervisor', 'admin'].includes(user?.role?.toLowerCase());
  const isStaff = !isSupervisor;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        activeShift,
        refreshActiveShift,
        login,
        register,
        logout,
        isSupervisor,
        isStaff,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
