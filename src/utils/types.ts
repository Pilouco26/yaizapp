export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  category: string;
  currency: string;
}

export interface JSONBillData {
  id: number;
  date: string;
  description: string;
  value: number;
}

export interface APIResponse {
  success: boolean;
  data?: Bill[];
  error?: string;
}

export interface MockoonConfig {
  baseUrl: string;
  endpoints: {
    bills: string;
    uploadBills: string;
  };
} 