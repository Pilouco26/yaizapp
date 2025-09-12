import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBillsContext } from '../contexts/BillsContext';
import { getCurrentMonthYear, isDateInCurrentMonth, formatCurrency } from '../utils/helpers';

const OBJECTIVE_STORAGE_KEY = 'objective_amount';

export const useObjective = () => {
  const [objectiveAmount, setObjectiveAmount] = useState<number>(0);
  const { totalBillsAmount, refreshBills } = useBillsContext();

  // Calculate total available (total bills - objective)
  const totalAvailable = totalBillsAmount - objectiveAmount;

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
    totalAvailable,
    updateObjective,
    refreshBillsData,
  };
}; 