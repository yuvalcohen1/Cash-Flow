import { Category } from "../interfaces/Category.interface";

// Static Categories List
export const CATEGORIES: Category[] = [
  // Income Categories
  { id: 1, name: "Salary", type: "income" },
  { id: 2, name: "Freelance", type: "income" },
  { id: 3, name: "Investment", type: "income" },
  { id: 4, name: "Bonus", type: "income" },
  { id: 5, name: "Rental Income", type: "income" },
  { id: 6, name: "Business Income", type: "income" },
  { id: 7, name: "Other Income", type: "income" },

  // Expense Categories
  { id: 8, name: "Food & Dining", type: "expense" },
  { id: 9, name: "Transportation", type: "expense" },
  { id: 10, name: "Shopping", type: "expense" },
  { id: 11, name: "Entertainment", type: "expense" },
  { id: 12, name: "Bills & Utilities", type: "expense" },
  { id: 13, name: "Healthcare", type: "expense" },
  { id: 14, name: "Education", type: "expense" },
  { id: 15, name: "Travel", type: "expense" },
  { id: 16, name: "Insurance", type: "expense" },
  { id: 17, name: "Home & Garden", type: "expense" },
  { id: 18, name: "Gifts & Donations", type: "expense" },
  { id: 19, name: "Personal Care", type: "expense" },
  { id: 20, name: "Subscriptions", type: "expense" },
  { id: 21, name: "Other Expense", type: "expense" },
];

export const getCategoriesByType = (
  type?: "income" | "expense"
): Category[] => {
  if (!type) return CATEGORIES;
  return CATEGORIES.filter((category) => category.type === type);
};

export const getCategoryById = (id: number): Category | undefined => {
  return CATEGORIES.find((category) => category.id === id);
};

export const isValidCategoryId = (id: number): boolean => {
  return CATEGORIES.some((category) => category.id === id);
};
