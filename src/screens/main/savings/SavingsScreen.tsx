import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearChart, { ChartDataPoint } from '../../../components/LinearChart';
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedCard } from '../../../components/ThemeWrapper';
import { useTheme } from '../../../contexts/ThemeContext';
import { useMonthsData } from '../../../hooks/useMonthsData';
import { useObjective } from '../../../hooks/useObjective';
import { useBillsContext } from '../../../contexts/BillsContext';
import SavingsContent from './SavingsContent';

// Types -----------------------------------------------------------------------

type TabKey = 'solo' | 'familia';

// Constants -------------------------------------------------------------------

const PRIMARY_COLOR_LIGHT = '#0ea5e9';
const SECONDARY_COLOR_LIGHT = '#3b82f6';
const PRIMARY_COLOR_DARK = '#38bdf8';
const SECONDARY_COLOR_DARK = '#60a5fa';

// Mock data for family savings (since we only have individual data for now)
const familiaSavingsData: ChartDataPoint[] = [
  { label: 'Ene', value: 2500 },
  { label: 'Feb', value: 3200 },
  { label: 'Mar', value: 3800 },
  { label: 'Abr', value: 4500 },
  { label: 'May', value: 5200 },
  { label: 'Jun', value: 6000 },
];

// Component -------------------------------------------------------------------

const SavingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('solo');
  const { theme, colors } = useTheme();
  const { 
    chartData: soloChartData,
    months,
    totalExpenses, 
    totalIncome, 
    currentMonthExpenses, 
    currentMonthIncome, 
    currentMonthSavings,
    monthlySavingsPercentage,
    isLoading, 
    error,
    refetch: refetchMonthsData
  } = useMonthsData();
  const { objectiveAmount } = useObjective();
  const { totalBillsAmount, refreshId } = useBillsContext();
  const lastRefreshIdRef = useRef<string>('');

  // Theme-aware colors
  const primaryColor = theme === 'light' ? PRIMARY_COLOR_LIGHT : PRIMARY_COLOR_DARK;
  const secondaryColor = theme === 'light' ? SECONDARY_COLOR_LIGHT : SECONDARY_COLOR_DARK;

  // Calculate savings - use totalBillsAmount as the total actual value
  const totalSavings = totalBillsAmount;
  
  // Use the last data point from chart data for "Este Mes" calculation
  const lastMonthDataPoint = soloChartData.length > 0 ? soloChartData[soloChartData.length - 1] : null;
  const displayCurrentMonthSavings = lastMonthDataPoint ? lastMonthDataPoint.value : (currentMonthIncome - currentMonthExpenses);
  
  // Calculate percentage change between last and penultimate month
  let displayMonthlySavingsPercentage = 0;
  let hasValidPercentage = false;
  
  if (soloChartData.length >= 2) {
    const lastMonth = soloChartData[soloChartData.length - 1];
    const penultimateMonth = soloChartData[soloChartData.length - 2];
    
    if (penultimateMonth.value !== 0) {
      displayMonthlySavingsPercentage = ((lastMonth.value - penultimateMonth.value) / Math.abs(penultimateMonth.value)) * 100;
      hasValidPercentage = Number.isFinite(displayMonthlySavingsPercentage);
    }
  }

  
  // Calculate sum of last 6 chart data points for trend display
  const last6MonthsSum = soloChartData.reduce((sum, dataPoint) => sum + dataPoint.value, 0);

  // Calculate accumulated savings data for solo mode
  const calculateAccumulatedSavings = (): ChartDataPoint[] => {
    if (months.length === 0) return [];
    
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    // Get the last 6 months (same as chartData)
    const last6Months = months.slice(-6);
    let accumulated = 0;
    
    return last6Months.map((month) => {
      // Simply accumulate the monthlyExpenses field
      accumulated += month.monthlyExpenses;
      
      return {
        label: monthNames[month.month - 1],
        value: accumulated
      };
    });
  };

  // Calculate accumulated savings data - this will automatically refresh when months data changes
  const accumulatedSavingsData = calculateAccumulatedSavings();

  // Listen for bills refresh events and trigger months data refresh
  useEffect(() => {
    if (refreshId && refreshId !== lastRefreshIdRef.current) {
      // Bills data was refreshed, so refresh months data too
      lastRefreshIdRef.current = refreshId;
      refetchMonthsData();
    }
  }, [refreshId, refetchMonthsData]);

  const handleDataPointPress = (dataPoint: ChartDataPoint) => {
    // Handle data point press if needed
  };

  const formatEuros = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        {/* Tab Header --------------------------------------------------------- */}
          <ThemedView style={styles.tabHeader} variant="card">
            <ThemedTouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'solo' && { backgroundColor: primaryColor }
              ]}
              activeOpacity={1}
              onPress={() => setActiveTab('solo')}
          >
            <Ionicons
              name="person"
              size={20}
                color={activeTab === 'solo' ? '#ffffff' : primaryColor}
            />
              <ThemedText
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'solo' ? '#ffffff' : primaryColor,
                    fontWeight: activeTab === 'solo' ? 'bold' : '600',
                  }
                ]}
            >
              Solo
              </ThemedText>
            </ThemedTouchableOpacity>

            <ThemedTouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'familia' && { backgroundColor: secondaryColor }
              ]}
              activeOpacity={1}
              onPress={() => setActiveTab('familia')}
          >
            <Ionicons
              name="people"
              size={20}
                color={activeTab === 'familia' ? '#ffffff' : secondaryColor}
            />
              <ThemedText
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'familia' ? '#ffffff' : secondaryColor,
                    fontWeight: activeTab === 'familia' ? 'bold' : '600',
                  }
                ]}
            >
              Familia
              </ThemedText>
            </ThemedTouchableOpacity>
          </ThemedView>

        {/* Tab Content -------------------------------------------------------- */}
        <SavingsContent
          isLoading={isLoading}
          error={error}
          chartData={activeTab === 'solo' ? soloChartData : familiaSavingsData}
          totalSavings={totalSavings}
          displayCurrentMonthSavings={displayCurrentMonthSavings}
          displayMonthlySavingsPercentage={displayMonthlySavingsPercentage}
          hasValidPercentage={hasValidPercentage}
          last6MonthsSum={last6MonthsSum}
          objectiveAmount={objectiveAmount}
          primaryColor={activeTab === 'solo' ? primaryColor : secondaryColor}
          onDataPointPress={handleDataPointPress}
          mode={activeTab}
          familiaData={activeTab === 'familia' ? {
            totalSavings: 6000,
            currentMonthSavings: 800,
            monthlyPercentage: 20.0
          } : undefined}
          accumulatedSavingsData={activeTab === 'solo' ? accumulatedSavingsData : undefined}
        />
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 96,
    justifyContent: 'center',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default SavingsScreen; 