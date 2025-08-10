import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import JSONImportModal from '../components/JSONImportModal';
import NetworkTest from '../components/NetworkTest';
import { useBillsData } from '../hooks/useBillsData';
import { Bill } from '../utils/types';
import { formatDate } from '../utils/helpers';
import { getBills } from '../services/BillsService';
import sampleBills from '../utils/sampleBills.json';

const BillsScreen: React.FC = () => {
  const [showImportModal, setShowImportModal] = useState(false);

  const {
    bills,
    isLoading,
    error,
    isConnected,
    processJSONData,
    toggleBillPayment,
    getSummaryStats,
    clearBills,
  } = useBillsData();

  const [isFetching, setIsFetching] = useState(false);

  // Combina el loading interno del hook con el de la petición externa
  const loading = isLoading || isFetching;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  /**
   * Descarga las facturas desde Mockoon y las adapta al tipo Bill
   */
  const fetchBillsFromAPI = async () => {
  try {
    setIsFetching(true);

    const apiBills = await getBills();

    const transformed = apiBills.map((item: any, idx: number) => {
      // Parse the date from ISO format (e.g., "2024-01-15")
      const isoDate = new Date(item.date).toISOString();

      // Parse the amount value (it's already a number, but ensure it's positive)
      const amount = Math.abs(Number(item.value));

      const transformedBill = {
        id: `api-${idx}`,
        name: item.description,
        category: 'Otros',
        dueDate: isoDate,
        amount,
        currency: 'EUR', // Default to EUR as per your preference
        isPaid: false,
      } as Bill;
      
      return transformedBill;
    });

    await processJSONData(transformed);

  } catch (err: any) {
    Alert.alert('Error', err.message || 'No se pudieron cargar las facturas');
  } finally {
    setIsFetching(false);
  }
};

  useEffect(() => {
    // Cargar facturas desde la API al montar el componente
    fetchBillsFromAPI();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Utilities':
        return 'flash';
      case 'Communication':
        return 'call';
      case 'Housing':
        return 'home';
      case 'Insurance':
        return 'shield';
      case 'Transportation':
        return 'car';
      case 'Food':
        return 'restaurant';
      default:
        return 'document';
    }
  };

  /**
   * Convierte un array genérico de objetos
   * { date: string; description: string; value: number } | JSONBillData
   * al formato JSONBillData que la aplicación maneja.
   */
  const normalizeJSONBills = (data: any[]): Bill[] =>
    data.map((item, idx) => {
      // Si ya llega en formato correcto se devuelve tal cual
      if (item.id && item.dueDate && item.amount !== undefined) {
        return item as Bill;
      }

      const isoDate =
        typeof item.date === 'string'
          ? new Date(item.date).toISOString()
          : new Date().toISOString();

      return {
        id: `import-${idx}-${Date.now()}`,
        name: item.description ?? 'Sin descripción',
        category: 'Otros',
        dueDate: isoDate,
        amount: typeof item.value === 'number' ? item.value : 0,
        currency: 'EUR',
        isPaid: false,
      } as Bill;
    });

  const handleImportJSON = async (jsonData: Bill[] | any[]) => {
    const normalized = normalizeJSONBills(jsonData);
    await processJSONData(normalized);
    setShowImportModal(false);
  };
  const handleBillPress = (billId: string) => {
    toggleBillPayment(billId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Facturas" />
      
      {/* Connection Status */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={20} color="#F44336" />
          <Text style={styles.errorText}>Modo Sin Conexión - {error}</Text>
        </View>
      )}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f4511e" />
          <Text style={styles.loadingText}>Cargando facturas...</Text>
        </View>
      )}
      
      <ScrollView style={styles.content}>
        {/* Network Test Component */}
        <NetworkTest onTestComplete={(success) => {
          if (success) {
            console.log('🎉 ¡Prueba de red exitosa, ahora puedes cargar facturas!');
          } else {
            console.log('❌ Prueba de red fallida, revisa tu configuración');
          }
        }} />
        
        {/* Bills List */}
        <View style={styles.billsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Todas las Facturas ({bills.length})</Text>
            {bills.length > 0 && (
              <TouchableOpacity onPress={clearBills} style={styles.clearButton}>
                <Ionicons name="trash" size={16} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>
          
          {bills.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No se encontraron facturas</Text>
              <Text style={styles.emptyStateSubtext}>Importa datos JSON para comenzar</Text>
            </View>
          ) : (
            bills.map((bill) => (
              <TouchableOpacity key={bill.id} style={styles.billItem} onPress={() => handleBillPress(bill.id)}>
                <View style={styles.billIcon}>
                  <Ionicons 
                    name={getCategoryIcon(bill.category) as any} 
                    size={24} 
                    color={bill.isPaid ? '#4CAF50' : '#f4511e'} 
                  />
                </View>
                
                <View style={styles.billInfo}>
                  <Text style={styles.billName}>{bill.name}</Text>
                  <Text style={styles.billCategory}>{bill.category}</Text>
                  <Text style={styles.billDueDate}>Vence: {formatDate(bill.dueDate)}</Text>
                </View>
                
                <View style={styles.billAmount}>
                  <Text style={[
                    styles.billAmountText,
                    { color: bill.isPaid ? '#4CAF50' : '#F44336' }
                  ]}>
                    {formatCurrency(bill.amount)}
                  </Text>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: bill.isPaid ? '#4CAF50' : '#F44336' }
                  ]}>
                    <Ionicons 
                      name={bill.isPaid ? 'checkmark' : 'close'} 
                      size={12} 
                      color="#fff" 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* API and Import Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.apiButton}
            onPress={fetchBillsFromAPI}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.buttonText}>Recargar desde API</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.importButton}
            onPress={() => setShowImportModal(true)}
          >
            <Ionicons name="cloud-upload" size={24} color="#fff" />
            <Text style={styles.buttonText}>Importar JSON</Text>
          </TouchableOpacity>
        </View>

        {/* Sample Data Button */}
        <TouchableOpacity 
          style={styles.sampleButton}
          onPress={() => handleImportJSON(normalizeJSONBills(sampleBills as any[]))}
        >
          <Ionicons name="document-text" size={24} color="#fff" />
          <Text style={styles.buttonText}>Cargar Datos de Ejemplo</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* JSON Import Modal */}
      <JSONImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportJSON}
        isLoading={loading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#F44336',
    marginLeft: 8,
    fontSize: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  billsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    padding: 8,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  billCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  billDueDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  billAmount: {
    alignItems: 'flex-end',
  },
  billAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
  },
  apiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C27B0',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
});

export default BillsScreen;