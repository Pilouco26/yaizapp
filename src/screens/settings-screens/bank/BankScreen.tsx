import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity } from '../../../components/ThemeWrapper';
import { BanksService, UsersService } from '../../../services';
import { APIBank } from '../../../services/apiservices/BanksService';
import { useAuth } from '../../../contexts/AuthContext';

const BankScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [banks, setBanks] = useState<APIBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);


  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setIsLoading(true);
        const banksData = await BanksService.getBanks();
        setBanks(banksData);
      } catch (error) {
        console.error('Error fetching banks:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        Alert.alert('Error', `No se pudieron cargar los bancos: ${errorMessage}`);
        setBanks([]); // Ensure banks array is empty on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanks();
  }, []);


  const handleBankPress = (bankId: string) => {
    setSelectedBank(bankId);
  };

  const handleConfirm = async () => {
    if (!selectedBank) {
      Alert.alert('Error', 'Por favor selecciona un banco');
      return;
    }

    setIsUpdating(true);
    try {
      // Use hardcoded user ID 1 as expected by the API
      const userId = 1;
      await UsersService.updateUser(userId, { bankId: parseInt(selectedBank) });
      Alert.alert('Éxito', 'Banco actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            // Reset selection after successful update
            setSelectedBank(null);
          }
        }
      ]);
    } catch (error) {
      console.error('Error updating user bank:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudo actualizar el banco: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center p-4">
            <ThemedText className="text-lg font-medium mb-4">
              Cargando bancos...
            </ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        <View className="flex-1 p-4">
          <ThemedText className="text-2xl font-bold mb-6 text-center">
            Seleccionar Banco
          </ThemedText>
          
          <View className="flex-1">
            {banks.length === 0 ? (
              <View className="flex-1 items-center justify-center p-8">
                <Ionicons 
                  name="business-outline" 
                  size={64} 
                  color={colors.textSecondary + '60'} 
                />
                <ThemedText className="text-lg font-medium mt-4 text-center">
                  No hay bancos disponibles
                </ThemedText>
                <ThemedText className="text-sm text-center mt-2 opacity-70">
                  Intenta recargar la página o contacta al soporte
                </ThemedText>
              </View>
            ) : (
              banks.map((bank, index) => {
                const isSelected = selectedBank === bank.id.toString();
                return (
                  <ThemedTouchableOpacity
                    key={bank.id}
                    className="flex-row items-center p-4 rounded-xl mb-3"
                    variant="surface"
                    onPress={() => handleBankPress(bank.id.toString())}
                    activeOpacity={1}
                    style={{
                      minHeight: 80,
                      backgroundColor: isSelected ? colors.primary + '20' : '#f5f5f5',
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected ? colors.primary : 'transparent',
                      opacity: 1,
                    }}
                  >
                    <View className="flex-1">
                      <ThemedText 
                        className="text-lg font-medium"
                        style={{ color: isSelected ? colors.primary : undefined }}
                      >
                        {bank.name}
                      </ThemedText>
                      <ThemedText 
                        className="text-sm opacity-70 mt-1"
                        style={{ color: isSelected ? colors.primary : undefined }}
                      >
                        {bank.type} • Acepta {bank.fileAcceptance}
                      </ThemedText>
                    </View>
                    {isSelected && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={24} 
                        color={colors.primary} 
                      />
                    )}
                  </ThemedTouchableOpacity>
                );
              })
            )}
          </View>
          
          {/* Confirm Button */}
          {selectedBank && (
            <ThemedTouchableOpacity
              className="flex-row items-center justify-center p-4 rounded-xl mt-4"
              variant="primary"
              onPress={handleConfirm}
              activeOpacity={1}
              disabled={isUpdating}
              style={{
                opacity: isUpdating ? 0.7 : 1,
              }}
            >
              <Ionicons 
                name={isUpdating ? "hourglass" : "checkmark"} 
                size={20} 
                color="#ffffff" 
              />
              <ThemedText className="text-base font-semibold ml-2" style={{ color: '#ffffff' }}>
                {isUpdating ? 'Actualizando...' : 'Confirmar Banco'}
              </ThemedText>
            </ThemedTouchableOpacity>
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

export default BankScreen;
