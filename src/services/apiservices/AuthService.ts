import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { DevTokenRequest, DevTokenResponse } from '../types';
import { ApiResponse, LoginResponseData } from '../../utils/types';

/**
 * Authentication Service
 * Handles authentication-related API calls
 */
export class AuthService {
  /**
   * Login with username and password
   * POST /api/auth/login
   */
  static async login(body: { username: string; password: string }): Promise<{ token?: string; user?: any; success?: boolean }>
  {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.AUTH.LOGIN);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AuthService] Login error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<LoginResponseData> = await response.json();
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }

      return { token: data.data?.token, user: data.data?.auth?.user, success: data.data?.success };
    } catch (error) {
      console.error('❌ [AuthService] login error:', error);
      throw new Error(`Failed to login: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  /**
   * Register new user
   * POST /api/auth/register
   */
  static async register(body: { nom: string; username: string; email: string; password: string }): Promise<{ token?: string; success?: boolean }> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.AUTH.REGISTER);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AuthService] Register error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<{ token?: string }> = await response.json();

      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }

      return { token: data.data?.token, success: data.success };
    } catch (error) {
      console.error('❌ [AuthService] register error:', error);
      throw new Error(`Failed to register: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
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
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      if (!data.data) {
        throw new Error('No data returned from API');
      }

      ('🎉 [AuthService] Dev token generated successfully');
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

