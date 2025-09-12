import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginScreen from '../screens/login/LoginScreen';
import TabNavigator from '../navigation/TabNavigator';

const AppWrapper: React.FC = () => {
  const { isAuthenticated, isLoading, login, signup, loginWithMeta } = useAuth();
  const { colors, theme } = useTheme();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <LoginScreen 
          onLogin={login} 
          onSignup={signup}
          onMetaLogin={loginWithMeta}
          isLoading={isLoading} 
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <TabNavigator />
    </>
  );
};

export default AppWrapper; 