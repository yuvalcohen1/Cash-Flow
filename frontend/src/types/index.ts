export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: number;
  category_id: number | null;
  category_name?: string;
  description: string | null;
  date: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
}

export interface TransactionFilters {
  type?: "income" | "expense";
  category?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  sortBy: string;
  order: "asc" | "desc";
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  period: string;
  transactionCount: number;
}

export interface TrendData {
  labels: string[];
  income: number[];
  expenses: number[];
  period: string;
}

export interface CategoryBreakdownData {
  name?: string; // For frontend display
  value?: number; // For frontend display
  color?: string; // For frontend display
  category?: string; // From backend
  amount?: number; // From backend
  percentage?: number; // From backend
  [key: string]: string | number | undefined;
}

export interface CategoryBreakdown {
  income: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  expenses: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  period: string;
}
