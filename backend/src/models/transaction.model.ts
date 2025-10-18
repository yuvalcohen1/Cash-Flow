import { query } from "../database";
import { Transaction } from "../interfaces/Transaction.interface";
import { TransactionFilters } from "../interfaces/TransactionFilters.interface";
import { CATEGORIES } from "./category.model";

// Helper function to format dates
const formatDate = (date: any): string => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTransactionById = async (
  id: number,
  userId: string // UUID
): Promise<Transaction | null> => {
  const result = await query(
    `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  const transaction = result.rows[0] as Transaction | undefined;

  if (!transaction) {
    return null;
  }

  // Format date to yyyy-MM-dd
  if (transaction.date) {
    transaction.date = formatDate(transaction.date);
  }

  if (transaction && transaction.category_id) {
    const category = CATEGORIES.find((c) => c.id === transaction.category_id);
    if (category) {
      transaction.category_name = category.name;
      transaction.category_type = category.type;
    }
  }

  return transaction;
};

export const getTransactions = async (
  userId: string, // UUID
  filters: TransactionFilters
): Promise<Transaction[]> => {
  let sql = `
    SELECT t.*
    FROM transactions t
    WHERE t.user_id = $1
  `;

  const params: any[] = [userId];
  let paramCount = 2;

  // Add filters
  if (filters.type) {
    sql += ` AND t.type = $${paramCount}`;
    params.push(filters.type);
    paramCount++;
  }

  if (filters.category) {
    sql += ` AND t.category_id = $${paramCount}`;
    params.push(parseInt(filters.category));
    paramCount++;
  }

  if (filters.search) {
    sql += ` AND t.description ILIKE $${paramCount}`; // ILIKE for case-insensitive
    params.push(`%${filters.search}%`);
    paramCount++;
  }

  if (filters.startDate) {
    sql += ` AND t.date >= $${paramCount}`;
    params.push(filters.startDate);
    paramCount++;
  }

  if (filters.endDate) {
    sql += ` AND t.date <= $${paramCount}`;
    params.push(filters.endDate);
    paramCount++;
  }

  // Add sorting (validate sortBy to prevent SQL injection)
  const validSortColumns = ["date", "amount", "created_at", "type"];
  const sortBy = validSortColumns.includes(filters.sortBy)
    ? filters.sortBy
    : "date";
  const order = filters.order.toUpperCase() === "ASC" ? "ASC" : "DESC";
  sql += ` ORDER BY t.${sortBy} ${order}`;

  // Add pagination
  const offset = (filters.page - 1) * filters.limit;
  sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(filters.limit, offset);

  const result = await query(sql, params);
  const transactions = result.rows as Transaction[];

  // Enrich transactions with category data from in-memory array
  return transactions.map((transaction) => {
    // Format date to yyyy-MM-dd
    if (transaction.date) {
      transaction.date = formatDate(transaction.date);
    }

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

export const getTransactionsCount = async (
  userId: string, // UUID
  filters: Omit<TransactionFilters, "page" | "limit" | "sortBy" | "order">
): Promise<number> => {
  let sql = `SELECT COUNT(*) FROM transactions t WHERE t.user_id = $1`;
  const params: any[] = [userId];
  let paramCount = 2;

  if (filters.type) {
    sql += ` AND t.type = $${paramCount}`;
    params.push(filters.type);
    paramCount++;
  }

  if (filters.category) {
    sql += ` AND t.category_id = $${paramCount}`;
    params.push(parseInt(filters.category));
    paramCount++;
  }

  if (filters.search) {
    sql += ` AND t.description ILIKE $${paramCount}`;
    params.push(`%${filters.search}%`);
    paramCount++;
  }

  if (filters.startDate) {
    sql += ` AND t.date >= $${paramCount}`;
    params.push(filters.startDate);
    paramCount++;
  }

  if (filters.endDate) {
    sql += ` AND t.date <= $${paramCount}`;
    params.push(filters.endDate);
    paramCount++;
  }

  const result = await query(sql, params);
  return parseInt(result.rows[0].count);
};

export const createTransaction = async (
  userId: string, // UUID
  data: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Transaction | null> => {
  const result = await query(
    `INSERT INTO transactions (user_id, type, amount, category_id, description, date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      data.type,
      data.amount,
      data.category_id,
      data.description,
      data.date,
    ]
  );

  const transaction = result.rows[0] as Transaction;

  return transaction;
};

export const updateTransaction = async (
  id: number,
  userId: string, // UUID
  data: Partial<
    Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
  >
): Promise<Transaction | null> => {
  const fields = Object.keys(data).filter(
    (key) => data[key as keyof typeof data] !== undefined
  );

  if (fields.length === 0) {
    return getTransactionById(id, userId);
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");
  const values = fields.map((field) => data[field as keyof typeof data]);

  // Add id and userId for WHERE clause
  values.push(id, userId);

  const sql = `
    UPDATE transactions 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $${values.length - 1} AND user_id = $${values.length}
    RETURNING *
  `;

  const result = await query(sql, values);

  if (result.rows.length === 0) {
    return null;
  }

  const transaction = result.rows[0] as Transaction;

  return transaction;
};

export const deleteTransaction = async (
  id: number,
  userId: string // UUID
): Promise<boolean> => {
  const result = await query(
    `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  return result.rowCount! > 0;
};
