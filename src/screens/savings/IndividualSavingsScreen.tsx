import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import GenericSavingsScreen from './GenericSavingsScreen';
import { useMonthsData } from '../../hooks/useMonthsData';
import { useTheme } from '../../contexts/ThemeContext';

const IndividualSavingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { 
    totalExpenses, 
    totalIncome, 
    currentMonthExpenses, 
    currentMonthIncome, 
    chartData,
    isLoading, 
    error 
  } = useMonthsData();
  
  // Calculate savings (income - expenses)
  const totalSavings = totalIncome - totalExpenses;
  const currentMonthSavings = currentMonthIncome - currentMonthExpenses;
  
  // Mock goal for now - in a real app this would come from GoalsService
  const mockGoal = 5000;
  const currentSavings = Math.max(0, totalSavings); // Ensure non-negative

  const formatEuros = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textPrimary, marginTop: 16 }}>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 }}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={{ color: colors.error, fontSize: 16, textAlign: 'center', marginTop: 16 }}>
          Error al cargar los datos
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <GenericSavingsScreen
      headerIcon="person"
      iconColor="#0ea5e9"
      iconBgColor="#e0f2fe"
      title="Ahorros Personales"
      subtitle="Gestiona tus ahorros individuales"
      primaryColor="#0ea5e9"
      secondaryColor="#bae6fd"
      initialGoal={mockGoal}
      initialCurrent={currentSavings}
      targetGoal={mockGoal}
      goalPlaceholder="Nuevo objetivo de ahorro:"
      currentPlaceholder="Ahorros actuales:"
      chartData={chartData}
    >
      {/* Real Data Stats */}
      <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16, textAlign: 'center' }}>
          Resumen Financiero
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Total Ingresos</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.success }}>{formatEuros(totalIncome)}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Total Gastos</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.error }}>{formatEuros(totalExpenses)}</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Este Mes Ingresos</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.success }}>{formatEuros(currentMonthIncome)}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Este Mes Gastos</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.error }}>{formatEuros(currentMonthExpenses)}</Text>
          </View>
        </View>
        
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Ahorros Totales</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: currentSavings >= 0 ? colors.success : colors.error }}>
            {formatEuros(currentSavings)}
          </Text>
          {currentMonthSavings !== 0 && (
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Este mes: {formatEuros(currentMonthSavings)}
            </Text>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={{ backgroundColor: colors.card, padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16, textAlign: 'center' }}>Acciones Rápidas</Text>
        <View style={{ gap: 12 }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success + '20', padding: 16, borderRadius: 12 }}>
            <Ionicons name="add-circle" size={24} color={colors.success} />
            <Text style={{ color: colors.success, fontWeight: '600', marginLeft: 12 }}>Agregar Ahorro</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.success} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warning + '20', padding: 16, borderRadius: 12 }}>
            <Ionicons name="remove-circle" size={24} color={colors.warning} />
            <Text style={{ color: colors.warning, fontWeight: '600', marginLeft: 12 }}>Retirar Ahorro</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.warning} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '20', padding: 16, borderRadius: 12 }}>
            <Ionicons name="analytics" size={24} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '600', marginLeft: 12 }}>Ver Historial</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>
      </View>
    </GenericSavingsScreen>
  );
};

export default IndividualSavingsScreen; 