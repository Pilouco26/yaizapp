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
  currentMonthSavings: number;
  previousMonthSavings: number;
  monthlySavingsPercentage: number;
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
    if (!isAuthenticated || !user) {
      setError('Usuario no autenticado');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use the hardcoded user_id from constants for now
      // In a real app, you'd use the authenticated user's ID
      const monthsData = await MonthsService.getMonthsByUserId(user_id, 'mock-token');
      
      // Sort months by year and month
      const sortedMonths = monthsData.sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        return a.month - b.month;
      });

      setMonths(sortedMonths);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthsData();
  }, [isAuthenticated, user]);

  // Calculate totals from monthlyExpenses and transactions
  const totalExpenses = months.reduce((sum, month) => sum + Math.abs(month.monthlyExpenses), 0);
  
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

  // Calculate current month savings
  const currentMonthSavings = currentMonthIncome - currentMonthExpenses;

  // Get previous month data for percentage calculation
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  const previousMonthData = months.find(
    month => month.year === previousYear && month.month === previousMonth
  );
  
  const previousMonthExpenses = previousMonthData ? Math.abs(previousMonthData.monthlyExpenses) : 0;
  const previousMonthIncome = previousMonthData && previousMonthData.transactions 
    ? previousMonthData.transactions
        .filter(tx => tx.type === 'INCOME')
        .reduce((sum, tx) => sum + tx.amount, 0)
    : 0;
  
  const previousMonthSavings = previousMonthIncome - previousMonthExpenses;

  // Calculate percentage as ratio of last month to current month
  let monthlySavingsPercentage = 0;
  if (Number.isFinite(currentMonthSavings) && currentMonthSavings !== 0) {
    monthlySavingsPercentage = (previousMonthSavings / currentMonthSavings) * 100;
  } else {
    monthlySavingsPercentage = 0;
  }

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
    currentMonthSavings,
    previousMonthSavings,
    monthlySavingsPercentage,
    isLoading,
    error,
    refetch: fetchMonthsData,
  };
};
