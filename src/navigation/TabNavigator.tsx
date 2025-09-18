import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/home/HomeScreen';
import SavingsScreen from '../screens/main/savings/SavingsScreen';
import BillsScreen from '../screens/main/bills/BillsScreen';
import ProfileScreen from '../screens/main/profile/ProfileScreen';
import { useTheme } from '../contexts/ThemeContext';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Custom tab bar icons using Ionicons
const TabIcon: React.FC<{ focused: boolean; name: string }> = ({ focused, name }) => {
  const { colors } = useTheme();

  const getIconName = () => {
    switch (name) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
      case 'Savings':
        return focused ? 'wallet' : 'wallet-outline';
      case 'Bills':
        return focused ? 'document-text' : 'document-text-outline';
      case 'Profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'help-outline';
    }
  };

  return (
    <Ionicons 
      name={getIconName() as any} 
      size={24} 
      color={focused ? colors.primary : colors.textTertiary} 
    />
  );
};

const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name={route.name} />
          ),
          tabBarStyle: {
            backgroundColor: colors.card,
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 5,
            paddingTop: 5,
            height: Platform.OS === 'ios' ? 60 + insets.bottom : 60,
            // iPhone-specific styling
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginBottom: Platform.OS === 'ios' ? 0 : 2,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          headerShown: false, // Hide individual screen headers since we have a main header
        };
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="Savings" 
        component={SavingsScreen}
        options={{
          title: 'Ahorros',
        }}
      />
      <Tab.Screen 
        name="Bills" 
        component={BillsScreen}
        options={{
          title: 'Facturas',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 