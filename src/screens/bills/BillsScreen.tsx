import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';
import CSVImportModal from '../../components/CSVImportModal';
import { useBillsContext } from '../../contexts/BillsContext';
import { Bill } from '../../utils/types';
import { formatDate } from '../../utils/helpers';
import sampleBills from '../../utils/sampleBills.json';
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedScrollView, ThemedCard } from '../../components/ThemeWrapper';
import { useTheme } from '../../contexts/ThemeContext';
import { TransactionsService } from '../../services/apiservices/TransactionsService';
import { user_id } from '../../config/constants';

const BillsScreen: React.FC = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
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

  const truncateBillName = (name: string, maxLength: number = 25) => {
    if (name.length <= maxLength) {
      return name;
    }
    return name.substring(0, maxLength - 3) + '...';
  };

  // Pagination logic
  const totalPages = Math.ceil(bills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBills = bills.slice(startIndex, endIndex);

  // Simple navigation functions
  const goToNextPage = () => {
    if (currentPage < totalPages && totalPages > 0) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when bills change
  useEffect(() => {
    setCurrentPage(1);
  }, [bills.length]);

  // Ensure current page is within valid range
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Fetch transactions from API using the same authentication as other screens
  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      
      const { getFullApiUrlWithAuth, getDefaultHeaders, API_CONFIG } = await import('../../utils/config');
      const txUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.TRANSACTIONS.SEARCH}?userId=${user_id}`);
      
      
      const response = await fetch(txUrl, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setTransactions(Array.isArray(data.data) ? data.data : [data.data]);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Refresh both bills and transactions
  const refreshAllData = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        refreshBills(),
        fetchTransactions()
      ]);
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle pull-to-refresh action
  const handlePullRefresh = async () => {
    try {
      setIsPullRefreshing(true);
      await refreshAllData();
    } catch (error) {
    } finally {
      setIsPullRefreshing(false);
    }
  };

  // Fetch transactions when screen loads
  useEffect(() => {
    fetchTransactions();
  }, []);

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
    try {
      const normalized = normalizeJSONBills(jsonData);
      
      // Refresh both bills and transactions from API to get the latest data
      await refreshAllData();
      
      setShowImportModal(false);
    } catch (error) {
      // Still close the modal even if refresh fails
      setShowImportModal(false);
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
        
        {(isLoading || isRefreshing || isLoadingTransactions) && !isPullRefreshing && (
          <View className="items-center p-5">
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText className="mt-2 text-sm" variant="secondary">
              {isRefreshing ? 'Actualizando datos...' : isLoadingTransactions ? 'Cargando transacciones...' : 'Cargando facturas...'}
              </ThemedText>
          </View>
        )}
        
          <ThemedScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ padding: 16, paddingBottom: 0, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isPullRefreshing}
                onRefresh={handlePullRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
                title="Actualizando datos..."
                titleColor={colors.textSecondary}
              />
            }
          >
          
          {/* Bills Summary Card */}
            <ThemedCard className="p-5 mb-5 items-center">
              <ThemedText className="text-lg font-bold mb-2">
              Total de Facturas
              </ThemedText>
              <ThemedText 
                className="text-3xl font-bold mb-1"
                style={{
                  color: bills.reduce((sum, bill) => sum + bill.amount, 0) >= 0 
                    ? colors.success 
                    : colors.error
                }}
              >
                {formatCurrency(bills.reduce((sum, bill) => sum + bill.amount, 0))}
              </ThemedText>
              <ThemedText className="text-sm" variant="tertiary">
              {bills.length} factura{bills.length !== 1 ? 's' : ''} en total
              </ThemedText>
            </ThemedCard>

          {/* Transactions Summary Card */}
          {transactions.length > 0 && (
            <ThemedCard className="p-5 mb-5 items-center">
              <ThemedText className="text-lg font-bold mb-2">
                Transacciones Recientes
              </ThemedText>
              <ThemedText 
                className="text-2xl font-bold mb-1"
                style={{
                  color: transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) >= 0 
                    ? colors.success 
                    : colors.error
                }}
              >
                {formatCurrency(transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0))}
              </ThemedText>
              <ThemedText className="text-sm" variant="tertiary">
                {transactions.length} transacción{transactions.length !== 1 ? 'es' : ''} encontrada{transactions.length !== 1 ? 's' : ''}
              </ThemedText>
            </ThemedCard>
          )}
          
          {/* Bills List */}
            <ThemedCard className="rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-4">
                <ThemedText className="text-xl font-bold">
                Facturas ({bills.length})
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
              <>
                {currentBills.map((bill) => (
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
                        {truncateBillName(bill.name)}
                        </ThemedText>
                        <ThemedText className="text-sm mt-0.5" variant="secondary">
                        {bill.category}
                        </ThemedText>
                        <ThemedText className="text-xs mt-0.5" variant="tertiary">
                        Vence: {formatDate(bill.dueDate)}
                        </ThemedText>
                    </View>
                    
                    <View className="items-end">
                        <ThemedText 
                          className="text-base font-bold"
                          style={{
                            color: bill.amount >= 0 ? colors.success : colors.error
                          }}
                        >
                          {formatCurrency(bill.amount)}
                        </ThemedText>
                    </View>
                  </View>
                ))}

                {/* Simple Pagination Controls */}
                {totalPages > 1 && (
                  <View className="mt-4 pt-4 border-t border-gray-200">
                    <View className="flex-row justify-between items-center">
                      {/* Previous Button - Only show if not on first page */}
                      {currentPage > 1 && (
                        <TouchableOpacity
                          onPress={goToPreviousPage}
                          className="p-2"
                          activeOpacity={1}
                        >
                          <Ionicons 
                            name="chevron-back" 
                            size={28} 
                            color={colors.primary}
                          />
                        </TouchableOpacity>
                      )}

                      {/* Spacer when only one arrow is visible */}
                      {currentPage === 1 && <View className="w-8" />}

                      {/* Next Button - Only show if not on last page */}
                      {currentPage < totalPages && (
                        <TouchableOpacity
                          onPress={goToNextPage}
                          className="p-2"
                          activeOpacity={1}
                        >
                          <Ionicons 
                            name="chevron-forward" 
                            size={28} 
                            color={colors.primary}
                          />
                        </TouchableOpacity>
                      )}

                      {/* Spacer when only one arrow is visible */}
                      {currentPage === totalPages && <View className="w-8" />}
                    </View>
                  </View>
                )}
              </>
            )}
            </ThemedCard>

          {/* Import Button */}
          <ThemedTouchableOpacity 
            className="flex-row items-center justify-center py-4 rounded-xl mt-4 shadow-md shadow-black/20"
            variant="primary"
            onPress={() => setShowImportModal(true)}
          >
            <Ionicons name="cloud-upload" size={24} color="#ffffff" />
            <ThemedText className="text-base font-bold ml-2" style={{ color: '#ffffff' }}>
            Importar Facturas
            </ThemedText>
          </ThemedTouchableOpacity>
          </ThemedScrollView>

        {/* CSV Import Modal */}
        <CSVImportModal
          visible={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportJSON}
          isLoading={isLoading || isRefreshing || isLoadingTransactions || isPullRefreshing}
        />
        </ThemedView>
    </SafeAreaView>
  );
};

export default BillsScreen;