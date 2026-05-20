import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'MANAGER' | 'AGENT';
  status: 'ACTIVE' | 'INACTIVE';
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check storage and verify session on load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('satikflow_token');
      const storedUser = localStorage.getItem('satikflow_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('satikflow_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Failed to verify stored session:', error);
          // Session expired or failed
          localStorage.removeItem('satikflow_token');
          localStorage.removeItem('satikflow_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem('satikflow_token', newToken);
    localStorage.setItem('satikflow_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Backend logout failed or not supported, proceeding with client cleanup');
    }
    localStorage.removeItem('satikflow_token');
    localStorage.removeItem('satikflow_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async (): Promise<UserProfile | null> => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('satikflow_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
