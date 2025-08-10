import { Platform } from 'react-native';
import type { Bill } from '../types/Bill';

/**
 * Determina la URL base del Mock API (Mockoon).
 * Usa EXPO_PUBLIC_MOCK_API_URL si está definida para facilitar configuración en tiempo de build.
 * Defaults:
 *  - iOS Simulator: http://localhost:3001
 *  - Android Emulator: http://10.0.2.2:3001
 *  - Dispositivo físico: cambia la IP LAN según tu red (por defecto 192.168.1.100:3001)
 */
function getBaseUrl() {
  const env = process.env.EXPO_PUBLIC_MOCK_API_URL;
  if (env && env.trim().length > 0) return env.trim();

  return Platform.select({
    ios: 'http://localhost:3000',
    android: 'http://10.0.2.2:3000',
    default: 'http://192.168.1.100:3000',
  })!;
}

/**
 * Llama al endpoint de Mockoon y devuelve las facturas.
 * Lanza un error en caso de fallo para que el consumidor decida cómo manejarlo.
 */
export async function fetchBillsFromAPI(baseUrl = getBaseUrl()): Promise<Bill[]> {
  const url = `${baseUrl.replace(/\/+$/, '')}/bills`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    // Validación ligera
    if (!Array.isArray(json)) {
      throw new Error('Respuesta no válida del servidor (se esperaba un array)');
    }
    return json as Bill[];
  } catch (err: any) {
    console.error('Error fetching bills:', err);
    throw err;
  }
}

/**
 * Variante segura: intenta la API y si falla devuelve una lista vacía.
 * Útil para pantallas que deben degradar a "sin datos" en lugar de romperse.
 */
export async function safeFetchBills(baseUrl?: string): Promise<{ data: Bill[]; fromCache: boolean; error?: string }> {
  try {
    const data = await fetchBillsFromAPI(baseUrl);
    return { data, fromCache: false };
  } catch (e: any) {
    const message = e?.message ?? String(e);
    console.warn('API connection failed, using local data: ' + message);
    // Requisito: si falla, mostrar "sin datos" => devolvemos lista vacía
    return { data: [], fromCache: true, error: message };
  }
}

// Export por defecto para compatibilidad con import default
export default fetchBillsFromAPI;
