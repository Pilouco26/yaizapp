import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

const SavingsScreen: React.FC = () => {
  // For now, let's use a sample savings value
  // In a real app, this would come from your data source
  const [savings] = useState(1250.75); // Positive value for green color

  const isPositive = savings >= 0;
  const formattedSavings = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(savings));

  return (
    <View style={styles.container}>
      <Header title="Ahorros" />
      <View style={styles.content}>
        <View style={styles.savingsContainer}>
        <Text style={styles.savingsLabel}>Tus Ahorros</Text>
        
        <View style={styles.amountContainer}>
          <Text style={[
            styles.amount,
            { color: isPositive ? '#4CAF50' : '#F44336' }
          ]}>
            {isPositive ? '+' : '-'} {formattedSavings}
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <Ionicons 
            name={isPositive ? "trending-up" : "trending-down"} 
            size={48} 
            color={isPositive ? '#4CAF50' : '#F44336'} 
          />
        </View>

        <Text style={styles.statusText}>
          {isPositive ? '¡Excelente trabajo! Estás ahorrando dinero.' : 'Actualmente estás en deuda.'}
        </Text>
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  savingsContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  savingsLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  amountContainer: {
    marginBottom: 20,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SavingsScreen; 