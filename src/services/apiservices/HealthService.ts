import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { HealthResponse, HealthSearchParams, ApiResponse } from '../types';

/**
 * Health Service
 * Handles health check API calls
 */
export class HealthService {
  /**
   * Get comprehensive health information
   * GET /api/health
   */
  static async getHealth(): Promise<HealthResponse> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.HEALTH.BASE);
      
      console.log('🏥 [HealthService] Checking API health...');
      console.log('📡 [HealthService] API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      console.log('📥 [HealthService] Response status:', response.status);
      console.log('📥 [HealthService] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [HealthService] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<HealthResponse> = await response.json();
      console.log('✅ [HealthService] Success response:', JSON.stringify(data, null, 2));
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to get health information');
      }

      console.log('🎉 [HealthService] API health check successful');
      return data.data;
    } catch (error) {
      console.error('❌ [HealthService] getHealth error:', error);
      throw new Error(`Failed to get health information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get filtered health information
   * GET /api/health/searchBy?type=*ping|detailed*&format=*json*
   */
  static async searchHealth(params: HealthSearchParams): Promise<HealthResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.type) {
        searchParams.append('type', params.type);
      }
      if (params.format) {
        searchParams.append('format', params.format);
      }

      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.HEALTH.SEARCH}?${searchParams.toString()}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<HealthResponse> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to search health information');
      }

      return data.data;
    } catch (error) {
      console.error('HealthService.searchHealth error:', error);
      throw new Error(`Failed to search health information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simple ping check
   */
  static async ping(): Promise<boolean> {
    try {
      const health = await this.searchHealth({ type: 'ping' });
      return health.status === 'healthy';
    } catch (error) {
      console.error('HealthService.ping error:', error);
      return false;
    }
  }

  /**
   * Detailed health check
   */
  static async detailedCheck(): Promise<HealthResponse> {
    try {
      return await this.searchHealth({ type: 'detailed' });
    } catch (error) {
      console.error('HealthService.detailedCheck error:', error);
      throw error;
    }
  }
}

