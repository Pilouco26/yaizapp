export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // ISO string e.g., "2025-08-01"
  status?: 'paid' | 'unpaid' | 'overdue';
}
