import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import { BillsProvider } from './src/contexts/BillsContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import "./global.css";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <BillsProvider>
          <NavigationContainer>
            <TabNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </BillsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
