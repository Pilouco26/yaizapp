import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { User, CreateUserRequest, UpdateUserRequest, UserSearchParams, ApiResponse } from '../types';

/**
 * Users Service
 * Handles user management API calls
 */
export class UsersService {
  /**
   * Get all users (requires auth)
   * GET /api/users
   */
  static async getAllUsers(authToken?: string): Promise<User[]> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.USERS.BASE);
      
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

      const raw: Partial<ApiResponse<User | User[]>> = await response.json();

      const success = typeof raw.success === 'boolean' ? raw.success : true;

      let usersData: User[] | undefined;
      if (raw.data !== undefined) {
        usersData = Array.isArray(raw.data) ? raw.data : [raw.data];
      }

      const data: ApiResponse<User[]> = {
        success,
        data: usersData,
        message: raw.message,
        error: raw.error,
      };

      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to get users');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search users by ID, username, or email
   * GET /api/users/searchBy?id=*id*&username=*string*&email=*string*
   */
  static async searchUsers(params: UserSearchParams, authToken?: string): Promise<User[]> {
    try {
      console.log('🔍 UsersService.searchUsers called with params:', params);
      
      const searchParams = new URLSearchParams();
      
      if (params.id) {
        searchParams.append('id', params.id);
      }
      if (params.username) {
        searchParams.append('username', params.username);
      }
      if (params.email) {
        searchParams.append('email', params.email);
      }

      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.USERS.SEARCH}?${searchParams.toString()}`);
      console.log('🌐 UsersService.searchUsers API URL:', apiUrl);
      
      const headers = getDefaultHeaders();

      if (authToken) {
        // Override with Bearer token if provided
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      console.log('📤 UsersService.searchUsers request headers:', headers);
      console.log('📤 UsersService.searchUsers making GET request...');

      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'GET',
          headers,
        });
      } catch (fetchError) {
        console.error('❌ UsersService.searchUsers fetch error:', fetchError);
        throw fetchError;
      }

      console.log('📥 UsersService.searchUsers response status:', response.status);
      console.log('📥 UsersService.searchUsers response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ UsersService.searchUsers HTTP error response body:', errorText);
        console.error('❌ UsersService.searchUsers HTTP error status:', response.status);
        console.error('❌ UsersService.searchUsers HTTP error statusText:', response.statusText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      // Some endpoints might return either an ApiResponse<User[]> or an ApiResponse<User> (single object)
      // and occasionally omit the `success` flag. We normalise the payload so the rest of the method
      // can always work with a `User[]`.

      const raw: Partial<ApiResponse<User | User[]>> = await response.json();
      console.log('📥 UsersService.searchUsers raw response:', JSON.stringify(raw, null, 2));

      // Default `success` to true when the field is missing (many read-only endpoints omit it)
      const success = typeof raw.success === 'boolean' ? raw.success : true;

      // Ensure data is always an array for downstream code
      let usersData: User[] | undefined;

      if (raw.data !== undefined) {
        // Standard YaizApp format: { data: User | User[] }
        usersData = Array.isArray(raw.data) ? raw.data : [raw.data];
        console.log('📊 UsersService.searchUsers processed data (standard format):', usersData.length, 'users');
      } else if (raw && Object.keys(raw).length > 0) {
        // Fallback: API returned the User object/array directly without wrappers
        if (Array.isArray(raw)) {
          usersData = raw as unknown as User[];
        } else {
          usersData = [raw as unknown as User];
        }
        console.log('📊 UsersService.searchUsers processed data (fallback format):', usersData.length, 'users');
      }

      const data: ApiResponse<User[]> = {
        success,
        data: usersData,
        message: raw.message,
        error: raw.error,
      };
      
      console.log('📊 UsersService.searchUsers final processed data:', JSON.stringify(data, null, 2));
      
      if (!data.success || !data.data) {
        console.error('❌ UsersService.searchUsers data validation failed:', { success: data.success, hasData: !!data.data, message: data.message });
        throw new Error(data.message || 'Failed to search users');
      }

      console.log('✅ UsersService.searchUsers returning', data.data.length, 'users');
      return data.data;
    } catch (error) {
      throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create new user
   * POST /api/users
   */
  static async createUser(userData: CreateUserRequest, authToken?: string): Promise<User> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.USERS.BASE);
      
      const headers = getDefaultHeaders();

      if (authToken) {
        // Override with Bearer token if provided
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<User> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to create user');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update existing user
   * PUT /api/users/{id}
   */
  static async updateUser(userId: string, userData: UpdateUserRequest, authToken?: string): Promise<User> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}`);
      
      const headers = getDefaultHeaders();

      if (authToken) {
        // Override with Bearer token if provided
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: any = await response.json();
      
      // Use response status to determine success instead of checking for success field
      if (response.status >= 200 && response.status < 300) {
        // Return the data directly since the API returns the user object directly
        return data.data || data;
      } else {
        throw new Error(data.message || 'Failed to update user');
      }
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete user
   * DELETE /api/users/{id}
   */
  static async deleteUser(userId: string, authToken?: string): Promise<void> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}`);
      
      const headers = getDefaultHeaders();

      if (authToken) {
        // Override with Bearer token if provided
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string, authToken?: string): Promise<User | null> {
    try {
      console.log(`🔍 UsersService.getUserById called with userId: ${userId}`);
      const users = await this.searchUsers({ id: userId }, authToken);
      console.log(`📊 UsersService.getUserById returned ${users.length} users`);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error(`❌ UsersService.getUserById error for userId ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string, authToken?: string): Promise<User | null> {
    try {
      const users = await this.searchUsers({ email }, authToken);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      throw error;
    }
  }
}

