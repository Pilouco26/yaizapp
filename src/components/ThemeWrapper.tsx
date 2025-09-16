import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Theme-aware Text component
export const ThemedText: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error';
  style?: any;
  [key: string]: any;
}> = ({ children, className = '', variant = 'primary', style, ...props }) => {
  const { colors } = useTheme();
  
  const getTextColor = () => {
    switch (variant) {
      case 'secondary': return colors.textSecondary;
      case 'tertiary': return colors.textTertiary;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      default: return colors.textPrimary;
    }
  };

  return (
    <Text 
      className={className} 
      style={[{ color: getTextColor() }, style]} 
      {...props}
    >
      {children}
    </Text>
  );
};

// Theme-aware View component
export const ThemedView: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'background' | 'surface' | 'card' | 'surfaceSecondary';
  style?: any;
  [key: string]: any;
}> = ({ children, className = '', variant = 'background', style, ...props }) => {
  const { colors } = useTheme();
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'surface': return colors.surface;
      case 'card': return colors.card;
      case 'surfaceSecondary': return colors.surfaceSecondary;
      default: return colors.background;
    }
  };

  return (
    <View 
      className={className} 
      style={[{ backgroundColor: getBackgroundColor() }, style]} 
      {...props}
    >
      {children}
    </View>
  );
};

// Theme-aware TextInput component
export const ThemedTextInput: React.FC<{
  className?: string;
  style?: any;
  [key: string]: any;
}> = ({ className = '', style, ...props }) => {
  const { colors } = useTheme();

  return (
    <TextInput
      className={className}
      style={[
        {
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          borderWidth: 0,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
        style
      ]}
      placeholderTextColor={colors.textTertiary}
      {...props}
    />
  );
};

// Theme-aware TouchableOpacity component
export const ThemedTouchableOpacity: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'surface' | 'surfaceSecondary';
  style?: any;
  [key: string]: any;
}> = ({ children, className = '', variant = 'surface', style, ...props }) => {
  const { colors } = useTheme();
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary': return { backgroundColor: colors.primary };
      case 'secondary': return { backgroundColor: colors.info };
      case 'success': return { backgroundColor: colors.success };
      case 'warning': return { backgroundColor: colors.warning };
      case 'error': return { backgroundColor: colors.error };
      case 'surfaceSecondary': return { backgroundColor: colors.surfaceSecondary };
      default: return { 
        backgroundColor: colors.surface
      };
    }
  };

  return (
    <TouchableOpacity
      className={className}
      style={[getButtonStyle(), style]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

// Theme-aware ScrollView component
export const ThemedScrollView: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: any;
  contentContainerStyle?: any;
  [key: string]: any;
}> = ({ children, className = '', style, contentContainerStyle, ...props }) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      className={className}
      style={[{ backgroundColor: colors.background }, style]}
      contentContainerStyle={contentContainerStyle}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

// Theme-aware Card component
export const ThemedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: any;
  [key: string]: any;
}> = ({ children, className = '', style, ...props }) => {
  const { colors } = useTheme();

  return (
    <View
      className={`${className} rounded-2xl shadow-lg shadow-black/5`}
      style={[
        {
          backgroundColor: colors.card
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// Theme-aware Border component
export const ThemedBorder: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: any;
  [key: string]: any;
}> = ({ children, className = '', style, ...props }) => {
  return (
    <View
      className={className}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}; 