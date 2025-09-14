import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity } from '../../components/ThemeWrapper';

const BankScreen: React.FC = () => {
  const { colors } = useTheme();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const banks = [
    {
      id: 'creand',
      name: 'Creand',
      logo: require('../../utils/pictures/creand.png'),
    },
    {
      id: 'andbank',
      name: 'Andbank',
      logo: require('../../utils/pictures/andbank.jpg'),
    },
    {
      id: 'santander',
      name: 'Santander',
      logo: require('../../utils/pictures/Santander.svg'),
    },
    {
      id: 'bbva',
      name: 'BBVA',
      logo: require('../../utils/pictures/BBVA.svg'),
    },
  ];

  const handleBankPress = (bankId: string) => {
    setSelectedBank(bankId);
    console.log('Selected bank:', bankId);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        <View className="flex-1 p-4">
          <ThemedText className="text-2xl font-bold mb-6 text-center">
            Seleccionar Banco
          </ThemedText>
          
          <View className="flex-1">
            {banks.map((bank, index) => {
              const isSelected = selectedBank === bank.id;
              return (
                <ThemedTouchableOpacity
                  key={bank.id}
                  className="flex-row items-center p-4 rounded-xl mb-3"
                  variant="surface"
                  onPress={() => handleBankPress(bank.id)}
                  activeOpacity={1}
                  style={{
                    minHeight: 80,
                    backgroundColor: isSelected ? colors.primary + '20' : '#f5f5f5',
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? colors.primary : 'transparent',
                    opacity: 1,
                  }}
                >
                <View className="w-12 h-12 rounded-lg overflow-hidden mr-4">
                  <Image
                    source={bank.logo}
                    style={{
                      width: '100%',
                      height: '100%',
                      resizeMode: 'contain',
                    }}
                  />
                </View>
                <ThemedText 
                  className="text-lg font-medium flex-1"
                  style={{ color: isSelected ? colors.primary : undefined }}
                >
                  {bank.name}
                </ThemedText>
                {isSelected && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={colors.primary} 
                  />
                )}
              </ThemedTouchableOpacity>
              );
            })}
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

export default BankScreen;
