import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginScreen from '../screens/login/LoginScreen';
import TabNavigator from '../navigation/TabNavigator';

const AppWrapper: React.FC = () => {
  const { isAuthenticated, isLoading, login, loginWithMeta } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLogin={login} 
        onMetaLogin={loginWithMeta}
        isLoading={isLoading} 
      />
    );
  }

  return <TabNavigator />;
};

export default AppWrapper; 