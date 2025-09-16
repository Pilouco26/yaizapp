import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import TabNavigator from './TabNavigator';
import ConfigurationScreen from '../screens/configuration/ConfigurationScreen';
import BankScreen from '../screens/bank/BankScreen';
import FamilyScreen from '../screens/family/FamilyScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Configuration: undefined;
  Bank: undefined;
  Family: undefined;
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
        name="MainTabs" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Configuration" 
        component={ConfigurationScreen}
        options={{ 
          title: 'Configuración',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Bank" 
        component={BankScreen}
        options={{ 
          title: 'Banco',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Family" 
        component={FamilyScreen}
        options={{ 
          title: 'Familia',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

StackNavigator.displayName = 'StackNavigator';

export default StackNavigator;
