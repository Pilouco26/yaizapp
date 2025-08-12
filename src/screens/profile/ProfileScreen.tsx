import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity } from '../../components/ThemeWrapper';

const ProfileScreen: React.FC = () => {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <ThemedView className="flex-1 pt-12">
      <View className="flex-1 items-center justify-center p-5">
        <View className="items-center mb-10">
          <View 
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
          <ThemedText className="text-2xl font-bold mb-2">
            Usuario
          </ThemedText>
          <ThemedText className="text-base" variant="secondary">
            usuario@example.com
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
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} className="ml-auto" />
          </ThemedTouchableOpacity>
          
          <ThemedTouchableOpacity 
            className="flex-row items-center p-4 rounded-xl"
            style={{ 
              backgroundColor: colors.error,
              borderColor: colors.error
            }}
          >
            <Ionicons name="log-out" size={24} color="#ffffff" />
            <ThemedText className="text-base ml-3 font-medium text-white">
              Cerrar Sesión
            </ThemedText>
          </ThemedTouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
};

export default ProfileScreen; 