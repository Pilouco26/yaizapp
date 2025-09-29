import { useState, useEffect } from 'react';
import { Month, Family } from '../services/types';
import { FamiliesService } from '../services/apiservices/FamiliesService';
import { MonthsService } from '../services/apiservices/MonthsService';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface FamilyData {
  family: Family | null;
  chartData: ChartDataPoint[];
  totalSavings: number;
  currentMonthSavings: number;
  monthlyPercentage: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const monthNames = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const useFamilyData = (): FamilyData => {
  const [family, setFamily] = useState<Family | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [currentMonthSavings, setCurrentMonthSavings] = useState(0);
  const [monthlyPercentage, setMonthlyPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchFamilyData = async () => {
    if (!isAuthenticated || !user) {
      setError('Usuario no autenticado');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get the current user's family ID from stored API user data
      let familyId: string | null = null;
      try {
        const raw = await AsyncStorage.getItem('api_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.familyId) {
            familyId = String(parsed.familyId);
          }
        }
      } catch (err) {
        console.warn('Could not parse stored user data:', err);
      }

      if (!familyId) {
        throw new Error('Usuario no pertenece a ninguna familia');
      }

      // Fetch family data
      const familyData = await FamiliesService.getFamilyById(familyId, 'mock-token');
      if (!familyData) {
        throw new Error('No se encontró la familia');
      }

      setFamily(familyData);

      // Get all family members' months data
      const allFamilyMonths: Month[] = [];
      
      // Use users array if available, otherwise use members array
      const memberIds = familyData.users 
        ? familyData.users.map(user => String(user.id))
        : familyData.members;
      
      for (const memberId of memberIds) {
        try {
          const memberMonths = await MonthsService.getMonthsByUserId(memberId, 'mock-token');
          allFamilyMonths.push(...memberMonths);
        } catch (memberError) {
          console.warn(`Could not fetch months for member ${memberId}:`, memberError);
          // Continue with other members even if one fails
        }
      }

      // Group months by year and month, then aggregate expenses
      const monthMap = new Map<string, number>();
      
      allFamilyMonths.forEach(month => {
        const key = `${month.year}-${month.month}`;
        const currentExpenses = monthMap.get(key) || 0;
        monthMap.set(key, currentExpenses + month.monthlyExpenses);
      });

      // Convert to array and sort by year and month
      const aggregatedMonths = Array.from(monthMap.entries())
        .map(([key, expenses]) => {
          const [year, month] = key.split('-').map(Number);
          return { year, month, expenses };
        })
        .sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year;
          }
          return a.month - b.month;
        });

      // Calculate total savings (sum of all expenses)
      const total = aggregatedMonths.reduce((sum, month) => sum + month.expenses, 0);
      setTotalSavings(total);

      // Get current month data
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      const currentMonthData = aggregatedMonths.find(
        month => month.year === currentYear && month.month === currentMonth
      );
      
      const currentMonthValue = currentMonthData ? currentMonthData.expenses : 0;
      setCurrentMonthSavings(currentMonthValue);

      // Calculate percentage change between current and previous month
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      
      const previousMonthData = aggregatedMonths.find(
        month => month.year === previousYear && month.month === previousMonth
      );
      
      const previousMonthValue = previousMonthData ? previousMonthData.expenses : 0;
      
      let percentage = 0;
      if (previousMonthValue > 0) {
        percentage = ((currentMonthValue - previousMonthValue) / previousMonthValue) * 100;
      }
      setMonthlyPercentage(percentage);

      // Prepare chart data (last 6 months)
      const last6Months = aggregatedMonths.slice(-6);
      const chartDataPoints: ChartDataPoint[] = last6Months.map(month => ({
        label: monthNames[month.month - 1],
        value: month.expenses
      }));

      setChartData(chartDataPoints);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos de la familia';
      setError(errorMessage);
      console.error('Family data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, [isAuthenticated, user]);

  return {
    family,
    chartData,
    totalSavings,
    currentMonthSavings,
    monthlyPercentage,
    isLoading,
    error,
    refetch: fetchFamilyData,
  };
};
