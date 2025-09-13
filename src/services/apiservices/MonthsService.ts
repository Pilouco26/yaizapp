import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { Month, CreateMonthRequest, UpdateMonthRequest, MonthSearchParams, ApiResponse } from '../types';

/**
 * Months Service
 * Handles month management API calls
 */
export class MonthsService {
  /**
   * Get all months (auth required)
   * GET /api/months
   */
  static async getAllMonths(authToken: string): Promise<Month[]> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.MONTHS.BASE);
      
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

      const data: ApiResponse<Month[]> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to get months');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to get months: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search months
   * GET /api/months/searchBy?userId=*id*&year=*YYYY*&month=*MM*&expensesAbove=*amt*
   */
  static async searchMonths(params: MonthSearchParams, authToken: string): Promise<Month[]> {
    try {
      
      const searchParams = new URLSearchParams();
      
      if (params.userId) {
        searchParams.append('userId', params.userId);
      }
      if (params.year) {
        searchParams.append('year', params.year.toString());
      }
      if (params.month) {
        searchParams.append('month', params.month.toString());
      }
      if (params.expensesAbove) {
        searchParams.append('expensesAbove', params.expensesAbove.toString());
      }

      const searchQuery = searchParams.toString();
      
      const endpoint = `${API_CONFIG.ENDPOINTS.MONTHS.SEARCH}?${searchQuery}`;
      
      const apiUrl = getFullApiUrlWithAuth(endpoint);
      
      const headers = getDefaultHeaders({
        'Authorization': `Bearer ${authToken}`,
      });
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const responseText = await response.text();
      
      let data: ApiResponse<Month[]>;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Failed to parse response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
      }
      
      // Check if we have data array directly (API might return data directly without success wrapper)
      if (Array.isArray(data)) {
        return data;
      }
      
      // Check if API returns data without success wrapper (just {data: [...]})
      if (data.data && Array.isArray(data.data) && data.success === undefined) {
        return data.data;
      }
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to search months');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to search months: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create month (auth required)
   * POST /api/months
   */
  static async createMonth(monthData: CreateMonthRequest, authToken: string): Promise<Month> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.MONTHS.BASE);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
        body: JSON.stringify(monthData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Month> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to create month');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to create month: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update month (auth required)
   * PUT /api/months/{id}
   */
  static async updateMonth(monthId: string, monthData: UpdateMonthRequest, authToken: string): Promise<Month> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.MONTHS.BASE}/${monthId}`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
        body: JSON.stringify(monthData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Month> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to update month');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to update month: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete month (auth required)
   * DELETE /api/months/{id}
   */
  static async deleteMonth(monthId: string, authToken: string): Promise<void> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.MONTHS.BASE}/${monthId}`);
      
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
        throw new Error(data.message || 'Failed to delete month');
      }
    } catch (error) {
      throw new Error(`Failed to delete month: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get months by user ID
   */
  static async getMonthsByUserId(userId: string, authToken: string): Promise<Month[]> {
    try {
      return await this.searchMonths({ userId }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get month by user ID, year, and month
   */
  static async getMonthByUserAndDate(userId: string, year: number, month: number, authToken: string): Promise<Month | null> {
    try {
      const months = await this.searchMonths({ userId, year, month }, authToken);
      return months.length > 0 ? months[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get months with expenses above a certain amount
   */
  static async getMonthsWithExpensesAbove(amount: number, authToken: string, userId?: string): Promise<Month[]> {
    try {
      return await this.searchMonths({ userId, expensesAbove: amount }, authToken);
    } catch (error) {
      throw error;
    }
  }
}

