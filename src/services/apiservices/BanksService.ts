import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';

export type APIBank = {
  id: number;
  name: string;
  type: string;
  fileAcceptance: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export type BanksResponse = {
  data: APIBank[];
};

/**
 * Banks Service - Handles all bank-related API calls
 */
export class BanksService {
  /**
   * Llama a la API Mockoon y devuelve el listado de bancos.
   * Uses configuration from config.ts for the API endpoint.
   */
  static async getBanks(): Promise<APIBank[]> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.BANKS);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BanksResponse = await response.json();
      return data.data;
    } catch (error) {
      throw new Error(`Failed to fetch banks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export individual function for backward compatibility
export const getBanks = BanksService.getBanks;
