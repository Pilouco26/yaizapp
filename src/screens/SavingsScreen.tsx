import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

type TabType = 'solo' | 'familia';

const SavingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('solo');

  const renderSoloContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentContainer}>
        <Ionicons name="person" size={64} color="#f4511e" />
        <Text style={styles.tabTitle}>Ahorros Personales</Text>
        <Text style={styles.tabSubtitle}>Gestiona tus ahorros individuales</Text>
        <Text style={styles.placeholderText}>Contenido de Solo - Funcionando ✅</Text>
      </View>
    </View>
  );

  const renderFamiliaContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentContainer}>
        <Ionicons name="people" size={64} color="#2196F3" />
        <Text style={styles.tabTitle}>Ahorros Familiares</Text>
        <Text style={styles.tabSubtitle}>Gestiona los ahorros de la familia</Text>
        <Text style={styles.placeholderText}>Contenido de Familia - Funcionando ✅</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Ahorros" />
      
      {/* Tab Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'solo' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('solo')}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={activeTab === 'solo' ? '#fff' : '#666'} 
          />
          <Text style={[
            styles.tabButtonText,
            activeTab === 'solo' && styles.activeTabButtonText
          ]}>
            Solo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'familia' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('familia')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'familia' ? '#fff' : '#666'} 
          />
          <Text style={[
            styles.tabButtonText,
            activeTab === 'familia' && styles.activeTabButtonText
          ]}>
            Familia
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'solo' ? renderSoloContent() : renderFamiliaContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'transparent',
    minWidth: 100,
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#007bff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  tabSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default SavingsScreen; 