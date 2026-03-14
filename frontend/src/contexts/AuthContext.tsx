// src/contexts/AuthContext.tsx
// ─────────────────────────────────────────────────────────────────────────────
// SESSION-BASED AUTH — Each browser tab is completely independent.
// Token is stored in sessionStorage (NOT localStorage), so:
//   • Opening a new tab = no session (must log in again)
//   • Two tabs can be logged in as different users simultaneously
//   • Closing a tab destroys that session
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SESSION_KEY = 'freshsave_session_token';

// ── User interface — reflects expanded backend User model ─────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'ngo' | 'restaurant' | 'admin';
  emailVerified: boolean;
  profileImage?: string;
  phoneNumber?: string;
  alternatePhone?: string;
  website?: string;
  bio?: string;
  address?: {
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    fullAddress?: string;
  };
  location?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };

  // Restaurant / Caterer
  organizationName?: string;
  organizationType?: string;
  fssaiLicense?: string;
  cuisineTypes?: string[];
  seatingCapacity?: number;
  dailySurplusCapacity?: number;
  operatingHours?: Record<string, { open: string; close: string; isClosed: boolean }>;
  donationMode?: 'pickup_only' | 'delivery' | 'both';
  isHalalCertified?: boolean;
  isVegetarianOnly?: boolean;

  // NGO
  ngoRegistrationNumber?: string;
  ngoType?: string;
  beneficiaryTypes?: string[];
  dailyBeneficiaries?: number;
  totalBeneficiaries?: number;
  hasPickupVehicle?: boolean;
  pickupRadius?: number;
  hasRefrigeration?: boolean;
  storageCapacityKg?: number;
  preferredFoodTypes?: string[];

  // Common org
  organizationDescription?: string;
  foundedYear?: number;
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string };

  // Verification
  isVerified?: boolean;
  verificationStatus?: 'pending' | 'under_review' | 'verified' | 'rejected';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  updateUser: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  isUser: boolean;
  isNGO: boolean;
  isRestaurant: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // ── Use sessionStorage so each tab is independent ─────────────────────────
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem(SESSION_KEY)
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Attach token to every axios request for THIS tab
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const saveSession = (newToken: string, userData: User) => {
    sessionStorage.setItem(SESSION_KEY, newToken);
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.success) {
      saveSession(response.data.token, response.data.user);
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }
    return response.data;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
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

  const refreshUser = async () => {
    if (token) await fetchUser();
  };

  // Role helpers
  const isUser = user?.role === 'user';
  const isNGO = user?.role === 'ngo';
  const isRestaurant = user?.role === 'restaurant';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      updateUser, refreshUser,
      isUser, isNGO, isRestaurant, isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};