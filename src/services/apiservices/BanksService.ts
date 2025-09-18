import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { ApiResponse } from '../types';

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
  banks: APIBank[];
  success: boolean;
  message: string;
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

      const apiResponse: ApiResponse<BanksResponse> = await response.json();
      
      if (!apiResponse.data?.success) {
        throw new Error(apiResponse.message || 'API request failed');
      }
      
      if (apiResponse.error) {
        throw new Error(typeof apiResponse.error === 'string' ? apiResponse.error : 'API returned an error');
      }
      
      if (!apiResponse.data) {
        throw new Error('No data returned from API');
      }
      
      if (!apiResponse.data.banks) {
        throw new Error('No banks data returned from API');
      }
      
      return apiResponse.data.banks;
    } catch (error) {
      throw new Error(`Failed to fetch banks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export individual function for backward compatibility
export const getBanks = BanksService.getBanks;
