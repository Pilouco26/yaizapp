import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { DevTokenRequest, DevTokenResponse, ApiResponse } from '../types';

/**
 * Authentication Service
 * Handles authentication-related API calls
 */
export class AuthService {
  /**
   * Generate development JWT token
   * POST /api/auth/dev-token
   */
  static async generateDevToken(request: DevTokenRequest): Promise<DevTokenResponse> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.AUTH.DEV_TOKEN);
      
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AuthService] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<DevTokenResponse> = await response.json();
      console.log('✅ [AuthService] Success response:', JSON.stringify(data, null, 2));
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to generate dev token');
      }

      console.log('🎉 [AuthService] Dev token generated successfully');
      return data.data;
    } catch (error) {
      console.error('❌ [AuthService] generateDevToken error:', error);
      throw new Error(`Failed to generate dev token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store authentication token securely
   */
  static async storeToken(token: string): Promise<void> {
    try {
      // This would typically use Expo SecureStore or AsyncStorage
      // For now, we'll just log it
    } catch (error) {
      console.error('AuthService.storeToken error:', error);
      throw new Error(`Failed to store token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve stored authentication token
   */
  static async getStoredToken(): Promise<string | null> {
    try {
      // This would typically use Expo SecureStore or AsyncStorage
      // For now, we'll return null
      return null;
    } catch (error) {
      console.error('AuthService.getStoredToken error:', error);
      return null;
    }
  }

  /**
   * Clear stored authentication token
   */
  static async clearToken(): Promise<void> {
    try {
      // This would typically use Expo SecureStore or AsyncStorage
    } catch (error) {
      console.error('AuthService.clearToken error:', error);
      throw new Error(`Failed to clear token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      return token !== null && token.length > 0;
    } catch (error) {
      console.error('AuthService.isAuthenticated error:', error);
      return false;
    }
  }
}

