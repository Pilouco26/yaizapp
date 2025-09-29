import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Bill } from '../utils/types';
import { TransactionsService } from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../utils/config';

interface BillsContextType {
  totalBillsAmount: number;
  bills: Bill[];
  isLoading: boolean;
  error: string | null;
  refreshBills: () => Promise<void>;
  lastRefreshTime: number;
  refreshId: string;
}

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export const useBillsContext = () => {
  const context = useContext(BillsContext);
  if (!context) {
    throw new Error('useBillsContext must be used within a BillsProvider');
  }
  return context;
};

interface BillsProviderProps {
  children: ReactNode;
}

export const BillsProvider: React.FC<BillsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [refreshId, setRefreshId] = useState<string>('');
  const isRefreshingRef = useRef(false);

  // Calculate total bills amount
  const totalBillsAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);

  // Fetch bills from API
  const fetchBills = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Backend transactions for the current user (mapped to Bill shape)
      let backendBills: Bill[] = [];
      const resolveAuthenticatedUserId = async (): Promise<number> => {
        try {
          const raw = await AsyncStorage.getItem('api_user');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.id) return Number(parsed.id);
          }
        } catch {}
        if (user?.id) return Number(user.id as any);
        throw new Error('No se pudo determinar el usuario autenticado');
      };
      try {
        const resolvedUserId = await resolveAuthenticatedUserId();
        const txUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.TRANSACTIONS.SEARCH}?userId=${resolvedUserId}`);
        const txResponse = await fetch(txUrl, { method: 'GET', headers: getDefaultHeaders() });
        if (txResponse.ok) {
          const txJson = await txResponse.json();
          const txList = Array.isArray(txJson?.data) ? txJson.data : txJson.data ? [txJson.data] : [];
          backendBills = txList.map((tx: any) => ({
            id: tx.id ?? `tx-${Date.now()}`,
            name: tx.description ?? 'Transacción',
            amount: tx.amount ?? 0,
            dueDate: tx.date ?? new Date().toISOString(),
            category: tx.category ?? tx.type ?? 'Otros',
            currency: 'EUR',
          }));
        } else {
          console.warn('⚠️ [BillsContext] Failed to fetch transactions, status:', txResponse.status);
        }
      } catch (err) {
        console.warn('⚠️ [BillsContext] Error fetching transactions:', err);
      }

      setBills(backendBills);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las facturas';
      setError(errorMessage);
      console.error('Error fetching bills:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh bills
  const refreshBills = async () => {
    if (isRefreshingRef.current) {
      return; // Prevent multiple simultaneous refreshes
    }
    
    isRefreshingRef.current = true;
    try {
      await fetchBills();
      const now = Date.now();
      setLastRefreshTime(now);
      setRefreshId(`refresh-${now}-${Math.random()}`);
    } finally {
      isRefreshingRef.current = false;
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const value: BillsContextType = {
    totalBillsAmount,
    bills,
    isLoading,
    error,
    refreshBills,
    lastRefreshTime,
    refreshId,
  };

  return (
    <BillsContext.Provider value={value}>
      {children}
    </BillsContext.Provider>
  );
}; 