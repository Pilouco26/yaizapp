import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { Family, CreateFamilyRequest, UpdateFamilyRequest, FamilySearchParams, ApiResponse } from '../types';

/**
 * Families Service
 * Handles family management API calls
 */
export class FamiliesService {
  /**
   * Get all families
   * GET /api/families
   */
  static async getAllFamilies(authToken?: string): Promise<Family[]> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.FAMILIES.BASE);
      
      const headers = getDefaultHeaders();

      if (authToken) {
        // Override with Bearer token if provided
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Family[]> = await response.json();
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      if (!data.data) {
        throw new Error('No data returned from API');
      }

      return Array.isArray(data.data) ? data.data : [data.data];
    } catch (error) {
      console.error('FamiliesService.getAllFamilies error:', error);
      throw new Error(`Failed to get families: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search families by ID or name
   * GET /api/families/searchBy?id=*id*&name=*string*
   */
  static async searchFamilies(params: FamilySearchParams, authToken?: string): Promise<Family[]> {
    try {
      console.log('🔍 FamiliesService.searchFamilies called with params:', params);
      
      const searchParams = new URLSearchParams();
      
      if (params.id) {
        searchParams.append('id', params.id);
      }
      if (params.name) {
        searchParams.append('name', params.name);
      }

      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.FAMILIES.SEARCH}?${searchParams.toString()}`);
      console.log('🌐 FamiliesService.searchFamilies API URL:', apiUrl);
      
      const headers = getDefaultHeaders();

      if (authToken) {
        // Override with Bearer token if provided
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      console.log('📤 FamiliesService.searchFamilies request headers:', headers);
      console.log('📤 FamiliesService.searchFamilies making GET request...');

      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'GET',
          headers,
        });
      } catch (fetchError) {
        console.error('❌ FamiliesService.searchFamilies fetch error:', fetchError);
        throw fetchError;
      }

      console.log('📥 FamiliesService.searchFamilies response status:', response.status);
      console.log('📥 FamiliesService.searchFamilies response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ FamiliesService.searchFamilies HTTP error response body:', errorText);
        console.error('❌ FamiliesService.searchFamilies HTTP error status:', response.status);
        console.error('❌ FamiliesService.searchFamilies HTTP error statusText:', response.statusText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Family[]> = await response.json();
      console.log('📥 FamiliesService.searchFamilies raw response:', JSON.stringify(data, null, 2));
      
      // Check if there's an error in the response
      if (data.error) {
        console.error('❌ FamiliesService.searchFamilies API error:', data.error);
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      // Check if data exists
      if (!data.data) {
        console.error('❌ FamiliesService.searchFamilies no data in response');
        throw new Error('No data returned from API');
      }

      console.log('✅ FamiliesService.searchFamilies returning', Array.isArray(data.data) ? data.data.length : 1, 'families');
      return Array.isArray(data.data) ? data.data : [data.data];
    } catch (error) {
      console.error('❌ FamiliesService.searchFamilies error details:');
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Full error object:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      throw new Error(`Failed to search families: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create family (auth required)
   * POST /api/families
   */
  static async createFamily(familyData: CreateFamilyRequest, authToken: string): Promise<Family> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.FAMILIES.BASE);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(familyData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Family> = await response.json();
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      if (!data.data) {
        throw new Error('No data returned from API');
      }

      return data.data;
    } catch (error) {
      console.error('FamiliesService.createFamily error:', error);
      throw new Error(`Failed to create family: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update family (auth required)
   * PUT /api/families/{id}
   */
  static async updateFamily(familyId: string, familyData: UpdateFamilyRequest, authToken: string): Promise<Family> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.FAMILIES.BASE}/${familyId}`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(familyData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Family> = await response.json();
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      if (!data.data) {
        throw new Error('No data returned from API');
      }

      return data.data;
    } catch (error) {
      console.error('FamiliesService.updateFamily error:', error);
      throw new Error(`Failed to update family: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete family (auth required)
   * DELETE /api/families/{id}
   */
  static async deleteFamily(familyId: string, authToken: string): Promise<void> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.FAMILIES.BASE}/${familyId}`);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
    } catch (error) {
      console.error('FamiliesService.deleteFamily error:', error);
      throw new Error(`Failed to delete family: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get family by ID
   */
  static async getFamilyById(familyId: string, authToken?: string): Promise<Family | null> {
    try {
      const families = await this.searchFamilies({ id: familyId }, authToken);
      return families.length > 0 ? families[0] : null;
    } catch (error) {
      console.error('FamiliesService.getFamilyById error:', error);
      throw error;
    }
  }

  /**
   * Get families by name
   */
  static async getFamiliesByName(name: string, authToken?: string): Promise<Family[]> {
    try {
      return await this.searchFamilies({ name }, authToken);
    } catch (error) {
      console.error('FamiliesService.getFamiliesByName error:', error);
      throw error;
    }
  }
}

