import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity } from '../../components/ThemeWrapper';
import { UsersService } from '../../services';
import { user_id } from '../../config/constants';
import { User as ApiUser } from '../../services/types';

const ProfileScreen: React.FC = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const [authProvider, setAuthProvider] = useState<string>('direct');
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    // Get the authentication provider
    const getAuthProvider = async () => {
      try {
        const provider = await AsyncStorage.getItem('auth_provider');
        if (provider) {
          setAuthProvider(provider);
        }
      } catch (error) {
        console.error('Error getting auth provider:', error);
      }
    };
    
    getAuthProvider();
  }, []);

  useEffect(() => {
    // Fetch user data from API (id = 1)
    const fetchUserData = async () => {
      try {
        const users = await UsersService.searchUsers({ id: user_id });
        if (users.length > 0) {
          setApiUser(users[0]);
        } else {
        }
      } catch (error) {
        console.error('❌ [ProfileScreen] Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Debug logging for user data
  useEffect(() => {
  }, [user]);

  const getProviderIcon = () => {
    switch (authProvider) {
      case 'google':
        return 'logo-google';
      case 'meta':
        return 'logo-facebook';
      default:
        return 'person';
    }
  };

  const getProviderName = () => {
    switch (authProvider) {
      case 'google':
        return 'Google';
      case 'meta':
        return 'Meta';
      default:
        return 'Directo';
    }
  };

  const getProviderColor = () => {
    switch (authProvider) {
      case 'google':
        return '#DB4437';
      case 'meta':
        return '#1877F2';
      default:
        return colors.primary;
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center p-5">
          <View className="items-center mb-10">
              <View 
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: getProviderColor() + '20' }}
              >
                <Ionicons name={getProviderIcon() as any} size={48} color={getProviderColor()} />
            </View>
              <ThemedText className="text-2xl font-bold mb-2">
                {apiUser?.name || user?.name || 'Usuario'}
              </ThemedText>
              <ThemedText className="text-base" variant="secondary">
                {apiUser?.email || user?.email || 'usuario@example.com'}
              </ThemedText>
              <ThemedText className="text-sm mt-1" variant="tertiary">
                @{apiUser?.username || 'username'}
              </ThemedText>
              <ThemedText className="text-sm mt-1" variant="tertiary">
                Conectado con {getProviderName()}
              </ThemedText>
          </View>
          
          <View className="w-full max-w-sm">
              {/* Theme Toggle Button */}
              <ThemedTouchableOpacity 
                className="flex-row items-center p-4 rounded-xl mb-3"
                onPress={toggleTheme}
              >
                <Ionicons 
                  name={theme === 'light' ? 'moon' : 'sunny'} 
                  size={24} 
                  color={theme === 'light' ? colors.textSecondary : colors.primary} 
                />
                <ThemedText className="text-base ml-3 font-medium">
                  {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                </ThemedText>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={colors.textTertiary} 
                  className="ml-auto" 
                />
              </ThemedTouchableOpacity>
              
              <ThemedTouchableOpacity 
                className="flex-row items-center p-4 rounded-xl mb-3"
              >
                <Ionicons name="settings" size={24} color={colors.textSecondary} />
                <ThemedText className="text-base ml-3 font-medium">
                Configuración
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} className="ml-auto" />
              </ThemedTouchableOpacity>
            
              <ThemedTouchableOpacity 
                className="flex-row items-center p-4 rounded-xl mb-3"
              >
                <Ionicons name="help-circle" size={24} color={colors.textSecondary} />
                <ThemedText className="text-base ml-3 font-medium">
                Ayuda
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} className="ml-auto" />
              </ThemedTouchableOpacity>
            
              <ThemedTouchableOpacity 
                className="flex-row items-center p-4 rounded-xl mb-3"
              >
                <Ionicons name="information-circle" size={24} color={colors.textSecondary} />
                <ThemedText className="text-base ml-3 font-medium">
                Acerca de
                </ThemedText>
              </ThemedTouchableOpacity>
            
              <ThemedTouchableOpacity 
                className="flex-row items-center p-4 rounded-xl"
                style={{ 
                  backgroundColor: colors.error,
                  borderColor: colors.error
                }}
                onPress={handleLogout}
              >
                <Ionicons name="log-out" size={24} color="#ffffff" />
                <ThemedText className="text-base ml-3 font-medium text-white">
                Cerrar Sesión
                </ThemedText>
              </ThemedTouchableOpacity>
            </View>
          </View>
      </ThemedView>
    </SafeAreaView>
  );
};

export default ProfileScreen; 