import express, { Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../interfaces/AuthRequest.interface";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validateCategoryQuery } from "../middlewares/validation.middleware";
import {
  getCategoriesByType,
  getCategoryById,
  isValidCategoryId,
} from "../models/category.model";

const router = express.Router();

// GET /api/categories - Get all categories or filtered by type
router.get(
  "/",
  authenticateToken,
  validateCategoryQuery,
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const type = req.query.type as "income" | "expense" | undefined;
      const categories = getCategoriesByType(type);

      // Group categories by type for easier frontend consumption
      if (!type) {
        const grouped = {
          income: categories.filter((cat) => cat.type === "income"),
          expense: categories.filter((cat) => cat.type === "expense"),
        };

        res.json({
          categories: grouped,
          total: categories.length,
        });
      } else {
        res.json({
          categories,
          total: categories.length,
        });
      }
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/categories/:id - Get specific category by ID
router.get(
  "/:id",
  authenticateToken,
  (req: AuthRequest, res: Response): void => {
    try {
      const categoryId = parseInt(req.params.id);

      if (isNaN(categoryId)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }

      const category = getCategoryById(categoryId);
      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      res.json({ category });
    } catch (error) {
      console.error("Get category error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Utility function to export for use in other modules
export const validateCategoryId = (id: number): boolean => {
  return isValidCategoryId(id);
};

export const getCategoryName = (id: number): string | undefined => {
  const category = getCategoryById(id);
  return category?.name;
};

export default router;
