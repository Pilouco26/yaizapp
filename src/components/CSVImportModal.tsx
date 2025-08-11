import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { JSONBillData } from '../utils/types';
import { uploadBills } from '../services/BillsService';

interface CSVImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (data: JSONBillData[]) => void;
  isLoading?: boolean;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({
  visible,
  onClose,
  onImport,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const pickDocument = async () => {
    try {
      setError(null);
      setUploadStatus('idle');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setSelectedFile(result);
      }
    } catch (err) {
      setError('Error al seleccionar el archivo CSV');
    }
  };

  const parseCSV = async (uri: string): Promise<JSONBillData[]> => {
    try {
      const response = await fetch(uri);
      const csvText = await response.text();
      
      // Parse CSV content
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('El archivo CSV debe tener al menos una fila de encabezados y una fila de datos');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data: JSONBillData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        if (values.length < 3) continue;

        // Try to find the correct columns by common header names
        let dateIndex = -1;
        let descriptionIndex = -1;
        let valueIndex = -1;

        headers.forEach((header, index) => {
          if (header.includes('fecha') || header.includes('date') || header.includes('fecha')) {
            dateIndex = index;
          } else if (header.includes('descripcion') || header.includes('description') || header.includes('concepto')) {
            descriptionIndex = index;
          } else if (header.includes('valor') || header.includes('value') || header.includes('importe') || header.includes('amount')) {
            valueIndex = index;
          }
        });

        // If we can't find the columns, use the first three columns
        if (dateIndex === -1) dateIndex = 0;
        if (descriptionIndex === -1) descriptionIndex = 1;
        if (valueIndex === -1) valueIndex = 2;

        const date = values[dateIndex] || '';
        const description = values[descriptionIndex] || '';
        const valueStr = values[valueIndex] || '0';

        // Parse the value, removing currency symbols and commas
        const value = parseFloat(valueStr.replace(/[€$,\s]/g, '')) || 0;

        // Validate required fields
        if (date && description && !isNaN(value)) {
          data.push({
            date,
            description,
            value,
          });
        }
      }

      if (data.length === 0) {
        throw new Error('No se encontraron datos válidos en el archivo CSV');
      }

      return data;
    } catch (err) {
      throw new Error(`Error al procesar el archivo CSV: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedFile.assets || selectedFile.assets.length === 0) {
      setError('Por favor selecciona un archivo CSV');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setUploadStatus('uploading');

      const asset = selectedFile.assets[0];
      const parsedData = await parseCSV(asset.uri);

      // Upload the parsed data to the API
      await uploadBills(parsedData);
      
      setUploadStatus('success');
      setError(null);
      
      // Call the onImport callback with the parsed data
      onImport(parsedData);
      
      // Close modal after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadStatus('idle');
        onClose();
      }, 1500);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar el archivo';
      setError(errorMessage);
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setUploadStatus('idle');
    onClose();
  };

  const getFileName = () => {
    if (selectedFile && selectedFile.assets && selectedFile.assets.length > 0) {
      return selectedFile.assets[0].name;
    }
    return 'Ningún archivo seleccionado';
  };

  const getUploadStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Subiendo a la API...';
      case 'success':
        return '¡Subida exitosa!';
      case 'error':
        return 'Error en la subida';
      default:
        return 'Importar Facturas';
    }
  };

  const getUploadStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <ActivityIndicator size="small" color="#fff" />;
      case 'success':
        return <Ionicons name="checkmark" size={20} color="#fff" />;
      case 'error':
        return <Ionicons name="close" size={20} color="#fff" />;
      default:
        return <Ionicons name="cloud-upload" size={20} color="#fff" />;
    }
  };

  const getUploadButtonStyle = () => {
    switch (uploadStatus) {
      case 'success':
        return [styles.importButton, styles.successButton];
      case 'error':
        return [styles.importButton, styles.errorButton];
      default:
        return [styles.importButton, (!selectedFile || isLoading || isProcessing) && styles.disabledButton];
    }
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
          <Text style={styles.headerTitle}>Importar Facturas CSV</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Formato CSV</Text>
            <Text style={styles.instructionsText}>
              Selecciona un archivo CSV con el siguiente formato:
            </Text>
            <Text style={styles.codeExample}>
              {`fecha,descripcion,valor
2024-01-15,Electricidad,-85.50
2024-01-20,Internet,-59.99
2024-01-25,Telefono,-45.00`}
            </Text>
            <Text style={styles.instructionsNote}>
              • Los valores negativos indican facturas pagadas{'\n'}
              • Los valores positivos indican facturas sin pagar{'\n'}
              • Formato de fecha: AAAA-MM-DD{'\n'}
              • El archivo debe tener encabezados en la primera fila{'\n'}
              • Los datos se subirán automáticamente a la API
            </Text>
          </View>

          {/* File Selection */}
          <View style={styles.fileContainer}>
            <Text style={styles.fileLabel}>Archivo CSV</Text>
            <TouchableOpacity 
              style={styles.fileButton} 
              onPress={pickDocument}
              disabled={isLoading || isProcessing}
            >
              <Ionicons name="document" size={20} color="#2196F3" />
              <Text style={styles.fileButtonText}>Seleccionar Archivo CSV</Text>
            </TouchableOpacity>
            
            {selectedFile && (
              <View style={styles.selectedFileContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.selectedFileName}>{getFileName()}</Text>
              </View>
            )}
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Upload Status Display */}
          {uploadStatus === 'success' && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.successText}>¡Facturas subidas exitosamente a la API!</Text>
            </View>
          )}

          {/* Import Button */}
          <TouchableOpacity
            style={getUploadButtonStyle()}
            onPress={handleImport}
            disabled={!selectedFile || isLoading || isProcessing || uploadStatus === 'success'}
          >
            {getUploadStatusIcon()}
            <Text style={styles.importButtonText}>
              {getUploadStatusText()}
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
  fileContainer: {
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
  fileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  fileButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
  },
  selectedFileName: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginLeft: 8,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
    marginLeft: 8,
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
  successButton: {
    backgroundColor: '#4CAF50',
  },
  errorButton: {
    backgroundColor: '#F44336',
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

export default CSVImportModal; 