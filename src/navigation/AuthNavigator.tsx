import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import LoginScreen from '../screens/login/LoginScreen';
import NameScreen from '../screens/login/NameScreen';

export type AuthStackParamList = {
  Login: undefined;
  Name: { username: string; email: string; password: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: '',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Name"
        component={NameScreen}
        options={{ title: 'Tu nombre' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;


