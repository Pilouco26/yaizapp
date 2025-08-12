import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minHeight: 48,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? '#ccc' : '#f4511e',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? '#ccc' : '#6c757d',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    };

    switch (variant) {
      case 'outline':
        return {
          ...baseStyle,
          color: disabled ? '#ccc' : '#f4511e',
        };
      default:
        return {
          ...baseStyle,
          color: '#fff',
        };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={getTextStyle().color}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton; 