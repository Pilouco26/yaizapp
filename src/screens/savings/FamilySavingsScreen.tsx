import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GenericSavingsScreen from './GenericSavingsScreen';
import { ChartDataPoint } from '../../components/LinearChart';
import { useObjective } from '../../hooks/useObjective';

const FamilySavingsScreen: React.FC = () => {
  const { objectiveAmount } = useObjective();
  const mockFamilyGoal = 10000;
  const mockFamilyCurrent = 7500;

  // Mock chart data with negative values to demonstrate functionality
  const mockFamilyChartData: ChartDataPoint[] = [
    { label: 'Ene', value: -1200 },
    { label: 'Feb', value: -800 },
    { label: 'Mar', value: -1500 },
    { label: 'Abr', value: -900 },
    { label: 'May', value: -1100 },
    { label: 'Jun', value: -644 },
  ];

  const familyMembers = [
    { name: 'María', contribution: 2500, color: '#3b82f6' },
    { name: 'Carlos', contribution: 2000, color: '#10b981' },
    { name: 'Ana', contribution: 1500, color: '#f59e0b' },
    { name: 'Luis', contribution: 1500, color: '#8b5cf6' },
  ];
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <GenericSavingsScreen
      headerIcon="people"
      iconColor="#3b82f6"
      iconBgColor="#dbeafe"
      title="Ahorros Familiares"
      subtitle="Gestiona los ahorros de toda la familia"
      primaryColor="#3b82f6"
      secondaryColor="#bfdbfe"
      initialGoal={mockFamilyGoal}
      initialCurrent={mockFamilyCurrent}
      targetGoal={objectiveAmount}
      goalPlaceholder="Nuevo objetivo familiar:"
      currentPlaceholder="Ahorros familiares actuales:"
      chartData={mockFamilyChartData}
    >
      {/* Family Members Contributions */}
      <View className="bg-white p-6 rounded-2xl mb-6 shadow-lg shadow-black/10">
        <Text className="text-lg font-bold text-neutral-700 mb-4 text-center">Contribuciones por Miembro</Text>
        {familyMembers.map((member, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between py-3 last:border-b-0"
          >
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: member.color + '20' }}
              >
                <Ionicons name="person" size={20} color={member.color} />
              </View>
              <Text className="text-base font-semibold text-neutral-700">{member.name}</Text>
            </View>
            <Text className="text-base font-bold text-neutral-700">{formatCurrency(member.contribution)}</Text>
          </View>
        ))}
        <View className="mt-4 pt-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-neutral-700">Total:</Text>
            <Text className="text-xl font-bold" style={{ color: '#3b82f6' }}>
              {formatCurrency(familyMembers.reduce((sum, m) => sum + m.contribution, 0))}
            </Text>
          </View>
        </View>
      </View>

      {/* Family Actions */}
      <View className="bg-white p-6 rounded-2xl shadow-lg shadow-black/10">
        <Text className="text-lg font-bold text-neutral-700 mb-4 text-center">Acciones Familiares</Text>
        <View className="space-y-3">
          <TouchableOpacity className="flex-row items-center bg-success-50 p-4 rounded-xl">
            <Ionicons name="people-circle" size={24} color="#22c55e" />
            <Text className="text-success-700 font-semibold ml-3">Agregar Miembro</Text>
            <Ionicons name="chevron-forward" size={20} color="#22c55e" className="ml-auto" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-warning-50 p-4 rounded-xl">
            <Ionicons name="cash" size={24} color="#f59e0b" />
            <Text className="text-warning-700 font-semibold ml-3">Distribuir Ahorros</Text>
            <Ionicons name="chevron-forward" size={20} color="#f59e0b" className="ml-auto" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-info-50 p-4 rounded-xl">
            <Ionicons name="trending-up" size={24} color="#3b82f6" />
            <Text className="text-info-700 font-semibold ml-3">Ver Estadísticas</Text>
            <Ionicons name="chevron-forward" size={20} color="#3b82f6" className="ml-auto" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-purple-50 p-4 rounded-xl">
            <Ionicons name="calendar" size={24} color="#8b5cf6" />
            <Text className="text-purple-700 font-semibold ml-3">Programar Meta</Text>
            <Ionicons name="chevron-forward" size={20} color="#8b5cf6" className="ml-auto" />
          </TouchableOpacity>
        </View>
      </View>
    </GenericSavingsScreen>
  );
}

export default FamilySavingsScreen; 