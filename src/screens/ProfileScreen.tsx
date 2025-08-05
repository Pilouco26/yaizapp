import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../components/Header';

const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView style={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>User Name</Text>
        <Text style={styles.email}>user@example.com</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Personal Information</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Security</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Notifications</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Language</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Theme</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>About</Text>
        </View>
      </View>
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
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen; 