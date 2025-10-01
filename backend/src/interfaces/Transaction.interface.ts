export interface Transaction {
  id: number;
  user_id: number;
  type: "income" | "expense";
  amount: number;
  category_id: number | null;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_type?: string;
}
