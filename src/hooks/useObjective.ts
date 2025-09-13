import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBillsContext } from '../contexts/BillsContext';
import { useMonthsData } from './useMonthsData';
import { getCurrentMonthYear, isDateInCurrentMonth, formatCurrency } from '../utils/helpers';

const OBJECTIVE_STORAGE_KEY = 'objective_amount';

export const useObjective = () => {
  const [objectiveAmount, setObjectiveAmount] = useState<number>(0);
  const { totalBillsAmount, refreshBills } = useBillsContext();
  const { months } = useMonthsData();

  // Get last month's monthly expenses
  const getLastMonthExpenses = () => {
    if (months.length === 0) return 0;
    
    // Sort months by year and month to get the most recent
    const sortedMonths = [...months].sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return b.month - a.month; // Descending order to get most recent first
    });
    
    // Get the most recent month (last month)
    const lastMonth = sortedMonths[0];
    return lastMonth ? Math.abs(lastMonth.monthlyExpenses) : 0;
  };

  const lastMonthExpenses = getLastMonthExpenses();

  // Calculate total available (last month expenses - objective)
  const totalAvailable = lastMonthExpenses - objectiveAmount;

  // Load objective amount from storage
  const loadObjectiveFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(OBJECTIVE_STORAGE_KEY);
      if (stored) {
        const amount = parseFloat(stored);
        if (!isNaN(amount)) {
          setObjectiveAmount(amount);
        }
      }
    } catch (error) {
      console.error('Error loading objective from storage:', error);
    }
  };

  // Save objective amount to storage
  const saveObjectiveToStorage = async (amount: number) => {
    try {
      await AsyncStorage.setItem(OBJECTIVE_STORAGE_KEY, amount.toString());
    } catch (error) {
      console.error('Error saving objective to storage:', error);
    }
  };

  // Update objective amount
  const updateObjective = async (amount: number) => {
    setObjectiveAmount(amount);
    await saveObjectiveToStorage(amount);
  };

  // Refresh bills data
  const refreshBillsData = async () => {
    await refreshBills();
  };

  useEffect(() => {
    loadObjectiveFromStorage();
  }, []);

  return {
    objectiveAmount,
    totalBillsAmount,
    lastMonthExpenses,
    totalAvailable,
    updateObjective,
    refreshBillsData,
  };
}; 