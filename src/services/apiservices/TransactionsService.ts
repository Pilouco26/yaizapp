import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest, TransactionSearchParams, ApiResponse } from '../types';

/**
 * Transactions Service
 * Handles transaction management API calls
 */
export class TransactionsService {
  /**
   * Get all transactions (auth required)
   * GET /api/transactions
   */
  static async getAllTransactions(authToken: string): Promise<Transaction[]> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.TRANSACTIONS.BASE);
      
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

      const data: ApiResponse<Transaction[]> = await response.json();
      
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
      throw new Error(`Failed to get transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search transactions
   * GET /api/transactions/searchBy?userId=*id*&monthId=*id*&type=*EXPENSE|INCOME*&minAmount=*n*&maxAmount=*n*&startDate=*yyyy-MM-dd*&endDate=*yyyy-MM-dd*
   */
  static async searchTransactions(params: TransactionSearchParams, authToken: string): Promise<Transaction[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.userId) {
        searchParams.append('userId', params.userId);
      }
      if (params.monthId) {
        searchParams.append('monthId', params.monthId);
      }
      if (params.type) {
        searchParams.append('type', params.type);
      }
      if (params.minAmount !== undefined) {
        searchParams.append('minAmount', params.minAmount.toString());
      }
      if (params.maxAmount !== undefined) {
        searchParams.append('maxAmount', params.maxAmount.toString());
      }
      if (params.startDate) {
        searchParams.append('startDate', params.startDate);
      }
      if (params.endDate) {
        searchParams.append('endDate', params.endDate);
      }

      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.TRANSACTIONS.SEARCH}?${searchParams.toString()}`);
      
      
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

      const data: ApiResponse<Transaction[]> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to search transactions');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to search transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create transaction (auth required)
   * POST /api/transactions
   */
  static async createTransaction(transactionData: CreateTransactionRequest, authToken: string): Promise<Transaction> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.TRANSACTIONS.BASE);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Transaction> = await response.json();
      
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
      throw new Error(`Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update transaction (auth required)
   * PUT /api/transactions/{id}
   */
  static async updateTransaction(transactionId: string, transactionData: UpdateTransactionRequest, authToken: string): Promise<Transaction> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.TRANSACTIONS.BASE}/${transactionId}`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Transaction> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to update transaction');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to update transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete transaction (auth required)
   * DELETE /api/transactions/{id}
   */
  static async deleteTransaction(transactionId: string, authToken: string): Promise<void> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.TRANSACTIONS.BASE}/${transactionId}`);
      
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
      throw new Error(`Failed to delete transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transactions by user ID
   */
  static async getTransactionsByUserId(userId: string, authToken: string): Promise<Transaction[]> {
    try {
      return await this.searchTransactions({ userId }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transactions by month ID
   */
  static async getTransactionsByMonthId(monthId: string, authToken: string): Promise<Transaction[]> {
    try {
      return await this.searchTransactions({ monthId }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transactions by type (EXPENSE or INCOME)
   */
  static async getTransactionsByType(type: 'EXPENSE' | 'INCOME', authToken: string, userId?: string): Promise<Transaction[]> {
    try {
      return await this.searchTransactions({ userId, type }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transactions within amount range
   */
  static async getTransactionsByAmountRange(minAmount: number, maxAmount: number, authToken: string, userId?: string): Promise<Transaction[]> {
    try {
      return await this.searchTransactions({ userId, minAmount, maxAmount }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transactions within date range
   */
  static async getTransactionsByDateRange(startDate: string, endDate: string, authToken: string, userId?: string): Promise<Transaction[]> {
    try {
      return await this.searchTransactions({ userId, startDate, endDate }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get expenses for a user
   */
  static async getExpenses(userId: string, authToken: string, monthId?: string): Promise<Transaction[]> {
    try {
      return await this.searchTransactions({ userId, monthId, type: 'EXPENSE' }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get income for a user
   */
  static async getIncome(userId: string, authToken: string, monthId?: string): Promise<Transaction[]> {
    try {
      return await this.searchTransactions({ userId, monthId, type: 'INCOME' }, authToken);
    } catch (error) {
      throw error;
    }
  }
}

