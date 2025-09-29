import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OAuthUser } from '../services/OAuthService';
import { HealthService } from '../services/apiservices/HealthService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: OAuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, name: string, email: string, password: string) => Promise<void>;
  loginWithMeta: () => Promise<void>;
  loginWithBiometric: () => Promise<void>;
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
      // Perform health check on app initialization
      ('🏥 Performing health check on app initialization...');
      try {
        const healthData = await HealthService.getHealth();
        console.log('✅ Health check successful:', {
          status: healthData.status,
          version: healthData.version,
          uptime: healthData.uptime,
          services: healthData.services
        });
      } catch (healthError) {
        console.warn('⚠️ Health check failed (app will continue):', healthError);
        // Don't throw error - app should continue even if health check fails
      }

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

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      if (!username || !password) {
        throw new Error('Usuario y contraseña son requeridos');
      }

      const { AuthService } = await import('../services/apiservices/AuthService');
      const res = await AuthService.login({ username, password });
      console.log('Login response:', res);

      if (!res?.success || (!res?.token && !res?.user)) {
        throw new Error('Credenciales inválidas');
      }

      const loggedUser: OAuthUser = {
        id: String(res.user?.id ?? username),
        email: String(res.user?.email ?? ''),
        name: String(res.user?.name ?? username),
        provider: 'direct',
      } as OAuthUser;

      await AsyncStorage.setItem('auth_status', 'authenticated');
      await AsyncStorage.setItem('auth_provider', 'direct');
      await AsyncStorage.setItem('user_data', JSON.stringify(loggedUser));
      // Store full API user for richer profile data (e.g., bankId, familyId)
      if (res.user) {
        await AsyncStorage.setItem('api_user', JSON.stringify(res.user));
      }
      if (res.token) {
        await AsyncStorage.setItem('auth_token', res.token);
      }

      setUser(loggedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      // Validate input
      if (!name || !email || !password) {
        throw new Error('Todos los campos son requeridos');
      }
      
      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }
      
      // Call backend register
      const { AuthService } = await import('../services/apiservices/AuthService');
      const response = await AuthService.register({ nom: name, username, email, password });

      // Persist auth status (token optional currently)
      const newUser: OAuthUser = {
        id: 'signup-user-' + Date.now(),
        email,
        name,
        provider: 'direct' as const,
      };

      await AsyncStorage.setItem('auth_status', 'authenticated');
      await AsyncStorage.setItem('auth_provider', 'direct');
      await AsyncStorage.setItem('user_data', JSON.stringify(newUser));
      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
      }

      setUser(newUser);
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

  const loginWithBiometric = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay for biometric login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For biometric login, we'll use a stored user or create a demo user
      // In a real app, you would verify biometric credentials and retrieve user data
      const storedUserData = await AsyncStorage.getItem('user_data');
      
      if (storedUserData) {
        // Use previously stored user data
        const parsedUser = JSON.parse(storedUserData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('auth_status', 'authenticated');
      } else {
        // Create a demo user for biometric login
        const biometricUser: OAuthUser = {
          id: 'biometric-user-' + Date.now(),
          email: 'biometric@example.com',
          name: 'Usuario Biométrico',
          provider: 'biometric' as const,
        };
        
        // Store authentication status and user data
        await AsyncStorage.setItem('auth_status', 'authenticated');
        await AsyncStorage.setItem('auth_provider', 'biometric');
        await AsyncStorage.setItem('user_data', JSON.stringify(biometricUser));
        
        setUser(biometricUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Biometric login error:', error);
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
        'user_data',
        'api_user'
      ]);
      
      setUser(null);
      setIsAuthenticated(false);
      
      ('User logged out successfully');
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
    loginWithBiometric,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 