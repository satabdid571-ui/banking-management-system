import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state with backend token
  const syncState = async () => {
    const storedToken = localStorage.getItem('banking_token');
    if (!storedToken) {
      setUser(null);
      setAccount(null);
      setLoading(false);
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setAccount(res.data.account || null);
    } catch (err) {
      console.error('Error fetching auth state', err);
      localStorage.removeItem('banking_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncState();
  }, []);

  const login = async (email, accountId, password, expectedRole) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, accountId, password, role: expectedRole });
      const { token, user: dbUser, account: dbAccount } = res.data;

      localStorage.setItem('banking_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(dbUser);
      setAccount(dbAccount || null);
      
      return { success: true, role: dbUser.role };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, identifier, password, role = 'customer') => {
    if (role !== 'customer') {
      throw new Error('Only customers can register through this portal. Please contact an admin for staff accounts.');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', { 
        username: identifier, 
        password, 
        initialDeposit: 1000.00 
      });
      
      const { token, user: dbUser, account: dbAccount } = res.data;

      localStorage.setItem('banking_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(dbUser);
      setAccount(dbAccount || null);
      
      return { success: true, account: dbAccount };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('banking_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setAccount(null);
  };

  const refreshAccount = async () => {
    if (user && user.role === 'customer') {
      try {
        const res = await api.get('/auth/me');
        setAccount(res.data.account || null);
      } catch (err) {
        console.error('Failed to refresh account', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, account, loading, login, register, logout, refreshAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
