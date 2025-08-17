import React, { useState } from 'react';
import { Alert } from 'react-native';
import LoginScreen from './LoginScreen';

const LoginScreenDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate credentials (demo purposes)
      if (email === 'demo@example.com' && password === 'password123') {
        Alert.alert('Éxito', 'Inicio de sesión exitoso');
        // Navigate to main app
      } else {
        Alert.alert('Error', 'Credenciales inválidas');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Éxito', `Cuenta creada para ${name} (${email})`);
      // Navigate to main app or show success message
    } catch (error) {
      Alert.alert('Error', 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetaLogin = async () => {
    setIsLoading(true);
    try {
      // Simulate Meta login
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Éxito', 'Inicio de sesión con Meta exitoso');
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión con Meta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      onSignup={handleSignup}
      onMetaLogin={handleMetaLogin}
      isLoading={isLoading}
    />
  );
};

export default LoginScreenDemo; 