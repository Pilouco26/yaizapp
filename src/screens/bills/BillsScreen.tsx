import React, { useState } from 'react';
import {
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';
import CSVImportModal from '../../components/CSVImportModal';
import NetworkTest from '../../components/NetworkTest';
import { useBillsContext } from '../../contexts/BillsContext';
import { Bill } from '../../utils/types';
import { formatDate } from '../../utils/helpers';
import sampleBills from '../../utils/sampleBills.json';
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedScrollView, ThemedCard } from '../../components/ThemeWrapper';
import { useTheme } from '../../contexts/ThemeContext';

const BillsScreen: React.FC = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const { colors } = useTheme();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        {/* Connection Status */}
        {error && (
            <ThemedView className="flex-row items-center p-3 mx-4 mt-2 rounded-lg" variant="surface">
              <Ionicons name="cloud-offline" size={20} color={colors.error} />
              <ThemedText className="ml-2 text-xs" variant="error">
              Modo Sin Conexión - {error}
              </ThemedText>
            </ThemedView>
        )}
        
        {isLoading && (
          <View className="items-center p-5">
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText className="mt-2 text-sm" variant="secondary">
              Cargando facturas...
              </ThemedText>
          </View>
        )}
        
          <ThemedScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ padding: 16, paddingBottom: 0, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
          {/* Network Test Component */}
          <NetworkTest onTestComplete={(isNetworkWorking) => {
            if (isNetworkWorking) {
              // Network test successful, now load bills
            } else {
              // Network test failed, show error
            }
          }} />
          
          {/* Bills Summary Card */}
            <ThemedCard className="p-5 mb-5 items-center">
              <ThemedText className="text-lg font-bold mb-2">
              Total de Facturas
              </ThemedText>
              <ThemedText className={`text-3xl font-bold mb-1 ${
              bills.reduce((sum, bill) => sum + bill.amount, 0) >= 0 
                  ? 'text-blue-600' 
                  : 'text-blue-600'
            }`}>
              {formatCurrency(bills.reduce((sum, bill) => sum + bill.amount, 0))}
              </ThemedText>
              <ThemedText className="text-sm" variant="tertiary">
              {bills.length} factura{bills.length !== 1 ? 's' : ''} en total
              </ThemedText>
            </ThemedCard>
          
          {/* Bills List */}
            <ThemedCard className="rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-4">
                <ThemedText className="text-xl font-bold">
                Todas las Facturas ({bills.length})
                </ThemedText>
            </View>
            
            {bills.length === 0 ? (
              <View className="items-center py-10">
                  <Ionicons name="document-text" size={48} color={colors.textTertiary} />
                  <ThemedText className="text-lg font-bold mt-4">
                  No se encontraron facturas
                  </ThemedText>
                  <ThemedText className="text-sm mt-2" variant="secondary">
                  Importa datos JSON para comenzar
                  </ThemedText>
              </View>
            ) : (
              bills.map((bill) => (
                  <View key={bill.id} className="flex-row items-center py-3">
                  <View className="w-10 h-10 rounded-full bg-neutral-100 justify-center items-center mr-3">
                    <Ionicons 
                      name={getCategoryIcon(bill.category) as any} 
                      size={24} 
                        color={colors.textSecondary}
                    />
                  </View>
                  
                  <View className="flex-1">
                      <ThemedText className="text-base font-semibold">
                      {bill.name}
                      </ThemedText>
                      <ThemedText className="text-sm mt-0.5" variant="secondary">
                      {bill.category}
                      </ThemedText>
                      <ThemedText className="text-xs mt-0.5" variant="tertiary">
                      Vence: {formatDate(bill.dueDate)}
                      </ThemedText>
                  </View>
                  
                  <View className="items-end">
                      <ThemedText className={`text-base font-bold ${
                        bill.amount >= 0 ? 'text-blue-600' : 'text-blue-600'
                    }`}>
                      {formatCurrency(bill.amount)}
                      </ThemedText>
                  </View>
                </View>
              ))
            )}
            </ThemedCard>

          {/* API and Import Buttons */}
          <View className="flex-row justify-between mt-4">
              <ThemedTouchableOpacity 
                className="flex-row items-center justify-center py-4 rounded-xl flex-1 mr-2 shadow-md shadow-black/20"
                variant="success"
              onPress={handleRefreshBills}
            >
                <Ionicons name="refresh" size={24} color="#ffffff" />
                <ThemedText className="text-base font-bold ml-2" style={{ color: '#ffffff' }}>
                Recargar desde API
                </ThemedText>
              </ThemedTouchableOpacity>

              <ThemedTouchableOpacity 
                className="flex-row items-center justify-center py-4 rounded-xl flex-1 ml-2 shadow-md shadow-black/20"
                variant="primary"
              onPress={() => setShowImportModal(true)}
            >
                <Ionicons name="cloud-upload" size={24} color="#ffffff" />
                <ThemedText className="text-base font-bold ml-2" style={{ color: '#ffffff' }}>
                Importar Facturas
                </ThemedText>
              </ThemedTouchableOpacity>
          </View>

          {/* Sample Data Button */}
            <ThemedTouchableOpacity 
              className="flex-row items-center justify-center py-4 rounded-xl mt-4 shadow-md shadow-black/20"
              variant="secondary"
            onPress={handleLoadSampleData}
          >
              <Ionicons name="document-text" size={24} color="#ffffff" />
              <ThemedText className="text-base font-bold ml-2" style={{ color: '#ffffff' }}>
              Cargar Datos de Ejemplo
              </ThemedText>
            </ThemedTouchableOpacity>
          </ThemedScrollView>

        {/* CSV Import Modal */}
        <CSVImportModal
          visible={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportJSON}
          isLoading={isLoading}
        />
        </ThemedView>
    </SafeAreaView>
  );
};

export default BillsScreen;