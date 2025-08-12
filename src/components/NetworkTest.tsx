import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG, getFullApiUrl, getCurrentNetworkInfo } from '../utils/config';
import { useTheme } from '../contexts/ThemeContext';

interface NetworkTestProps {
  onTestComplete?: (success: boolean) => void;
}

interface TestResult {
  success: boolean;
  message: string;
}

const NetworkTest: React.FC<NetworkTestProps> = ({ onTestComplete }) => {
  const { colors } = useTheme();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [currentApiUrl, setCurrentApiUrl] = useState<string>('');
  const [currentNetwork, setCurrentNetwork] = useState<string>('');

  useEffect(() => {
    // Get the current API URL and network info when component mounts
    const getCurrentInfo = async () => {
      try {
        const url = getFullApiUrl(API_CONFIG.ENDPOINTS.BILLS);
        const networkInfo = getCurrentNetworkInfo();
        setCurrentApiUrl(url);
        setCurrentNetwork(networkInfo.name || 'Detectando...');
      } catch (error) {
        setCurrentApiUrl('Error getting URL');
        setCurrentNetwork('Error');
      }
    };
    getCurrentInfo();
  }, []);

  const testNetwork = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const url = getFullApiUrl(API_CONFIG.ENDPOINTS.BILLS);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setTestResult({ success: true, message: 'Conexión exitosa' });
        onTestComplete?.(true);
      } else {
        setTestResult({ success: false, message: `Error HTTP: ${response.status}` });
        onTestComplete?.(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setTestResult({ success: false, message: `Error de conexión: ${errorMessage}` });
      onTestComplete?.(false);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (!testResult) {
      return <Ionicons name="help-circle" size={24} color="#FF9800" />;
    }
    
    if (testResult.success) {
      return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
    } else {
      return <Ionicons name="close-circle" size={24} color="#F44336" />;
    }
  };

  const getStatusText = () => {
    if (!testResult) {
      return 'No Probar';
    }
    
    if (testResult.success) {
      return 'Prueba de Red';
    } else {
      return 'Conexión Fallida';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wifi" size={20} color="#666" />
        <Text style={styles.title}>Prueba de Red</Text>
      </View>
      
      <View style={styles.statusContainer}>
        {getStatusIcon()}
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.testButton, isTesting && styles.testButtonDisabled]}
        onPress={testNetwork}
        disabled={isTesting}
      >
        {isTesting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="refresh" size={20} color="#fff" />
        )}
        <Text style={styles.testButtonText}>
          {isTesting ? 'Probando...' : 'Probar Conexión'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Configuración Actual:</Text>
        <Text style={styles.infoText}>Red Detectada: {currentNetwork}</Text>
        <Text style={styles.infoText}>Endpoint: {API_CONFIG.ENDPOINTS.BILLS}</Text>
        <Text style={styles.infoText}>Puerto: 3000</Text>
        <Text style={styles.infoText}>IP Dinámica: Habilitada</Text>
        <Text style={styles.infoText}>URL Actual: {currentApiUrl}</Text>
      </View>
      
      {testResult && (
        <View style={[styles.resultContainer, { backgroundColor: testResult.success ? '#e8f5e8' : '#ffebee' }]}>
          <Text style={[styles.resultText, { color: testResult.success ? '#2e7d32' : '#c62828' }]}>
            {testResult.message}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  resultContainer: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NetworkTest;
