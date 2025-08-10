import { Bill, JSONBillData, APIResponse, MockoonConfig } from './types';

// Mockoon configuration - you can change this URL to match your Mockoon setup
const MOCKOON_CONFIG: MockoonConfig = {
  baseUrl: 'http://localhost:3000', // Default Mockoon port
  endpoints: {
    bills: '/api/bills',
    uploadBills: '/api/bills/upload',
  },
};

class ApiService {
  private config: MockoonConfig;

  constructor(config: MockoonConfig = MOCKOON_CONFIG) {
    this.config = config;
  }

  // Fetch bills from Mockoon API
  async fetchBills(): Promise<Bill[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.bills}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: APIResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch bills');
      }
      
      return (result.data || []).map(bill => ({
        ...bill,
        currency: bill.currency ?? 'EUR',
      }));
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  }

  // Upload JSON bill data to Mockoon API
  async uploadBills(jsonData: JSONBillData[]): Promise<Bill[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.uploadBills}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bills: jsonData }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: APIResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload bills');
      }
      
      return (result.data || []).map(bill => ({
        ...bill,
        currency: bill.currency ?? 'EUR',
      }));
    } catch (error) {
      console.error('Error uploading bills:', error);
      throw error;
    }
  }

  // Transform JSON data to Bill format
  transformJSONToBills(jsonData: JSONBillData[]): Bill[] {
    return jsonData.map((item, index) => ({
      id: `bill-${Date.now()}-${index}`,
      name: item.description,
      amount: Math.abs(item.value), // Ensure positive amount
      dueDate: item.date,
      isPaid: item.value < 0, // Negative values indicate paid bills
      category: this.categorizeBill(item.description),
      currency: 'EUR',
    }));
  }

  // Categorize bills based on description
  private categorizeBill(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('electric') || desc.includes('gas') || desc.includes('water') || desc.includes('utility')) {
      return 'Utilities';
    }
    if (desc.includes('internet') || desc.includes('phone') || desc.includes('mobile') || desc.includes('communication')) {
      return 'Communication';
    }
    if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('housing')) {
      return 'Housing';
    }
    if (desc.includes('insurance') || desc.includes('health')) {
      return 'Insurance';
    }
    if (desc.includes('parking') || desc.includes('transport')) {
      return 'Transportation';
    }
    if (desc.includes('food') || desc.includes('grocery') || desc.includes('restaurant')) {
      return 'Food';
    }
    
    return 'Other';
  }

  // Update Mockoon configuration
  updateConfig(newConfig: Partial<MockoonConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): MockoonConfig {
    return this.config;
  }
}

export default new ApiService(); 