import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <ThemedView className="flex-1 pt-12">
      <ThemedScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="flex-1 items-center p-5">
          {/* Objective Section */}
          <ThemedCard className="w-full items-center mb-10 p-6">
            <ThemedText className="text-xl font-bold mb-4 uppercase tracking-wide">
              Objetivo del Mes
            </ThemedText>
            <ThemedText className="text-5xl font-bold text-center mb-6" style={{ color: colors.primary }}>
              {formatCurrency(objectiveAmount)}
            </ThemedText>
            
            {/* Input Section */}
            <View className="w-full mb-6">
              <ThemedText className="text-base font-semibold mb-3 text-center">
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
                  <View className="flex-row items-center p-4">
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
                        fontSize: 16,
                        fontWeight: '500',
                      }}
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    />
                    <Ionicons 
                      name={isUpdatingObjective ? "hourglass" : "checkmark"} 
                      size={20} 
                      color="#ffffff" 
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Available Amount */}
            <ThemedCard className="items-center mb-6 p-5 w-full">
              <ThemedText className="text-lg font-semibold mb-2 uppercase tracking-wide">
                Total Disponible:
              </ThemedText>
              <ThemedText className="text-3xl font-bold mb-1">
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
          </ThemedCard>
        </View>
      </ThemedScrollView>
    </ThemedView>
  );
};

export default HomeScreen; 