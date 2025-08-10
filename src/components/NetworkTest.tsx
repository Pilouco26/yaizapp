import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG, getApiUrl } from '../utils/config';

interface NetworkTestProps {
  onTestComplete?: (success: boolean) => void;
}

const NetworkTest: React.FC<NetworkTestProps> = ({ onTestComplete }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'error'>('pending');

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult('pending');
    
    try {
      const testUrl = await getApiUrl(API_CONFIG.ENDPOINTS.BILLS);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for test
      
      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setTestResult('success');
        Alert.alert(
          'Prueba de Red', 
          '✅ ¡Conexión exitosa a la API de Mockoon!\n\nTu configuración de red está funcionando correctamente.',
          [{ text: '¡Excelente!' }]
        );
        onTestComplete?.(true);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error: any) {
      setTestResult('error');
      
      let errorMessage = 'Prueba de red fallida';
      
      if (error.name === 'AbortError') {
        errorMessage = 'La conexión ha expirado. Verifica si Mockoon está en ejecución y accesible.';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'La solicitud de red ha fallado. Verifica tu dirección IP y configuración de red.';
      } else {
        errorMessage = error.message || 'Se produjo un error desconocido';
      }
      
      Alert.alert(
        'Prueba de Red Fallida', 
        `❌ ${errorMessage}\n\nConsejos de solución de problemas:\n• Verifica que Mockoon esté en ejecución en el puerto 3000\n• Revisa la dirección IP en config.ts\n• Asegúrate de que el dispositivo y el ordenador estén en la misma red\n• Verifica la configuración del firewall`,
        [{ text: 'OK' }]
      );
      onTestComplete?.(false);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    switch (testResult) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color="#F44336" />;
      default:
        return <Ionicons name="help-circle" size={24} color="#FF9800" />;
    }
  };

  const getStatusText = () => {
    switch (testResult) {
      case 'success':
        return 'Prueba de Red';
      case 'error':
        return 'Conexión Fallida';
      default:
        return 'No Probar';
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
        onPress={testConnection}
        disabled={isTesting}
      >
        <Ionicons 
          name={isTesting ? "hourglass" : "refresh"} 
          size={20} 
          color="#fff" 
        />
        <Text style={styles.testButtonText}>
          {isTesting ? 'Probando...' : 'Probar Conexión'}
        </Text>
      </TouchableOpacity>
      
                    <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Configuración Actual:</Text>
                <Text style={styles.infoText}>Endpoint: {API_CONFIG.ENDPOINTS.BILLS}</Text>
                <Text style={styles.infoText}>Puerto: 3000</Text>
                <Text style={styles.infoText}>IP Dinámica: Habilitada</Text>
              </View>
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
});

export default NetworkTest;
