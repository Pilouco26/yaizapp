import React, { useState } from 'react';
import { View, TextInput, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface EnhancedInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  style?: any;
  [key: string]: any;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  className = '',
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', 'transparent'],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <View className={`w-full ${className}`}>
      {label && (
        <Animated.Text
          style={[
            styles.label,
            {
              color: isFocused ? colors.primary : colors.textSecondary,
              transform: [{ scale: scale }],
            },
          ]}
        >
          {label}
        </Animated.Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            backgroundColor: 'transparent',
          },
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
}); 