import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppWrapper from './src/components/AppWrapper';
import { BillsProvider } from './src/contexts/BillsContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <BillsProvider>
            <NavigationContainer>
              <AppWrapper />
            </NavigationContainer>
          </BillsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
