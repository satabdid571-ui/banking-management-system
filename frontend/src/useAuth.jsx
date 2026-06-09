import React, { createContext, useContext, useState, useEffect } from 'react';
import { bankStore, subscribeToStore } from './store';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state with database store changes
  useEffect(() => {
    const syncState = () => {
      const storedToken = localStorage.getItem('banking_token');
      if (!storedToken) {
        setUser(null);
        setAccount(null);
        return;
      }

      // Check if user is logged in
      try {
        const parsedToken = JSON.parse(storedToken);
        const dbUser = bankStore.getUserByUsername(parsedToken.username);
        
        if (dbUser) {
          setUser(dbUser);
          if (dbUser.role === 'customer') {
            const customerAccount = bankStore.getAccountByUserId(dbUser.id);
            setAccount(customerAccount || null);
          } else {
            setAccount(null); // Admin and employees don't have personal accounts
          }
        } else {
          // Clean up if user deleted
          localStorage.removeItem('banking_token');
          setUser(null);
          setAccount(null);
        }
      } catch (err) {
        console.error('Error parsing token', err);
        localStorage.removeItem('banking_token');
        setUser(null);
        setAccount(null);
      }
    };

    // Initialize state
    syncState();
    setLoading(false);

    // Subscribe to store updates
    const unsubscribe = subscribeToStore(syncState);
    return () => unsubscribe();
  }, []);

  const login = async (identifier, password, expectedRole) => {
    setLoading(true);
    try {
      const dbUser = bankStore.getUserByIdentifier(identifier);
      if (!dbUser) {
        throw new Error('Invalid username or password');
      }

      if (expectedRole && dbUser.role !== expectedRole) {
        throw new Error('Unauthorized role for this login portal');
      }

      if (dbUser.password !== password) {
        throw new Error('Invalid username or password');
      }

      // Store a simple simulated token
      const tokenObj = { id: dbUser.id, username: dbUser.username, role: dbUser.role };
      localStorage.setItem('banking_token', JSON.stringify(tokenObj));
      
      setUser(dbUser);
      if (dbUser.role === 'customer') {
        const customerAccount = bankStore.getAccountByUserId(dbUser.id);
        setAccount(customerAccount || null);
      } else {
        setAccount(null);
      }
      return { success: true, role: dbUser.role };
    } catch (err) {
      throw new Error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, identifier, password) => {
    setLoading(true);
    try {
      const existing = bankStore.getUserByIdentifier(identifier);
      if (existing) {
        throw new Error('Username already exists');
      }

      // Create a customer account with a ₹1,000 welcome bonus!
      const { user: newUser, account: newAccount } = bankStore.createCustomerAccount(fullName, identifier, password, 1000.00, 'Savings');

      // Store a simple simulated token
      const tokenObj = { id: newUser.id, username: newUser.username, role: newUser.role };
      localStorage.setItem('banking_token', JSON.stringify(tokenObj));
      
      setUser(newUser);
      setAccount(newAccount);
      return { success: true, account: newAccount };
    } catch (err) {
      throw new Error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('banking_token');
    setUser(null);
    setAccount(null);
  };

  const refreshAccount = async () => {
    if (user && user.role === 'customer') {
      const customerAccount = bankStore.getAccountByUserId(user.id);
      setAccount(customerAccount || null);
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
