import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import CSVImportModal from '../components/CSVImportModal';
import NetworkTest from '../components/NetworkTest';
import { useBillsContext } from '../contexts/BillsContext';
import { Bill } from '../utils/types';
import { formatDate } from '../utils/helpers';
import sampleBills from '../utils/sampleBills.json';

const BillsScreen: React.FC = () => {
  const [showImportModal, setShowImportModal] = useState(false);

  const {
    bills,
    isLoading,
    error,
    refreshBills,
  } = useBillsContext();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
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
      } as Bill;
    });

  const handleImportJSON = async (jsonData: Bill[] | any[]) => {
    const normalized = normalizeJSONBills(jsonData);
    // Note: This would need to be integrated with the context
    // For now, we'll just refresh from API
    await refreshBills();
    setShowImportModal(false);
  };

  const handleRefreshBills = async () => {
    try {
      await refreshBills();
      Alert.alert('Éxito', 'Facturas actualizadas correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron actualizar las facturas');
    }
  };

  const handleLoadSampleData = async () => {
    try {
      // Note: This would need to be integrated with the context
      // For now, we'll just refresh from API
      await refreshBills();
      Alert.alert('Éxito', 'Datos de ejemplo cargados');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos de ejemplo');
    }
  };

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
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f4511e" />
          <Text style={styles.loadingText}>Cargando facturas...</Text>
        </View>
      )}
      
      <ScrollView style={styles.content}>
        {/* Network Test Component */}
        <NetworkTest onTestComplete={(isNetworkWorking) => {
          if (isNetworkWorking) {
            // Network test successful, now load bills
          } else {
            // Network test failed, show error
          }
        }} />
        
        {/* Bills Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total de Facturas</Text>
          <Text style={[
            styles.summaryAmount,
            { color: bills.reduce((sum, bill) => sum + bill.amount, 0) >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            {formatCurrency(bills.reduce((sum, bill) => sum + bill.amount, 0))}
          </Text>
          <Text style={styles.summarySubtitle}>
            {bills.length} factura{bills.length !== 1 ? 's' : ''} en total
          </Text>
        </View>
        
        {/* Bills List */}
        <View style={styles.billsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Todas las Facturas ({bills.length})</Text>
          </View>
          
          {bills.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No se encontraron facturas</Text>
              <Text style={styles.emptyStateSubtext}>Importa datos JSON para comenzar</Text>
            </View>
          ) : (
            bills.map((bill) => (
              <View key={bill.id} style={styles.billItem}>
                <View style={styles.billIcon}>
                  <Ionicons 
                    name={getCategoryIcon(bill.category) as any} 
                    size={24} 
                    color="#666"
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
                    { color: bill.amount >= 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    {formatCurrency(bill.amount)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* API and Import Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.apiButton}
            onPress={handleRefreshBills}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.buttonText}>Recargar desde API</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.importButton}
            onPress={() => setShowImportModal(true)}
          >
            <Ionicons name="cloud-upload" size={24} color="#fff" />
            <Text style={styles.buttonText}>Importar Facturas</Text>
          </TouchableOpacity>
        </View>

        {/* Sample Data Button */}
        <TouchableOpacity 
          style={styles.sampleButton}
          onPress={handleLoadSampleData}
        >
          <Ionicons name="document-text" size={24} color="#fff" />
          <Text style={styles.buttonText}>Cargar Datos de Ejemplo</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CSV Import Modal */}
      <CSVImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportJSON}
        isLoading={isLoading}
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
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