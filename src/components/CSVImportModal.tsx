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
import { getFullApiUrlWithAuth, getDefaultHeaders, API_CONFIG } from '../utils/config';
import { user_id } from '../config/constants';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors } = useTheme();
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

      // Split keeping portability for Windows/Unix line endings and ignore empty lines
      const lines = csvText.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('El archivo CSV debe tener al menos una fila de encabezados y una fila de datos');
      }

      /**
       * Parse one CSV line respecting quoted fields which can contain commas.
       */
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            // Toggle quote status
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
      
      const data: JSONBillData[] = [];

      for (let i = 1; i < lines.length; i++) {
        
        const row = parseCSVLine(lines[i]);
        
        if (row.length < 3) {
          continue;
        }

        // Identify relevant column indices
        let dateIdx = -1;
        let descIdx = -1;
        let valueIdx = -1;

        headers.forEach((header, idx) => {
          if ((header.includes('data') || header.includes('fecha') || header.includes('date')) && !header.includes('valor')) {
            dateIdx = idx;
          } else if (header.includes('descripció') || header.includes('descripcion') || header.includes('description') || header.includes('concepto')) {
            descIdx = idx;
          } else if (header.includes('import') || header.includes('valor') || header.includes('value') || header.includes('importe') || header.includes('amount')) {
            valueIdx = idx;
          }
        });

        // Fallbacks when not found
        if (dateIdx === -1) {
          dateIdx = 0;
        }
        if (descIdx === -1) {
          descIdx = 1;
        }
        if (valueIdx === -1) {
          valueIdx = 3; // In provided bank CSV, Import is 4th column
        }

        const rawDate = row[dateIdx] ?? '';
        const rawDescription = row[descIdx] ?? '';
        const rawValue = row[valueIdx] ?? '0';


        // Clean description and value (remove quotes)
        const description = rawDescription.replace(/^"|"$/g, '');

        // Handle European number format and remove thousand separators & currency symbols
        const cleanValueStr = rawValue
          .replace(/"/g, '') // remove quotes
          .replace(/\./g, '') // remove thousand separators (dots)
          .replace(',', '.')  // replace comma with dot for decimal
          .replace(/[€$\s]/g, '');


        const value = parseFloat(cleanValueStr);

        // Validation
        const isValidDate = !!rawDate;
        const isValidDescription = !!description;
        const isValidValue = !isNaN(value);
        

        if (isValidDate && isValidDescription && isValidValue) {
          const parsedItem = {
            date: rawDate,
            description,
            value,
          };
          data.push(parsedItem);
        } else {
        }
      }

      (`\n🎉 [CSVImportModal] Parsing completed!`);

      if (data.length === 0) {
        throw new Error('No se encontraron datos válidos en el archivo CSV');
      }

      return data;
    } catch (err) {
      console.error('❌ [CSVImportModal] CSV parsing error:', err);
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

      const monthEndpoint = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.MONTHS.BASE);
      const txEndpoint = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.TRANSACTIONS.BASE);

      // Group parsed items by year & month (using JS Date for reliability)
      const groups: Record<string, Array<{ item: JSONBillData; jsDate: Date }>> = {};
      parsedData.forEach(item => {
        const dateStr = (item.date ?? '').trim();
        if (!dateStr) return;
        let jsDate: Date | null = null;
        if (dateStr.includes('/') && dateStr.split('/').length === 3) {
          const [d, m, y] = dateStr.split('/').map(v => parseInt(v, 10));
          if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
            jsDate = new Date(y, m - 1, d);
          }
        }
        if (!jsDate || isNaN(jsDate.getTime())) {
          jsDate = new Date(dateStr);
        }
        if (!jsDate || isNaN(jsDate.getTime())) return;
        const year = jsDate.getFullYear();
        const month = jsDate.getMonth() + 1;
        const key = `${year}-${month}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push({ item, jsDate });
      });

      // Sequentially process each month
      for (const key of Object.keys(groups)) {
        const [yearStr, monthStr] = key.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
        const monthBody = { userId: user_id, year, month };
        let monthId: string | null = null;

        // 1. Try to create month
        const createRes = await fetch(monthEndpoint, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(monthBody),
        });
        if (createRes.ok) {
          const data = await createRes.json();
          monthId = data?.data?.id ?? null;
          (`📅 Created month ${monthId}`);
        } else if (createRes.status === 409) {
          // 2. If conflict, fetch existing month via searchBy
          const searchUrl = getFullApiUrlWithAuth(
            `${API_CONFIG.ENDPOINTS.MONTHS.SEARCH}?userId=${user_id}&year=${year}&month=${month}`
          );
          const searchRes = await fetch(searchUrl, {
            method: 'GET',
            headers: getDefaultHeaders(),
          });
          if (!searchRes.ok) {
            const errText = await searchRes.text();
            throw new Error(`Failed to fetch existing month: ${errText}`);
          }
          const searchData = await searchRes.json();
          monthId = searchData?.data?.[0]?.id ?? null;
          (`ℹ️ Using existing month ${monthId}`);
        } else {
          const errText = await createRes.text();
          throw new Error(`Month create failed: ${errText}`);
        }

        if (!monthId) throw new Error('monthId not found');

        // 3. Build & post transactions for this month
        const rows = groups[key];
        const txBodies = rows.map(({ item: row, jsDate }) => {
          const rawAmount = Number(row.value);
          const isExpense = rawAmount < 0;
          return {
            userId: user_id,
            monthId,
            type: isExpense ? 'EXPENSE' : 'INCOME',
            description: row.description ?? '',
            amount: rawAmount,
            date: jsDate.toISOString(),
          };
        });

        await Promise.all(
          txBodies.map(async body => {
            const txRes = await fetch(txEndpoint, {
              method: 'POST',
              headers: getDefaultHeaders(),
              body: JSON.stringify(body),
            });
            if (!txRes.ok) {
              const errText = await txRes.text();
              throw new Error(`Transaction POST failed: ${errText}`);
            }
          })
        );
        (`✅ Posted ${txBodies.length} transactions for month ${year}-${month}`);
      }

      // All done
      setUploadStatus('success');
      setError(null);
      onImport(parsedData);
      setTimeout(() => {
        setSelectedFile(null);
        setUploadStatus('idle');
        onClose();
      }, 1500);

      return; // early exit; rest of old code removed
      
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Importar Facturas CSV</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Instructions */}
          <View style={[styles.instructionsContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.instructionsTitle, { color: colors.textPrimary }]}>Formato CSV</Text>
            <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
              Selecciona un archivo CSV con el siguiente formato:
            </Text>
            <Text style={[styles.codeExample, { backgroundColor: colors.surface, color: colors.textPrimary }]}>
              {`fecha,descripcion,valor
2024-01-15,Electricidad,-85.50
2024-01-20,Internet,-59.99
2024-01-25,Telefono,-45.00`}
            </Text>
            <Text style={[styles.instructionsNote, { color: colors.textSecondary }]}>
              • Los valores negativos indican facturas pagadas{'\n'}
              • Los valores positivos indican facturas sin pagar{'\n'}
              • Formato de fecha: AAAA-MM-DD{'\n'}
              • El archivo debe tener encabezados en la primera fila{'\n'}
              • Los datos se subirán automáticamente a la API
            </Text>
          </View>

          {/* File Selection */}
          <View style={[styles.fileContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.fileLabel, { color: colors.textPrimary }]}>Archivo CSV</Text>
            <TouchableOpacity 
              style={[styles.fileButton, { backgroundColor: colors.surface }]} 
              onPress={pickDocument}
              disabled={isLoading || isProcessing}
            >
              <Ionicons name="document" size={20} color={colors.primary} />
              <Text style={[styles.fileButtonText, { color: colors.primary }]}>Seleccionar Archivo CSV</Text>
            </TouchableOpacity>
            
            {selectedFile && (
              <View style={[styles.selectedFileContainer, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.selectedFileName, { color: colors.success }]}>{getFileName()}</Text>
              </View>
            )}
          </View>

          {/* Error Display */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          {/* Upload Status Display */}
          {uploadStatus === 'success' && (
            <View style={[styles.successContainer, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.successText, { color: colors.success }]}>¡Facturas subidas exitosamente a la API!</Text>
            </View>
          )}

          {/* Import Button */}
          <TouchableOpacity
            style={[
              styles.importButton,
              { backgroundColor: colors.primary },
              uploadStatus === 'success' && { backgroundColor: colors.success },
              uploadStatus === 'error' && { backgroundColor: colors.error },
              (!selectedFile || isLoading || isProcessing) && { backgroundColor: colors.textTertiary }
            ]}
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