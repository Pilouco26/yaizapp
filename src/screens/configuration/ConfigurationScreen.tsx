import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity } from '../../components/ThemeWrapper';

const ConfigurationScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleBankPress = () => {
    navigation.navigate('Bank' as never);
  };

  const handleFamilyPress = () => {
    navigation.navigate('Family' as never);
  };

  const handleNotificationsPress = () => {
    navigation.navigate('Notifications' as never);
  };

  const configurationOptions = [
    {
      id: 'bank',
      title: 'Banco',
      icon: 'card',
      onPress: handleBankPress,
    },
    {
      id: 'family',
      title: 'Familia',
      icon: 'people',
      onPress: handleFamilyPress,
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: 'notifications',
      onPress: handleNotificationsPress,
    },
    {
      id: 'privacy',
      title: 'Privacidad',
      icon: 'shield-checkmark',
      onPress: () => {},
    },
    {
      id: 'security',
      title: 'Seguridad',
      icon: 'lock-closed',
      onPress: () => {},
    },
    {
      id: 'backup',
      title: 'Respaldo',
      icon: 'cloud-upload',
      onPress: () => {},
    },
    {
      id: 'language',
      title: 'Idioma',
      icon: 'language',
      onPress: () => {},
    },
    {
      id: 'currency',
      title: 'Moneda',
      icon: 'cash',
      onPress: () => {},
    },
    {
      id: 'about',
      title: 'Acerca de',
      icon: 'information-circle',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        <View className="flex-1 p-4">
          
          <View className="flex-1">
            {configurationOptions.map((option, index) => (
              <ThemedTouchableOpacity
                key={option.id}
                className="flex-row items-center p-4 rounded-xl mb-3"
                variant="surface"
                onPress={option.onPress}
                style={{
                  minHeight: 60,
                }}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={colors.primary} 
                />
                <ThemedText className="text-lg font-medium ml-4 flex-1">
                  {option.title}
                </ThemedText>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={colors.textTertiary} 
                />
              </ThemedTouchableOpacity>
            ))}
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

export default ConfigurationScreen;
