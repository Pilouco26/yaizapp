export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  currency: string;
}

export interface JSONBillData {
  id?: number;
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

// Generic API response wrapper used across services
export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string | Record<string, unknown>;
  success?: boolean;
  message?: string;
};

// Auth-specific response payloads
export interface LoginAuthInfo {
  user?: any;
}

export interface LoginResponseData {
  token?: string;
  auth?: LoginAuthInfo;
  success?: boolean;
}