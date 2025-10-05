import { Response, Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  validateId,
  validateQuery,
  validateTransaction,
  validateTransactionUpdate,
} from "../middlewares/validation.middleware";
import { AuthRequest } from "../interfaces/AuthRequest.interface";
import { validationResult } from "express-validator";
import { TransactionFilters } from "../interfaces/TransactionFilters.interface";
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactions,
  getTransactionsCount,
  updateTransaction,
} from "../models/transaction.model";
import { isValidCategoryId } from "../models/category.model";

const router = Router();

// GET /api/transactions - Get all user transactions with filtering, pagination, and sorting
router.get(
  "/",
  authenticateToken,
  validateQuery,
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const filters: TransactionFilters = {
        type: req.query.type as "income" | "expense" | undefined,
        category: req.query.category as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        search: req.query.search as string | undefined,
        page: Math.max(1, parseInt(req.query.page as string) || 1),
        limit: Math.min(
          100,
          Math.max(1, parseInt(req.query.limit as string) || 10)
        ),
        sortBy: (req.query.sortBy as string) || "date",
        order: (req.query.order as "asc" | "desc") || "desc",
      };

      const userId = req.user!.id;
      const transactions = getTransactions(userId, filters);
      const total = getTransactionsCount(userId, filters);
      const totalPages = Math.ceil(total / filters.limit);

      res.json({
        transactions,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages,
          hasNext: filters.page < totalPages,
          hasPrev: filters.page > 1,
        },
      });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/transactions - Create a new transaction
router.post(
  "/",
  authenticateToken,
  validateTransaction,
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const { type, amount, category_id, description, date } = req.body;
      const userId = req.user!.id;

      // Verify category belongs to user or is null
      if (category_id) {
        // Verify category is valid
        if (!isValidCategoryId(category_id)) {
          res.status(400).json({ error: "Invalid category" });
          return;
        }
      }

      const transaction = createTransaction(userId, {
        type,
        amount,
        category_id: category_id || null,
        description: description || null,
        date: new Date(date).toISOString().split("T")[0],
      });

      res.status(201).json({
        message: "Transaction created successfully",
        transaction,
      });
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/transactions/:id - Get specific transaction by ID
router.get(
  "/:id",
  authenticateToken,
  validateId,
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const transactionId = parseInt(req.params.id);
      const userId = req.user!.id;

      const transaction = getTransactionById(transactionId, userId);
      if (!transaction) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      res.json({ transaction });
    } catch (error) {
      console.error("Get transaction error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/transactions/:id - Update existing transaction
router.put(
  "/:id",
  authenticateToken,
  validateId,
  validateTransactionUpdate,
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const transactionId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if transaction exists and belongs to user
      const existingTransaction = getTransactionById(transactionId, userId);
      if (!existingTransaction) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      // Verify category if provided
      if (req.body.category_id) {
        // Verify category is valid
        if (!isValidCategoryId(req.body.category_id)) {
          res.status(400).json({ error: "Invalid category" });
          return;
        }
      }

      const updateData: any = {};
      if (req.body.type) updateData.type = req.body.type;
      if (req.body.amount) updateData.amount = req.body.amount;
      if (req.body.category_id !== undefined)
        updateData.category_id = req.body.category_id;
      if (req.body.description !== undefined)
        updateData.description = req.body.description;
      if (req.body.date)
        updateData.date = new Date(req.body.date).toISOString().split("T")[0];

      const transaction = updateTransaction(transactionId, userId, updateData);
      if (!transaction) {
        res.status(400).json({ error: "Failed to update transaction" });
        return;
      }

      res.json({
        message: "Transaction updated successfully",
        transaction,
      });
    } catch (error) {
      console.error("Update transaction error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/transactions/:id - Delete transaction
router.delete(
  "/:id",
  authenticateToken,
  validateId,
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const transactionId = parseInt(req.params.id);
      const userId = req.user!.id;

      const success = deleteTransaction(transactionId, userId);
      if (!success) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
