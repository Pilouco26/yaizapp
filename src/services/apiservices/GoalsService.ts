import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { Goal, CreateGoalRequest, UpdateGoalRequest, GoalSearchParams, ApiResponse } from '../types';

/**
 * Goals Service
 * Handles goal management API calls
 */
export class GoalsService {
  /**
   * Get all goals (auth required)
   * GET /api/goals
   */
  static async getAllGoals(authToken: string): Promise<Goal[]> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.GOALS.BASE);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Goal[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      if (!data.data) {
        throw new Error('No data returned from API');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to get goals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search goals
   * GET /api/goals/searchBy?userId=*id*&minAmount=*n*&maxAmount=*n*&active=*bool*
   */
  static async searchGoals(params: GoalSearchParams, authToken: string): Promise<Goal[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.userId) {
        searchParams.append('userId', params.userId);
      }
      if (params.minAmount !== undefined) {
        searchParams.append('minAmount', params.minAmount.toString());
      }
      if (params.maxAmount !== undefined) {
        searchParams.append('maxAmount', params.maxAmount.toString());
      }
      if (params.active !== undefined) {
        searchParams.append('active', params.active.toString());
      }

      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.GOALS.SEARCH}?${searchParams.toString()}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Goal[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      if (!data.data) {
        throw new Error('No data returned from API');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to search goals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create goal (auth required)
   * POST /api/goals
   */
  static async createGoal(goalData: CreateGoalRequest, authToken: string): Promise<Goal> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.GOALS.BASE);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Goal> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      if (!data.data) {
        throw new Error('No data returned from API');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to create goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update goal (auth required)
   * PUT /api/goals/{id}
   */
  static async updateGoal(goalId: string, goalData: UpdateGoalRequest, authToken: string): Promise<Goal> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.GOALS.BASE}/${goalId}`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Goal> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      if (!data.data) {
        throw new Error('No data returned from API');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to update goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete goal (auth required)
   * DELETE /api/goals/{id}
   */
  static async deleteGoal(goalId: string, authToken: string): Promise<void> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.GOALS.BASE}/${goalId}`);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
    } catch (error) {
      throw new Error(`Failed to delete goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get goals by user ID
   */
  static async getGoalsByUserId(userId: string, authToken: string): Promise<Goal[]> {
    try {
      return await this.searchGoals({ userId }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active goals by user ID
   */
  static async getActiveGoalsByUserId(userId: string, authToken: string): Promise<Goal[]> {
    try {
      return await this.searchGoals({ userId, active: true }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get goals within amount range
   */
  static async getGoalsByAmountRange(minAmount: number, maxAmount: number, authToken: string, userId?: string): Promise<Goal[]> {
    try {
      return await this.searchGoals({ userId, minAmount, maxAmount }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update goal progress
   */
  static async updateGoalProgress(goalId: string, currentAmount: number, authToken: string): Promise<Goal> {
    try {
      return await this.updateGoal(goalId, { currentAmount }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark goal as completed
   */
  static async completeGoal(goalId: string, authToken: string): Promise<Goal> {
    try {
      return await this.updateGoal(goalId, { isActive: false }, authToken);
    } catch (error) {
      throw error;
    }
  }
}

