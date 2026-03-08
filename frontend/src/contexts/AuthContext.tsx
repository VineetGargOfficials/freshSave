// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'ngo' | 'restaurant';
  emailVerified: boolean;
  profileImage?: string;
  organizationName?: string;
  organizationType?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: any) => Promise<void>;
  isUser: boolean;
  isNGO: boolean;
  isRestaurant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    
    if (response.data.success) {
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }

    // Don't auto-login after registration - require email verification
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = async (userData: any) => {
    const response = await axios.put(`${API_URL}/auth/profile`, userData);
    if (response.data.success && response.data.user) {
      setUser(response.data.user);
    }
  };

  // Role helpers
  const isUser = user?.role === 'user';
  const isNGO = user?.role === 'ngo';
  const isRestaurant = user?.role === 'restaurant';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        login, 
        register, 
        logout, 
        updateUser,
        isUser,
        isNGO,
        isRestaurant
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};