import db from "../database";
import { Transaction } from "../interfaces/Transaction.interface";
import { TransactionFilters } from "../interfaces/TransactionFilters.interface";
import { CATEGORIES } from "./category.model";

export const getTransactionById = (
  id: number,
  userId: number
): Transaction | undefined => {
  const stmt = db.prepare(`
    SELECT * FROM transactions
    WHERE id = ? AND user_id = ?
  `);

  const transaction = stmt.get(id, userId) as Transaction | undefined;

  if (transaction && transaction.category_id) {
    // Assuming you have a categories array accessible here
    const category = CATEGORIES.find((c) => c.id === transaction.category_id);
    if (category) {
      transaction.category_name = category.name;
      transaction.category_type = category.type;
    }
  }

  return transaction;
};

export const getTransactions = (
  userId: number,
  filters: TransactionFilters
) => {
  let query = `
    SELECT t.*
    FROM transactions t
    WHERE t.user_id = ?
  `;

  const params: any[] = [userId];

  // Add filters
  if (filters.type) {
    query += ` AND t.type = ?`;
    params.push(filters.type);
  }

  if (filters.category) {
    query += ` AND t.category_id = ?`;
    params.push(filters.category);
  }

  if (filters.search) {
    query += ` AND description LIKE ?`;
    params.push(`%${filters.search}%`);
  }

  if (filters.startDate) {
    query += ` AND t.date >= ?`;
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ` AND t.date <= ?`;
    params.push(filters.endDate);
  }

  // Add sorting
  query += ` ORDER BY t.${filters.sortBy} ${filters.order.toUpperCase()}`;

  // Add pagination
  const offset = (filters.page - 1) * filters.limit;
  query += ` LIMIT ? OFFSET ?`;
  params.push(filters.limit, offset);

  const stmt = db.prepare(query);
  const transactions = stmt.all(...params) as Transaction[];

  // Enrich transactions with category data from in-memory array
  return transactions.map((transaction) => {
    if (transaction.category_id) {
      const category = CATEGORIES.find((c) => c.id === transaction.category_id);
      if (category) {
        return {
          ...transaction,
          category_name: category.name,
          category_type: category.type,
        };
      }
    }
    return transaction;
  });
};

export const getTransactionsCount = (
  userId: number,
  filters: Omit<TransactionFilters, "page" | "limit" | "sortBy" | "order">
) => {
  let query = `SELECT COUNT(*) as count FROM transactions t WHERE t.user_id = ?`;
  const params: any[] = [userId];

  if (filters.type) {
    query += ` AND t.type = ?`;
    params.push(filters.type);
  }

  if (filters.category) {
    query += ` AND t.category_id = ?`;
    params.push(filters.category);
  }

  if (filters.search) {
    query += ` AND t.description LIKE ?`;
    params.push(`%${filters.search}%`);
  }

  if (filters.startDate) {
    query += ` AND t.date >= ?`;
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ` AND t.date <= ?`;
    params.push(filters.endDate);
  }

  const stmt = db.prepare(query);
  return (stmt.get(...params) as { count: number }).count;
};

export const createTransaction = (
  userId: number,
  data: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
) => {
  const stmt = db.prepare(`
    INSERT INTO transactions (user_id, type, amount, category_id, description, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    userId,
    data.type,
    data.amount,
    data.category_id,
    data.description,
    data.date
  );
  return getTransactionById(result.lastInsertRowid as number, userId);
};

export const updateTransaction = (
  id: number,
  userId: number,
  data: Partial<
    Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
  >
) => {
  const fields = Object.keys(data).filter(
    (key) => data[key as keyof typeof data] !== undefined
  );
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  if (fields.length === 0) return null;

  const query = `
    UPDATE transactions 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND user_id = ?
  `;

  const values = fields.map((field) => data[field as keyof typeof data]);
  values.push(id, userId);

  const stmt = db.prepare(query);
  const result = stmt.run(...values);

  return result.changes > 0 ? getTransactionById(id, userId) : null;
};

export const deleteTransaction = (id: number, userId: number): boolean => {
  const stmt = db.prepare(
    "DELETE FROM transactions WHERE id = ? AND user_id = ?"
  );
  const result = stmt.run(id, userId);
  return result.changes > 0;
};
