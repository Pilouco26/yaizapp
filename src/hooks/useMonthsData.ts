import { useState, useEffect } from 'react';
import { Month } from '../services/types';
import { MonthsService } from '../services/apiservices/MonthsService';
import { useAuth } from '../contexts/AuthContext';
import { user_id } from '../config/constants';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface MonthsData {
  months: Month[];
  chartData: ChartDataPoint[];
  totalExpenses: number;
  totalIncome: number;
  currentMonthExpenses: number;
  currentMonthIncome: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const monthNames = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const useMonthsData = (): MonthsData => {
  const [months, setMonths] = useState<Month[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchMonthsData = async () => {
    console.log('🔄 [useMonthsData] Starting fetchMonthsData');
    console.log('🔐 [useMonthsData] isAuthenticated:', isAuthenticated);
    console.log('👤 [useMonthsData] user:', user);
    console.log('🆔 [useMonthsData] user_id from constants:', user_id);
    
    if (!isAuthenticated || !user) {
      console.log('❌ [useMonthsData] User not authenticated, setting error');
      setError('Usuario no autenticado');
      setIsLoading(false);
      return;
    }

    try {
      console.log('⏳ [useMonthsData] Setting loading state and clearing error');
      setIsLoading(true);
      setError(null);

      // Use the hardcoded user_id from constants for now
      // In a real app, you'd use the authenticated user's ID
      console.log('🚀 [useMonthsData] Calling MonthsService.getMonthsByUserId with userId:', user_id);
      const monthsData = await MonthsService.getMonthsByUserId(user_id, 'mock-token');
      console.log('✅ [useMonthsData] Received months data:', monthsData);
      console.log('📊 [useMonthsData] First month sample:', monthsData[0]);
      
      // Sort months by year and month
      const sortedMonths = monthsData.sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        return a.month - b.month;
      });
      console.log('📊 [useMonthsData] Sorted months:', sortedMonths);
      console.log('📊 [useMonthsData] Monthly expenses from first month:', sortedMonths[0]?.monthlyExpenses);

      setMonths(sortedMonths);
      console.log('🎉 [useMonthsData] Successfully set months data');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
      console.error('❌ [useMonthsData] Error fetching months data:', err);
      setError(errorMessage);
    } finally {
      console.log('🏁 [useMonthsData] Setting loading to false');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthsData();
  }, [isAuthenticated, user]);

  // Calculate totals from monthlyExpenses and transactions
  const totalExpenses = months.reduce((sum, month) => sum + Math.abs(month.monthlyExpenses), 0);
  console.log('💰 [useMonthsData] Total expenses calculated:', totalExpenses);
  
  // Calculate total income from transactions
  const totalIncome = months.reduce((sum, month) => {
    if (month.transactions) {
      const monthIncome = month.transactions
        .filter(tx => tx.type === 'INCOME')
        .reduce((incomeSum, tx) => incomeSum + tx.amount, 0);
      return sum + monthIncome;
    }
    return sum;
  }, 0);
  console.log('💰 [useMonthsData] Total income calculated:', totalIncome);

  // Get current month data
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const currentMonthData = months.find(
    month => month.year === currentYear && month.month === currentMonth
  );
  
  const currentMonthExpenses = currentMonthData ? Math.abs(currentMonthData.monthlyExpenses) : 0;
  
  // Calculate current month income from transactions
  const currentMonthIncome = currentMonthData && currentMonthData.transactions 
    ? currentMonthData.transactions
        .filter(tx => tx.type === 'INCOME')
        .reduce((sum, tx) => sum + tx.amount, 0)
    : 0;

  // Prepare chart data (last 6 months)
  const chartData: ChartDataPoint[] = months
    .slice(-6) // Get last 6 months
    .map(month => ({
      label: monthNames[month.month - 1],
      value: month.monthlyExpenses // Preserve negative values for expenses
    }));

  return {
    months,
    chartData,
    totalExpenses,
    totalIncome,
    currentMonthExpenses,
    currentMonthIncome,
    isLoading,
    error,
    refetch: fetchMonthsData,
  };
};
