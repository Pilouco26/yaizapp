import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LinearChart, { ChartDataPoint } from '../../../components/LinearChart';
import { ThemedView, ThemedText, ThemedCard } from '../../../components/ThemeWrapper';
import { useTheme } from '../../../contexts/ThemeContext';

// Types -----------------------------------------------------------------------

interface SavingsContentProps {
  isLoading: boolean;
  error: string | null;
  chartData: ChartDataPoint[];
  totalSavings: number;
  displayCurrentMonthSavings: number;
  displayMonthlySavingsPercentage: number;
  hasValidPercentage: boolean;
  last6MonthsSum: number;
  objectiveAmount: number;
  primaryColor: string;
  onDataPointPress: (dataPoint: ChartDataPoint) => void;
  mode: 'solo' | 'familia';
  familiaData?: {
    totalSavings: number;
    currentMonthSavings: number;
    monthlyPercentage: number;
  };
  accumulatedSavingsData?: ChartDataPoint[];
}

// Component -------------------------------------------------------------------

const SavingsContent: React.FC<SavingsContentProps> = ({
  isLoading,
  error,
  chartData,
  totalSavings,
  displayCurrentMonthSavings,
  displayMonthlySavingsPercentage,
  hasValidPercentage,
  last6MonthsSum,
  objectiveAmount,
  primaryColor,
  onDataPointPress,
  mode,
  familiaData,
  accumulatedSavingsData,
}) => {
  const { colors } = useTheme();

  const formatEuros = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine content based on mode
  const isFamilia = mode === 'familia';
  const iconName = isFamilia ? 'people' : 'person';
  const title = isFamilia ? 'Ahorros Familiares' : 'Ahorros Personales';
  const subtitle = isFamilia ? 'Gestiona los ahorros de la familia' : 'Gestiona tus ahorros individuales';
  
  // Use familia data if available and in familia mode
  const displayTotalSavings = isFamilia && familiaData ? familiaData.totalSavings : totalSavings;
  const displayCurrentMonth = isFamilia && familiaData ? familiaData.currentMonthSavings : displayCurrentMonthSavings;
  const displayPercentage = isFamilia && familiaData ? familiaData.monthlyPercentage : displayMonthlySavingsPercentage;
  const hasValidPercentageValue = isFamilia && familiaData ? true : hasValidPercentage;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>Cargando datos...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <ThemedText style={styles.errorTitle}>Error al cargar los datos</ThemedText>
        <ThemedText style={styles.errorMessage}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedCard style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
          <Ionicons name={iconName} size={48} color="#ffffff" />
        </View>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.subtitle} variant="secondary">{subtitle}</ThemedText>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <ThemedView style={styles.statCard} variant="surface">
            <ThemedText style={styles.statLabel} variant="secondary">Total Actual</ThemedText>
            <ThemedText style={[styles.statValue, { color: colors.textPrimary }]}>{formatEuros(displayTotalSavings)}</ThemedText>
            <View style={styles.trendContainer}>
              <Ionicons 
                name={isFamilia ? "trending-up" : (last6MonthsSum >= 0 ? "trending-up" : "trending-down")} 
                size={16} 
                color={primaryColor} 
              />
              <ThemedText style={[
                styles.trendText, 
                { color: primaryColor }
              ]}>
                {(last6MonthsSum >= 0 ? '+' : '') + formatEuros(last6MonthsSum)}
              </ThemedText>
            </View>
          </ThemedView>
          
          <ThemedView style={styles.statCard} variant="surface">
            <ThemedText style={styles.statLabel} variant="secondary">Este Mes</ThemedText>
            <ThemedText style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatEuros(displayCurrentMonth)}
            </ThemedText>
            <View style={styles.trendContainer}>
              <Ionicons 
                name={hasValidPercentageValue && displayPercentage >= 0 ? "trending-up" : hasValidPercentageValue ? "trending-down" : "remove"} 
                size={16} 
                color={hasValidPercentageValue ? primaryColor : colors.textSecondary} 
              />
              <ThemedText style={[
                styles.trendText, 
                { color: hasValidPercentageValue ? primaryColor : colors.textSecondary }
              ]}>
                {hasValidPercentageValue ? `${displayPercentage >= 0 ? '+' : ''}${displayPercentage.toFixed(1)}%` : '--'}
              </ThemedText>
            </View>
          </ThemedView>
        </View>
        
        {/* Accumulated Savings Chart - Only for Solo mode */}
        {!isFamilia && !isLoading && !error && accumulatedSavingsData && accumulatedSavingsData.length > 0 && (
          <LinearChart
            type="line"
            data={accumulatedSavingsData}
            primaryColor={primaryColor}
            targetValue={undefined}
            height={240}
            title="Ahorros Acumulados"
            subtitle="Evolución total"
            showZeroLine={false}
            showGrid={false}
            fitDataRange={true}
            segmentColors={{
              aboveGoal: primaryColor,
              betweenGoalAndZero: primaryColor,
              belowZero: primaryColor
            }}
            onDataPointPress={onDataPointPress}
          />
        )}
        
        {/* Chart Section */}
        <LinearChart
          type="line"
          data={chartData}
          primaryColor={primaryColor}
          targetValue={objectiveAmount}
          height={240}
          title="Evolución de ahorros"
          subtitle="6 meses"
          showZeroLine={!isFamilia}
          onDataPointPress={onDataPointPress}
        />
      </ThemedCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default SavingsContent;
