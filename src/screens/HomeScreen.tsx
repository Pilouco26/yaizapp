import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="Yaizapp" />
      <View style={styles.content}>
      <View style={styles.iconContainer}>
        <Ionicons name="home" size={64} color="#f4511e" />
      </View>
      
      <Text style={styles.title}>Welcome to Yaizapp!</Text>
      <Text style={styles.subtitle}>Your React Native Expo App</Text>
      
      <TouchableOpacity style={styles.button}>
        <Ionicons name="heart" size={24} color="#fff" />
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features:</Text>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.featureText}>TypeScript Support</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.featureText}>React Navigation</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.featureText}>Expo Vector Icons</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.featureText}>Secure Storage Ready</Text>
        </View>
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
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4511e',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
});

export default HomeScreen; 