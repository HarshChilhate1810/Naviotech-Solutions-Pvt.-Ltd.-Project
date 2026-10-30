import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getStoredAccessToken, clearStoredTokens } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const token = getStoredAccessToken();
    const storedUser = localStorage.getItem('athenaeum_user');
    
    if (token) {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // ignore parsing error
        }
      }
      try {
        const userData = await authService.getMe();
        setUser(userData);
        localStorage.setItem('athenaeum_user', JSON.stringify(userData));
      } catch (err) {
        clearStoredTokens();
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();

    const handleSessionExpired = () => {
      setUser(null);
      clearStoredTokens();
    };

    window.addEventListener('auth:expired', handleSessionExpired);
    return () => window.removeEventListener('auth:expired', handleSessionExpired);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('athenaeum_user', JSON.stringify(userData));
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, refreshUser }}>
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
