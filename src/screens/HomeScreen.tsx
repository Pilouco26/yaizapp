import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useObjective } from '../hooks/useObjective';
import { formatCurrency } from '../utils/helpers';

const HomeScreen: React.FC = () => {
  const [objectiveInput, setObjectiveInput] = useState<string>('');
  const [isUpdatingObjective, setIsUpdatingObjective] = useState(false);
  const [isRefreshingBills, setIsRefreshingBills] = useState(false);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Yaizapp" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Objective Section */}
          <View style={styles.objectiveSection}>
            <Text style={styles.objectiveLabel}>Objetivo del Mes</Text>
            <Text style={styles.objectiveAmount}>
              {formatCurrency(objectiveAmount)}
            </Text>
            
            {/* Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Establecer nuevo objetivo:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={objectiveInput}
                  onChangeText={setObjectiveInput}
                  placeholder="Ingresa el monto objetivo"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={handleUpdateObjective}
                />
                <TouchableOpacity 
                  style={[
                    styles.updateButton,
                    isUpdatingObjective && styles.updateButtonDisabled
                  ]}
                  onPress={handleUpdateObjective}
                  disabled={isUpdatingObjective}
                >
                  <Ionicons 
                    name={isUpdatingObjective ? "hourglass" : "checkmark"} 
                    size={20} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Available Amount */}
            <View style={styles.totalAvailableSection}>
              <Text style={styles.totalAvailableLabel}>Total Disponible:</Text>
              <Text style={styles.totalAvailableAmount}>
                {formatCurrency(totalAvailable)}
              </Text>
              
              {/* Calculation Breakdown */}
              <View style={styles.calculationBreakdown}>
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>Objetivo:</Text>
                  <Text style={styles.calculationValue}>
                    {formatCurrency(objectiveAmount)}
                  </Text>
                </View>
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>+ Facturas:</Text>
                  <Text style={[
                    styles.calculationValue,
                    { color: totalBillsAmount >= 0 ? '#4CAF50' : '#f44336' }
                  ]}>
                    {formatCurrency(totalBillsAmount)}
                  </Text>
                </View>
                <View style={styles.calculationDivider} />
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>= Total:</Text>
                  <Text style={styles.calculationValue}>
                    {formatCurrency(totalAvailable)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bills Summary */}
            <View style={styles.billsSummary}>
              <Text style={styles.billsSummaryTitle}>
                Resumen de Facturas
              </Text>
              <Text style={styles.billsSummaryText}>
                Total: {formatCurrency(totalBillsAmount)}
              </Text>
              <Text style={styles.billsSummaryText}>
                Cantidad: {totalBillsAmount > 0 ? 'Ingresos' : 'Gastos'}
              </Text>
            </View>

            {/* Refresh Button */}
            <TouchableOpacity 
              style={[
                styles.refreshButton,
                isRefreshingBills && styles.refreshButtonDisabled
              ]}
              onPress={handleRefreshBills}
              disabled={isRefreshingBills}
            >
              <Ionicons 
                name={isRefreshingBills ? "refresh" : "refresh-outline"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.refreshButtonText}>
                {isRefreshingBills ? 'Actualizando...' : 'Actualizar Facturas'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  // Objective Section Styles
  objectiveSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    padding: 25,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  objectiveLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  objectiveAmount: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#f4511e',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputSection: {
    width: '100%',
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#e9ecef',
    paddingHorizontal: 20,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 15,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  totalAvailableSection: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalAvailableLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalAvailableAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calculationBreakdown: {
    width: '100%',
    marginTop: 15,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 80,
    textAlign: 'right',
  },
  calculationDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#dee2e6',
    marginVertical: 10,
  },
  billsSummary: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  billsSummaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  billsSummaryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refreshButtonDisabled: {
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default HomeScreen; 