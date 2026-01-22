export type TransactionType = 'income' | 'expense';

export type Frequency = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string; // Icon name from Lucide
  type: TransactionType;
  budgetLimit?: number; // Monthly limit
}

export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO date string
  categoryId: string;
  description: string;
  type: TransactionType;
  frequency: Frequency;
  isRecurring: boolean;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface KPI {
  label: string;
  value: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export type Theme = 'light' | 'dark';

export interface User {
  uid?: string;
  name: string;
  email: string;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  theme: Theme;
  sidebarOpen: boolean;

  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;

  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
}