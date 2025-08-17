import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearChart, { ChartDataPoint } from '../../components/LinearChart';
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedCard } from '../../components/ThemeWrapper';
import { useTheme } from '../../contexts/ThemeContext';

// Types -----------------------------------------------------------------------

type TabKey = 'solo' | 'familia';

// Constants -------------------------------------------------------------------

const PRIMARY_COLOR_LIGHT = '#0ea5e9';
const SECONDARY_COLOR_LIGHT = '#3b82f6';
const PRIMARY_COLOR_DARK = '#38bdf8';
const SECONDARY_COLOR_DARK = '#60a5fa';

// Mock data for charts
const soloSavingsData: ChartDataPoint[] = [
  { label: 'Ene', value: 1200 },
  { label: 'Feb', value: 1500 },
  { label: 'Mar', value: 1800 },
  { label: 'Abr', value: 2100 },
  { label: 'May', value: 2400 },
  { label: 'Jun', value: 2800 },
];

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
  const [activeTab, setActiveTab] = useState<TabKey>('familia');
  const { theme } = useTheme();

  // Theme-aware colors
  const primaryColor = theme === 'light' ? PRIMARY_COLOR_LIGHT : PRIMARY_COLOR_DARK;
  const secondaryColor = theme === 'light' ? SECONDARY_COLOR_LIGHT : SECONDARY_COLOR_DARK;

  const handleDataPointPress = (dataPoint: ChartDataPoint) => {
    console.log('Data point pressed:', dataPoint);
  };

  const formatEuros = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderSoloContent = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedCard style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
          <Ionicons name="person" size={48} color="#ffffff" />
        </View>
        <ThemedText style={styles.title}>Ahorros Personales</ThemedText>
        <ThemedText style={styles.subtitle} variant="secondary">Gestiona tus ahorros individuales</ThemedText>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <ThemedView style={styles.statCard} variant="surface">
            <ThemedText style={styles.statLabel} variant="secondary">Total Actual</ThemedText>
            <ThemedText style={styles.statValue}>{formatEuros(2800)}</ThemedText>
            <View style={styles.trendContainer}>
              <Ionicons name="trending-up" size={16} color={primaryColor} />
              <ThemedText style={[styles.trendText, { color: primaryColor }]}>+12.5%</ThemedText>
            </View>
          </ThemedView>
          
          <ThemedView style={styles.statCard} variant="surface">
            <ThemedText style={styles.statLabel} variant="secondary">Este Mes</ThemedText>
            <ThemedText style={styles.statValue}>{formatEuros(400)}</ThemedText>
            <View style={styles.trendContainer}>
              <Ionicons name="trending-up" size={16} color={primaryColor} />
              <ThemedText style={[styles.trendText, { color: primaryColor }]}>+16.7%</ThemedText>
            </View>
          </ThemedView>
        </View>
        
        {/* Chart Section */}
        <LinearChart
          type="line"
          data={soloSavingsData}
          primaryColor={primaryColor}
          height={240}
          title="Evolución de Ahorros"
          subtitle="6 meses"
          onDataPointPress={handleDataPointPress}
        />
      </ThemedCard>
    </ScrollView>
  );

  const renderFamiliaContent = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedCard style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: secondaryColor }]}>
          <Ionicons name="people" size={48} color="#ffffff" />
        </View>
        <ThemedText style={styles.title}>Ahorros Familiares</ThemedText>
        <ThemedText style={styles.subtitle} variant="secondary">Gestiona los ahorros de la familia</ThemedText>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <ThemedView style={styles.statCard} variant="surface">
            <ThemedText style={styles.statLabel} variant="secondary">Total Actual</ThemedText>
            <ThemedText style={styles.statValue}>{formatEuros(6000)}</ThemedText>
            <View style={styles.trendContainer}>
              <Ionicons name="trending-up" size={16} color={secondaryColor} />
              <ThemedText style={[styles.trendText, { color: secondaryColor }]}>+18.2%</ThemedText>
            </View>
          </ThemedView>
          
          <ThemedView style={styles.statCard} variant="surface">
            <ThemedText style={styles.statLabel} variant="secondary">Este Mes</ThemedText>
            <ThemedText style={styles.statValue}>{formatEuros(800)}</ThemedText>
            <View style={styles.trendContainer}>
              <Ionicons name="trending-up" size={16} color={secondaryColor} />
              <ThemedText style={[styles.trendText, { color: secondaryColor }]}>+20.0%</ThemedText>
            </View>
          </ThemedView>
        </View>
        
        {/* Chart Section */}
        <LinearChart
          type="line"
          data={familiaSavingsData}
          primaryColor={secondaryColor}
          height={240}
          title="Evolución de Ahorros"
          subtitle="6 meses"
          onDataPointPress={handleDataPointPress}
        />
      </ThemedCard>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
      {/* Tab Header --------------------------------------------------------- */}
        <ThemedView style={styles.tabHeader} variant="card">
          <ThemedTouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'solo' && { backgroundColor: primaryColor }
            ]}
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
      {activeTab === 'solo' ? renderSoloContent() : renderFamiliaContent()}
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