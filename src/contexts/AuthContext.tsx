import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OAuthUser } from '../services/OAuthService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: OAuthUser | null;
  login: () => Promise<void>;
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

  const login = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay for direct login
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a mock user for direct login
      const mockUser: OAuthUser = {
        id: 'direct-user-' + Date.now(),
        email: 'usuario@example.com',
        name: 'Usuario Directo',
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