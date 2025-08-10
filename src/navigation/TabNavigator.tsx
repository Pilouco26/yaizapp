import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import SavingsScreen from '../screens/SavingsScreen';
import BillsScreen from '../screens/BillsScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type TabParamList = {
  Home: undefined;
  Savings: undefined;
  Bills: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Custom tab bar icons using Ionicons
const TabIcon: React.FC<{ focused: boolean; name: string }> = ({ focused, name }) => {
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
      color={focused ? '#f4511e' : '#666'} 
    />
  );
};

const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} name={route.name} />
        ),
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
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
        tabBarActiveTintColor: '#f4511e',
        tabBarInactiveTintColor: '#666',
        headerShown: false, // Hide individual screen headers since we have a main header
      })}
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