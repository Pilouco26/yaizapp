import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBillsContext } from '../contexts/BillsContext';
import { useMonthsData } from './useMonthsData';
import { getCurrentMonthYear, isDateInCurrentMonth, formatCurrency } from '../utils/helpers';

const OBJECTIVE_STORAGE_KEY = 'objective_amount';

export const useObjective = () => {
  const [objectiveAmount, setObjectiveAmount] = useState<number>(0);
  const { totalBillsAmount, refreshBills } = useBillsContext();
  const { chartData } = useMonthsData();

  // Get last month's monthly expenses from chart data (last data point)
  const getLastMonthExpenses = () => {
    if (chartData.length === 0) return 0;
    
    // Get the last data point from chart data (most recent month)
    const lastDataPoint = chartData[chartData.length - 1];
    return lastDataPoint ? lastDataPoint.value : 0;
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