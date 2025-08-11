import { useState } from 'react';
import { Bill } from '../utils/types';

type SummaryStats = {
  totalBills: number;
  totalPositive: number;
  totalNegative: number;
  totalCount: number;
};

/**
 * Hook que centraliza la gestión de facturas para BillsScreen
 */
export const useBillsData = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Recibe un array de facturas (desde API, JSON importado, etc.)
   * y lo coloca en el estado.
   */
  const processJSONData = async (jsonData: Bill[]) => {
    try {
      setIsLoading(true);
      setError(null);
      // En esta versión simplemente se reemplaza el listado.
      // Aquí se podría añadir persistencia con AsyncStorage.
      setBills(jsonData);
    } catch (err: any) {
      setError(err.message ?? 'Error procesando los datos');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Devuelve estadísticas de resumen para las tarjetas del header
   */
  const getSummaryStats = (): SummaryStats => {
    const totalBills = bills.reduce((acc, b) => acc + b.amount, 0);
    const totalPositive = bills
      .filter(b => b.amount >= 0)
      .reduce((acc, b) => acc + b.amount, 0);
    const totalNegative = bills
      .filter(b => b.amount < 0)
      .reduce((acc, b) => acc + Math.abs(b.amount), 0);

    return {
      totalBills,
      totalPositive,
      totalNegative,
      totalCount: bills.length,
    };
  };

  // De momento asumimos conexión OK siempre; mantener firma usada por BillsScreen
  const isConnected = true;

  return {
    bills,
    isLoading,
    error,
    isConnected,
    processJSONData,
    getSummaryStats,
  };
};
