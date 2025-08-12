import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JSONBillData } from '../utils/types';
import { useTheme } from '../contexts/ThemeContext';

interface JSONImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (data: JSONBillData[]) => void;
  isLoading?: boolean;
}

const JSONImportModal: React.FC<JSONImportModalProps> = ({
  visible,
  onClose,
  onImport,
  isLoading = false,
}) => {
  const { colors } = useTheme();
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    if (!jsonInput.trim()) {
      setError('Por favor ingresa datos JSON');
      return;
    }

    try {
      const parsedData = JSON.parse(jsonInput);
      
      // Validate the structure
      if (!Array.isArray(parsedData)) {
        throw new Error('Los datos JSON deben ser un array');
      }

      const validatedData: JSONBillData[] = parsedData.map((item, index) => {
        if (!item.date || !item.description || item.value === undefined) {
          throw new Error(`Elemento inválido en el índice ${index}: faltan campos requeridos`);
        }
        
        return {
          date: item.date,
          description: item.description,
          value: item.value,
        };
      });

      setError(null);
      onImport(validatedData);
      setJsonInput('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Formato JSON inválido';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setJsonInput('');
    setError(null);
    onClose();
  };

  const insertSampleData = () => {
    const sampleData = [
      {
        date: '2024-01-15',
        description: 'Electricity Bill',
        value: -85.50,
      },
      {
        date: '2024-01-20',
        description: 'Internet Service',
        value: -59.99,
      },
      {
        date: '2024-01-25',
        description: 'Phone Bill',
        value: -45.00,
      },
      {
        date: '2024-01-01',
        description: 'Rent Payment',
        value: -1200.00,
      },
    ];
    
    setJsonInput(JSON.stringify(sampleData, null, 2));
    setError(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Importar Facturas JSON</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Formato JSON</Text>
            <Text style={styles.instructionsText}>
              Ingresa datos JSON en el siguiente formato:
            </Text>
            <Text style={styles.codeExample}>
              {`[
  {
    "date": "2024-01-15",
    "description": "Descripción de la Factura",
    "value": -85.50
  }
]`}
            </Text>
            <Text style={styles.instructionsNote}>
              • Los valores negativos indican facturas pagadas{'\n'}
              • Los valores positivos indican facturas sin pagar{'\n'}
              • Formato de fecha: AAAA-MM-DD
            </Text>
          </View>

          {/* Sample Data Button */}
          <TouchableOpacity style={styles.sampleButton} onPress={insertSampleData}>
            <Ionicons name="document-text" size={20} color="#f4511e" />
            <Text style={styles.sampleButtonText}>Insertar Datos de Ejemplo</Text>
          </TouchableOpacity>

          {/* JSON Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Datos JSON</Text>
            <TextInput
              style={[styles.jsonInput, error && styles.inputError]}
              multiline
              numberOfLines={12}
              placeholder="Pega tus datos JSON aquí..."
              value={jsonInput}
              onChangeText={(text) => {
                setJsonInput(text);
                setError(null);
              }}
              textAlignVertical="top"
              editable={!isLoading}
            />
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          {/* Import Button */}
          <TouchableOpacity
            style={[styles.importButton, isLoading && styles.disabledButton]}
            onPress={handleImport}
            disabled={isLoading}
          >
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.importButtonText}>
              {isLoading ? 'Procesando...' : 'Importar Facturas'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionsContainer: {
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
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  codeExample: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    color: '#333',
  },
  instructionsNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f4511e',
  },
  sampleButtonText: {
    color: '#f4511e',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputContainer: {
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
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  jsonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 200,
    fontFamily: 'monospace',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginLeft: 4,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4511e',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default JSONImportModal; 