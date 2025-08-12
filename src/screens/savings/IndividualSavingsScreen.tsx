import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import GenericSavingsScreen from './GenericSavingsScreen';

const IndividualSavingsScreen: React.FC = () => {
  const mockGoal = 5000;
  const mockCurrent = 3200;

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
      initialCurrent={mockCurrent}
      goalPlaceholder="Nuevo objetivo de ahorro:"
      currentPlaceholder="Ahorros actuales:"
    >
      {/* Quick Actions */}
      <View className="bg-white p-6 rounded-2xl shadow-lg shadow-black/10">
        <Text className="text-lg font-bold text-neutral-700 mb-4 text-center">Acciones Rápidas</Text>
        <View className="space-y-3">
          <TouchableOpacity className="flex-row items-center bg-success-50 p-4 rounded-xl">
            <Ionicons name="add-circle" size={24} color="#22c55e" />
            <Text className="text-success-700 font-semibold ml-3">Agregar Ahorro</Text>
            <Ionicons name="chevron-forward" size={20} color="#22c55e" className="ml-auto" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-warning-50 p-4 rounded-xl">
            <Ionicons name="remove-circle" size={24} color="#f59e0b" />
            <Text className="text-warning-700 font-semibold ml-3">Retirar Ahorro</Text>
            <Ionicons name="chevron-forward" size={20} color="#f59e0b" className="ml-auto" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-info-50 p-4 rounded-xl">
            <Ionicons name="analytics" size={24} color="#3b82f6" />
            <Text className="text-info-700 font-semibold ml-3">Ver Historial</Text>
            <Ionicons name="chevron-forward" size={20} color="#3b82f6" className="ml-auto" />
          </TouchableOpacity>
        </View>
      </View>
    </GenericSavingsScreen>
  );
};

export default IndividualSavingsScreen; 