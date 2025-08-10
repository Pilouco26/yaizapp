import { API_CONFIG, getApiUrl } from '../utils/config';

export type APIRawBill = {
  Data: string;
  'Descripció': string;
  Import: string;
  Moneda: string;
};

/**
 * Llama a la API Mockoon y devuelve el listado crudo de facturas.
 * Uses configuration from config.ts for the API endpoint.
 */
export const getBills = async (): Promise<APIRawBill[]> => {
  const apiUrl = await getApiUrl(API_CONFIG.ENDPOINTS.BILLS);
  
  try {
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${API_CONFIG.TIMEOUT}ms`);
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Network error: ${errorMessage}`);
  }
};
