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

      // Some endpoints might return either an ApiResponse<User[]> or an ApiResponse<User> (single object)
      // and occasionally omit the `success` flag. We normalise the payload so the rest of the method
      // can always work with a `User[]`.

      const raw: Partial<ApiResponse<User | User[]>> = await response.json();

      // Default `success` to true when the field is missing (many read-only endpoints omit it)
      const success = typeof raw.success === 'boolean' ? raw.success : true;

      // Ensure data is always an array for downstream code
      let usersData: User[] | undefined;

      if (raw.data !== undefined) {
        // Standard YaizApp format: { data: User | User[] }
        usersData = Array.isArray(raw.data) ? raw.data : [raw.data];
      } else if (raw && Object.keys(raw).length > 0) {
        // Fallback: API returned the User object/array directly without wrappers
        if (Array.isArray(raw)) {
          usersData = raw as unknown as User[];
        } else {
          usersData = [raw as unknown as User];
        }
      }

      const data: ApiResponse<User[]> = {
        success,
        data: usersData,
        message: raw.message,
        error: raw.error,
      };
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to search users');
      }

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

      const data: ApiResponse<User> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to update user');
      }

      return data.data;
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
      const users = await this.searchUsers({ id: userId }, authToken);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
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

