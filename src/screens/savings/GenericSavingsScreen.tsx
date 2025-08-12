import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LinearChart from '../../components/LinearChart';
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedScrollView, ThemedCard } from '../../components/ThemeWrapper';
import { EnhancedInput } from '../../components/EnhancedInput';
import { useTheme } from '../../contexts/ThemeContext';

export interface GenericSavingsScreenProps {
  /* Icon shown in the coloured circle at the very top */
  headerIcon: string;
  /* Icon tint */
  iconColor: string;
  /* Background tint for the icon circle */
  iconBgColor: string;
  /* Screen title */
  title: string;
  /* Subtitle under the title */
  subtitle: string;
  /* Primary colour for chart/progress */
  primaryColor: string;
  /* Secondary/background colour for chart/progress */
  secondaryColor: string;
  /* Initial goal (EUR) */
  initialGoal: number;
  /* Initial current savings (EUR) */
  initialCurrent: number;
  /* Placeholder labels */
  goalPlaceholder: string;
  currentPlaceholder: string;
  /* Children can inject extra sections (members list, quick actions, etc.) */
  children?: React.ReactNode;
}

export interface SavingsContentProps {
  iconName: string;
  iconColor: string;
  title: string;
  subtitle: string;
  totalAmount: number;
  monthlyAmount: number;
  chartData: any[];
  primaryColor: string;
  onDataPointPress?: (dataPoint: any) => void;
}

export const renderSavingsContent = ({
  iconName,
  iconColor,
  title,
  subtitle,
  totalAmount,
  monthlyAmount,
  chartData,
  primaryColor,
  onDataPointPress,
}: SavingsContentProps) => {
  const formatEuros = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ThemedScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <ThemedCard className="p-6">
        <View 
          className="w-20 h-20 rounded-full items-center justify-center self-center mb-4 shadow-lg shadow-black/20"
          style={{ backgroundColor: iconColor }}
        >
          <Ionicons name={iconName as any} size={48} color="#ffffff" />
        </View>
        <ThemedText className="text-2xl font-bold text-center mb-1">{title}</ThemedText>
        <ThemedText className="text-base text-center mb-6" variant="secondary">{subtitle}</ThemedText>
        
        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <ThemedView className="flex-1 p-4 rounded-xl mx-1" variant="surface">
            <ThemedText className="text-xs font-medium mb-1" variant="secondary">Total Actual</ThemedText>
            <ThemedText className="text-lg font-bold mb-1">{formatEuros(totalAmount)}</ThemedText>
            <View className="flex-row items-center">
              <Ionicons name="trending-up" size={16} color={primaryColor} />
              <ThemedText className="text-xs font-semibold ml-1" style={{ color: primaryColor }}>+12.5%</ThemedText>
            </View>
          </ThemedView>
          
          <ThemedView className="flex-1 p-4 rounded-xl mx-1" variant="surface">
            <ThemedText className="text-xs font-medium mb-1" variant="secondary">Este Mes</ThemedText>
            <ThemedText className="text-lg font-bold mb-1">{formatEuros(monthlyAmount)}</ThemedText>
            <View className="flex-row items-center">
              <Ionicons name="trending-up" size={16} color={primaryColor} />
              <ThemedText className="text-xs font-semibold ml-1" style={{ color: primaryColor }}>+16.7%</ThemedText>
            </View>
          </ThemedView>
        </View>
        
        {/* Chart Section */}
        <LinearChart
          type="line"
          data={chartData}
          primaryColor={primaryColor}
          height={240}
          title="Evolución de Ahorros"
          subtitle="6 meses"
          onDataPointPress={onDataPointPress}
        />
      </ThemedCard>
    </ThemedScrollView>
  );
};

const GenericSavingsScreen: React.FC<GenericSavingsScreenProps> = ({
  headerIcon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  primaryColor,
  secondaryColor,
  initialGoal,
  initialCurrent,
  goalPlaceholder,
  currentPlaceholder,
  children,
}) => {
  const [goalInput, setGoalInput] = useState<string>('');
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const { colors } = useTheme();

  const goal = initialGoal;
  const current = initialCurrent;

  const handleUpdateGoal = () => {
    const newGoal = parseFloat(goalInput);
    const newCurrent = parseFloat(currentInput);

    if (isNaN(newGoal) || newGoal < 0) {
      Alert.alert('Error', 'Por favor ingresa un objetivo válido');
      return;
    }
    if (isNaN(newCurrent) || newCurrent < 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    setIsUpdatingGoal(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdatingGoal(false);
      Alert.alert('Éxito', 'Objetivo actualizado');
      // In a real implementation you would update remote state here
    }, 1000);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <ThemedView className="flex-1 pt-12">      
      <ThemedScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="p-5">
          {/* Header */}
          <View className="items-center mb-8">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: iconBgColor }}
            >
              <Ionicons name={headerIcon as any} size={40} color={iconColor} />
            </View>
            <ThemedText className="text-2xl font-bold text-center">{title}</ThemedText>
            <ThemedText className="text-base text-center mt-2" variant="secondary">{subtitle}</ThemedText>
          </View>

          {/* Savings Overview */}
          <View
            className="rounded-2xl mb-6 shadow-lg shadow-black/10 p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <LinearChart
              type="progress"
              currentValue={current}
              targetValue={goal}
              primaryColor={colors.primary}
              secondaryColor={colors.textSecondary}
              title="Resumen de Ahorros"
            />
          </View>

          {/* Update Goal Section */}
          <ThemedCard className="p-6 mb-6">
            <ThemedText className="text-lg font-bold mb-4 text-center">Actualizar Objetivo</ThemedText>
            {/* Goal */}
            <View className="mb-4">
              <EnhancedInput
                className="w-full text-lg"
                value={goalInput}
                onChangeText={setGoalInput}
                placeholder={goalPlaceholder}
                label={goalPlaceholder}
                keyboardType="numeric"
              />
            </View>
            {/* Current */}
            <View className="mb-4">
              <EnhancedInput
                className="w-full text-lg"
                value={currentInput}
                onChangeText={setCurrentInput}
                placeholder={currentPlaceholder}
                label={currentPlaceholder}
                keyboardType="numeric"
              />
            </View>
            {/* Button */}
            <ThemedTouchableOpacity
              className={`w-full py-4 rounded-xl shadow-md shadow-black/20 ${isUpdatingGoal ? 'opacity-70' : ''}`}
              variant="primary"
              onPress={handleUpdateGoal}
              disabled={isUpdatingGoal}
            >
              <ThemedText className="text-center text-lg font-bold" style={{ color: '#ffffff' }}>
                {isUpdatingGoal ? 'Actualizando...' : 'Actualizar Objetivo'}
              </ThemedText>
            </ThemedTouchableOpacity>
          </ThemedCard>

          {/* Extra content provided by wrapper screens */}
          {children}
        </View>
      </ThemedScrollView>
    </ThemedView>
  );
};

export default GenericSavingsScreen; 