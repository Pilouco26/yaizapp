import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import TabNavigator from './TabNavigator';
import ConfigurationScreen from '../screens/settings-screens/configuration/ConfigurationScreen';
import BankScreen from '../screens/settings-screens/bank/BankScreen';
import FamilyScreen from '../screens/settings-screens/family/FamilyScreen';
import CreateFamilyScreen from '../screens/settings-screens/family/CreateFamilyScreen';
import NotificationsScreen from '../screens/settings-screens/notifications/NotificationsScreen';

export type RootStackParamList = {
  Perfil: undefined;
  Configuration: undefined;
  Bank: undefined;
  Family: undefined;
  CreateFamily: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const { colors, theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: '',
      }}
    >
      <Stack.Screen 
        name="Perfil" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Configuration" 
        component={ConfigurationScreen}
        options={{ 
          title: 'Configuración',
          headerShown: true,
          headerBackTitle: 'Perfil',
        }}
      />
      <Stack.Screen 
        name="Bank" 
        component={BankScreen}
        options={{ 
          title: 'Banco',
          headerShown: true,
          headerBackTitle: 'Configuración',
        }}
      />
      <Stack.Screen 
        name="Family" 
        component={FamilyScreen}
        options={{ 
          title: 'Familia',
          headerShown: true,
          headerBackTitle: 'Configuración',
        }}
      />
      <Stack.Screen 
        name="CreateFamily" 
        component={CreateFamilyScreen}
        options={{ 
          title: 'Crear Familia',
          headerShown: true,
          headerBackTitle: 'Familia',
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ 
          title: 'Notificaciones',
          headerShown: true,
          headerBackTitle: 'Configuración',
        }}
      />
    </Stack.Navigator>
  );
};

StackNavigator.displayName = 'StackNavigator';

export default StackNavigator;
