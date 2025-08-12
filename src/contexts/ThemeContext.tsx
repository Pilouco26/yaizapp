import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  
  // Card colors
  card: string;
  cardSecondary: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Neutral colors
  neutral50: string;
  neutral100: string;
  neutral200: string;
  neutral300: string;
  neutral400: string;
  neutral500: string;
  neutral600: string;
  neutral700: string;
  neutral800: string;
  neutral900: string;
  neutral: string;
}

// Light theme colors
export const lightTheme: ThemeColors = {
  // Background colors
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceSecondary: '#f1f5f9',
  card: '#ffffff',
  cardSecondary: '#f8fafc',
  
  // Text colors
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#64748b',
  
  // Border colors - no contours
  border: 'transparent',
  borderSecondary: 'transparent',
  
  // Status colors
  success: '#0ea5e9',
  warning: '#0ea5e9',
  error: '#0ea5e9',
  
  // Primary colors (blue variants)
  primary: '#0ea5e9',
  primaryLight: '#38bdf8',
  primaryDark: '#0369a1',
  info: '#3b82f6',
  
  // Neutral colors
  neutral50: '#f8fafc',
  neutral100: '#f1f5f9',
  neutral200: '#e2e8f0',
  neutral300: '#cbd5e1',
  neutral400: '#94a3b8',
  neutral500: '#64748b',
  neutral600: '#475569',
  neutral700: '#334155',
  neutral800: '#1e293b',
  neutral900: '#0f172a',
  neutral: '#64748b',
};

// Dark theme colors
export const darkTheme: ThemeColors = {
  // Background colors
  background: '#0f172a',
  surface: '#1e293b',
  surfaceSecondary: '#334155',
  card: '#1e293b',
  cardSecondary: '#334155',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  
  // Border colors - no contours
  border: 'transparent',
  borderSecondary: 'transparent',
  
  // Status colors
  success: '#0ea5e9',
  warning: '#0ea5e9',
  error: '#0ea5e9',
  
  // Primary colors (blue variants)
  primary: '#38bdf8',
  primaryLight: '#60a5fa',
  primaryDark: '#0ea5e9',
  info: '#60a5fa',
  
  // Neutral colors
  neutral50: '#0f172a',
  neutral100: '#1e293b',
  neutral200: '#334155',
  neutral300: '#475569',
  neutral400: '#64748b',
  neutral500: '#94a3b8',
  neutral600: '#cbd5e1',
  neutral700: '#e2e8f0',
  neutral800: '#f1f5f9',
  neutral900: '#f8fafc',
  neutral: '#94a3b8',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Load saved theme from storage
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 