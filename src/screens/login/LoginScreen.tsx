import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity } from '../../components/ThemeWrapper';

interface LoginScreenProps {
  onLogin: () => Promise<void>;
  onMetaLogin?: () => Promise<void>;
  isLoading?: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLogin, 
  onMetaLogin, 
  isLoading = false 
}) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <View className="flex-1 items-center justify-center p-5">
          {/* App Logo/Icon */}
          <View className="items-center mb-16">
            <View 
              className="w-32 h-32 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Ionicons name="wallet" size={64} color={colors.primary} />
            </View>
            <ThemedText className="text-4xl font-bold mb-2 text-center">
              YaizApp
            </ThemedText>
            <ThemedText className="text-lg text-center" variant="secondary">
              Gestiona tus ahorros y facturas
            </ThemedText>
          </View>
          
          {/* Login Form */}
          <View className="w-full max-w-sm">
            {/* Welcome Message */}
            <ThemedText className="text-center mb-8 text-lg" variant="secondary">
              Bienvenido a tu aplicación de finanzas personales
            </ThemedText>
            
            {/* Social Login Buttons */}
            <View className="mb-6">
              {/* Meta (Facebook) Login Button */}
              <ThemedTouchableOpacity 
                className={`flex-row items-center justify-center p-4 rounded-xl mb-3 shadow-md shadow-black/10 ${
                  isLoading ? 'opacity-70' : ''
                }`}
                style={{ backgroundColor: '#1877F2' }}
                onPress={onMetaLogin}
                disabled={isLoading}
              >
                <Ionicons name="logo-facebook" size={24} color="#ffffff" />
                <ThemedText className="text-lg font-semibold ml-3" style={{ color: '#ffffff' }}>
                  Continuar con Meta
                </ThemedText>
              </ThemedTouchableOpacity>
            </View>
            
            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px" style={{ backgroundColor: colors.textTertiary }} />
              <ThemedText className="mx-4 text-sm" variant="tertiary">
                o
              </ThemedText>
              <View className="flex-1 h-px" style={{ backgroundColor: colors.textTertiary }} />
            </View>
            
            {/* Direct Login Button */}
            <ThemedTouchableOpacity 
              className={`flex-row items-center justify-center p-5 rounded-xl mb-4 shadow-lg shadow-black/20 ${
                isLoading ? 'opacity-70' : ''
              }`}
              variant="primary"
              onPress={onLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="log-in" size={24} color="#ffffff" />
              )}
              <ThemedText className="text-lg font-semibold ml-3" style={{ color: '#ffffff' }}>
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </ThemedText>
            </ThemedTouchableOpacity>
            
            {/* Demo Note */}
            <ThemedText className="text-center text-sm" variant="tertiary">
              Modo de demostración - Acceso directo
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

export default LoginScreen; 