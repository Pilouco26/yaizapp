// API Response Types for YaizApp Backend

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Authentication Types
export interface DevTokenRequest {
  userId?: string;
  email?: string;
}

export interface DevTokenResponse {
  token: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Health Types
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    api: 'up' | 'down';
  };
}

export interface HealthSearchParams {
  type?: 'ping' | 'detailed';
  format?: 'json';
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  name: string;
  password?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  name?: string;
  isActive?: boolean;
  bankId?: string;
}

export interface UserSearchParams {
  id?: string;
  username?: string;
  email?: string;
}

// Family Types
export interface Family {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: string[]; // User IDs
}

export interface CreateFamilyRequest {
  name: string;
  description?: string;
  memberIds?: string[];
}

export interface UpdateFamilyRequest {
  name?: string;
  description?: string;
  memberIds?: string[];
}

export interface FamilySearchParams {
  id?: string;
  name?: string;
}

// Month Types
export interface Month {
  id: string;
  userId: string;
  year: number;
  month: number; // 1-12
  monthlyExpenses: number; // This is the actual field from API
  totalIncome?: number; // Calculated from transactions
  totalExpenses?: number; // Alias for monthlyExpenses
  balance?: number; // Calculated field
  goalId?: string | null;
  goalAmount?: number | null;
  goalDescription?: string | null;
  lastUpdate: string;
  isActive: boolean;
  transactions?: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonthRequest {
  userId: string;
  year: number;
  month: number;
  totalIncome?: number;
  totalExpenses?: number;
}

export interface UpdateMonthRequest {
  totalIncome?: number;
  totalExpenses?: number;
}

export interface MonthSearchParams {
  userId?: string;
  year?: number;
  month?: number;
  expensesAbove?: number;
}

// Goal Types
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  isActive?: boolean;
}

export interface GoalSearchParams {
  userId?: string;
  minAmount?: number;
  maxAmount?: number;
  active?: boolean;
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  monthId?: string;
  type: 'EXPENSE' | 'INCOME';
  amount: number;
  description: string;
  category?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  userId: string;
  monthId?: string;
  type: 'EXPENSE' | 'INCOME';
  amount: number;
  description: string;
  category?: string;
  date: string;
}

export interface UpdateTransactionRequest {
  type?: 'EXPENSE' | 'INCOME';
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  monthId?: string;
}

export interface TransactionSearchParams {
  userId?: string;
  monthId?: string;
  type?: 'EXPENSE' | 'INCOME';
  minAmount?: number;
  maxAmount?: number;
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'SYSTEM' | 'BUDGET_ALERT';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  type: 'SYSTEM' | 'BUDGET_ALERT';
  title: string;
  message: string;
}

export interface UpdateNotificationRequest {
  title?: string;
  message?: string;
  isRead?: boolean;
}

export interface NotificationSearchParams {
  userId?: string;
  type?: 'SYSTEM' | 'BUDGET_ALERT';
  read?: boolean;
}

