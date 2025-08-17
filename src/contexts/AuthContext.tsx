import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OAuthUser } from '../services/OAuthService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: OAuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithMeta: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<OAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AsyncStorage.getItem('auth_status');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (authStatus === 'authenticated' && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Simulate API call delay for login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any valid email/password combination
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      // Create a mock user for login
      const mockUser: OAuthUser = {
        id: 'login-user-' + Date.now(),
        email: email,
        name: email.split('@')[0], // Use email prefix as name
        provider: 'direct' as const,
      };
      
      // Store authentication status and user data
      await AsyncStorage.setItem('auth_status', 'authenticated');
      await AsyncStorage.setItem('auth_provider', 'direct');
      await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      // Simulate API call delay for signup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate input
      if (!name || !email || !password) {
        throw new Error('Todos los campos son requeridos');
      }
      
      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }
      
      // Create a mock user for signup
      const mockUser: OAuthUser = {
        id: 'signup-user-' + Date.now(),
        email: email,
        name: name,
        provider: 'direct' as const,
      };
      
      // Store authentication status and user data
      await AsyncStorage.setItem('auth_status', 'authenticated');
      await AsyncStorage.setItem('auth_provider', 'direct');
      await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMeta = async () => {
    try {
      setIsLoading(true);
      
      // For now, we'll keep the existing Facebook OAuth implementation
      // TODO: Migrate to Facebook SDK as well
      throw new Error('Facebook login not yet migrated to SDK');
    } catch (error) {
      console.error('Meta login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear all stored data
      await AsyncStorage.multiRemove([
        'auth_status',
        'auth_provider',
        'user_data'
      ]);
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if sign out fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    signup,
    loginWithMeta,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 