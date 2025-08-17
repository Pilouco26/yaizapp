import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useObjective } from '../../hooks/useObjective';
import { formatCurrency } from '../../utils/helpers';
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedScrollView, ThemedCard } from '../../components/ThemeWrapper';
import { EnhancedInput } from '../../components/EnhancedInput';
import { useTheme } from '../../contexts/ThemeContext';

const HomeScreen: React.FC = () => {
  const [objectiveInput, setObjectiveInput] = useState<string>('');
  const [isUpdatingObjective, setIsUpdatingObjective] = useState(false);
  const [isRefreshingBills, setIsRefreshingBills] = useState(false);
  const { colors } = useTheme();
  const {
    objectiveAmount,
    totalBillsAmount,
    totalAvailable,
    updateObjective,
    refreshBillsData,
  } = useObjective();

  const handleUpdateObjective = async () => {
    const amount = parseFloat(objectiveInput);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Por favor ingresa un número válido mayor o igual a 0');
      return;
    }
    
    setIsUpdatingObjective(true);
    try {
      await updateObjective(amount);
      setObjectiveInput('');
      Alert.alert('Éxito', 'Objetivo actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el objetivo');
    } finally {
      setIsUpdatingObjective(false);
    }
  };

  const handleRefreshBills = async () => {
    setIsRefreshingBills(true);
    try {
      await refreshBillsData();
      Alert.alert('Éxito', 'Facturas actualizadas correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron actualizar las facturas');
    } finally {
      setIsRefreshingBills(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        <ThemedScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ 
            paddingBottom: 0,
            flexGrow: 1 
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, alignItems: 'center', padding: 20 }}>
            {/* Total Available Amount - Main Focus */}
            <ThemedCard className="w-full items-center mb-6 p-6">
              <ThemedText className="text-lg font-semibold mb-2 uppercase tracking-wide">
                Total Disponible
              </ThemedText>
              <ThemedText className="text-6xl font-bold text-center mb-4" style={{ color: colors.primary }}>
                {formatCurrency(totalAvailable)}
              </ThemedText>
              
              {/* Calculation Breakdown */}
              <ThemedView className="w-full mt-4 p-4 rounded-xl" variant="surface">
                <View className="flex-row justify-between items-center w-full mb-2">
                  <ThemedText className="text-base font-medium" variant="secondary">Objetivo:</ThemedText>
                  <ThemedText className="text-base font-semibold min-w-20 text-right">
                    {formatCurrency(objectiveAmount)}
                  </ThemedText>
                </View>
                <View className="flex-row justify-between items-center w-full mb-2">
                  <ThemedText className="text-base font-medium" variant="secondary">+ Facturas:</ThemedText>
                  <ThemedText className={`text-base font-semibold min-w-20 text-right ${
                    totalBillsAmount >= 0 ? 'text-blue-600' : 'text-blue-600'
                  }`}>
                    {formatCurrency(totalBillsAmount)}
                  </ThemedText>
                </View>
                <View className="w-full h-px bg-neutral-300 my-2" />
                <View className="flex-row justify-between items-center w-full">
                  <ThemedText className="text-base font-medium" variant="secondary">= Total:</ThemedText>
                  <ThemedText className="text-base font-semibold min-w-20 text-right">
                    {formatCurrency(totalAvailable)}
                  </ThemedText>
                </View>
              </ThemedView>
            </ThemedCard>

            {/* Objective Section - Smaller and Below */}
            <ThemedCard className="w-full items-center mb-6 p-5">
              <ThemedText className="text-base font-bold mb-3 uppercase tracking-wide">
                Objetivo del Mes
              </ThemedText>
              <ThemedText className="text-2xl font-bold text-center mb-4" style={{ color: colors.primary }}>
                {formatCurrency(objectiveAmount)}
              </ThemedText>
              
              {/* Input Section */}
              <View className="w-full mb-4">
                <ThemedText className="text-sm font-semibold mb-2 text-center">
                  Establecer nuevo objetivo:
                </ThemedText>
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    className={`flex-1 rounded-full shadow-md shadow-black/20 ${
                      isUpdatingObjective ? 'opacity-70' : ''
                    }`}
                    style={{ backgroundColor: isUpdatingObjective ? colors.textSecondary : colors.primary }}
                    onPress={handleUpdateObjective}
                    disabled={isUpdatingObjective}
                  >
                    <View className="flex-row items-center p-3">
                      <EnhancedInput
                        className="flex-1 border-0"
                        value={objectiveInput}
                        onChangeText={setObjectiveInput}
                        placeholder="Ingresa el monto objetivo"
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={handleUpdateObjective}
                        style={{
                          backgroundColor: 'transparent',
                          borderWidth: 0,
                          paddingHorizontal: 0,
                          paddingVertical: 0,
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: '500',
                        }}
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      />
                      <Ionicons 
                        name={isUpdatingObjective ? "hourglass" : "checkmark"} 
                        size={18} 
                        color="#ffffff" 
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedCard>

            {/* Bills Summary */}
            <ThemedCard className="items-center mb-6 p-5 w-full">
              <ThemedText className="text-lg font-bold mb-4 uppercase tracking-wide">
                Resumen de Facturas
              </ThemedText>
              <ThemedText className="text-base mb-2 font-medium" variant="secondary">
                Total: {formatCurrency(totalBillsAmount)}
              </ThemedText>
              <ThemedText className="text-base mb-2 font-medium" variant="secondary">
                Cantidad: {totalBillsAmount > 0 ? 'Ingresos' : 'Gastos'}
              </ThemedText>
            </ThemedCard>

            {/* Refresh Button */}
            <ThemedTouchableOpacity 
              className={`flex-row items-center px-6 py-4 rounded-full shadow-md shadow-black/20 ${
                isRefreshingBills ? 'opacity-70' : ''
              }`}
              variant="primary"
              onPress={handleRefreshBills}
              disabled={isRefreshingBills}
            >
              <Ionicons 
                name={isRefreshingBills ? "refresh" : "refresh-outline"} 
                size={20} 
                color="#ffffff" 
              />
              <ThemedText className="text-base font-semibold ml-2 uppercase tracking-wide" style={{ color: '#ffffff' }}>
                {isRefreshingBills ? 'Actualizando...' : 'Actualizar Facturas'}
              </ThemedText>
            </ThemedTouchableOpacity>
          </View>
        </ThemedScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default HomeScreen; 