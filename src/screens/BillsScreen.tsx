import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  category: string;
}

const BillsScreen: React.FC = () => {
  const [bills] = useState<Bill[]>([
    {
      id: '1',
      name: 'Electricity Bill',
      amount: 85.50,
      dueDate: '2024-01-15',
      isPaid: false,
      category: 'Utilities'
    },
    {
      id: '2',
      name: 'Internet Service',
      amount: 59.99,
      dueDate: '2024-01-20',
      isPaid: true,
      category: 'Utilities'
    },
    {
      id: '3',
      name: 'Phone Bill',
      amount: 45.00,
      dueDate: '2024-01-25',
      isPaid: false,
      category: 'Communication'
    },
    {
      id: '4',
      name: 'Rent',
      amount: 1200.00,
      dueDate: '2024-01-01',
      isPaid: true,
      category: 'Housing'
    }
  ]);

  const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidBills = bills.filter(bill => bill.isPaid);
  const unpaidBills = bills.filter(bill => !bill.isPaid);
  const totalPaid = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Utilities':
        return 'flash';
      case 'Communication':
        return 'call';
      case 'Housing':
        return 'home';
      default:
        return 'document';
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Bills" />
      <ScrollView style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Ionicons name="wallet" size={24} color="#f4511e" />
            <Text style={styles.summaryAmount}>{formatCurrency(totalBills)}</Text>
            <Text style={styles.summaryLabel}>Total Bills</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.summaryAmount}>{formatCurrency(totalPaid)}</Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Ionicons name="alert-circle" size={24} color="#F44336" />
            <Text style={styles.summaryAmount}>{formatCurrency(totalUnpaid)}</Text>
            <Text style={styles.summaryLabel}>Unpaid</Text>
          </View>
        </View>

        {/* Bills List */}
        <View style={styles.billsContainer}>
          <Text style={styles.sectionTitle}>All Bills</Text>
          
          {bills.map((bill) => (
            <TouchableOpacity key={bill.id} style={styles.billItem}>
              <View style={styles.billIcon}>
                <Ionicons 
                  name={getCategoryIcon(bill.category) as any} 
                  size={24} 
                  color={bill.isPaid ? '#4CAF50' : '#f4511e'} 
                />
              </View>
              
              <View style={styles.billInfo}>
                <Text style={styles.billName}>{bill.name}</Text>
                <Text style={styles.billCategory}>{bill.category}</Text>
                <Text style={styles.billDueDate}>Due: {formatDate(bill.dueDate)}</Text>
              </View>
              
              <View style={styles.billAmount}>
                <Text style={[
                  styles.billAmountText,
                  { color: bill.isPaid ? '#4CAF50' : '#F44336' }
                ]}>
                  {formatCurrency(bill.amount)}
                </Text>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: bill.isPaid ? '#4CAF50' : '#F44336' }
                ]}>
                  <Ionicons 
                    name={bill.isPaid ? 'checkmark' : 'close'} 
                    size={12} 
                    color="#fff" 
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Bill Button */}
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Bill</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  billsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  billCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  billDueDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  billAmount: {
    alignItems: 'flex-end',
  },
  billAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4511e',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default BillsScreen; 