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

export interface CategoryBreakdown {
  income: Array<{ category: string; amount: number; percentage: number }>;
  expenses: Array<{ category: string; amount: number; percentage: number }>;
  period: string;
}
