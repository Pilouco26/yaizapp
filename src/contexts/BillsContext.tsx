import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bill } from '../utils/types';
import { getBills } from '../services/BillsService';

interface BillsContextType {
  totalBillsAmount: number;
  bills: Bill[];
  isLoading: boolean;
  error: string | null;
  refreshBills: () => Promise<void>;
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
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total bills amount
  const totalBillsAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);

  // Fetch bills from API
  const fetchBills = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiBills = await getBills();
      
      // Transform API bills to Bill type
      const transformed = apiBills.map((item: any, idx: number) => ({
        id: `api-${idx}`,
        name: item.description || item['Descripció'] || 'Sin descripción',
        amount: Number(item.value || item.Import || 0),
        dueDate: item.date || item.Data || new Date().toISOString(),
        category: 'Otros',
        currency: item.currency || item.Moneda || 'EUR',
      }));

      setBills(transformed);
      
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
    await fetchBills();
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
  };

  return (
    <BillsContext.Provider value={value}>
      {children}
    </BillsContext.Provider>
  );
}; 