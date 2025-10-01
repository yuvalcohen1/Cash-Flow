import { body, param, query } from "express-validator";

// Auth Validation
export const validateRegister = [
  body("name").trim().isLength({ min: 2, max: 50 }).escape(),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
];

export const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

// Transactions Validation
export const validateTransaction = [
  body("type").isIn(["income", "expense"]),
  body("amount").isFloat({ gt: 0 }).toFloat(),
  body("category_id").optional().isInt({ gt: 0 }).toInt(),
  body("description").optional().trim().isLength({ max: 255 }),
  body("date").isISO8601().toDate(),
];

export const validateTransactionUpdate = [
  body("type").optional().isIn(["income", "expense"]),
  body("amount").optional().isFloat({ gt: 0 }).toFloat(),
  body("category_id").optional().isInt({ gt: 0 }).toInt(),
  body("description").optional().trim().isLength({ max: 255 }),
  body("date").optional().isISO8601().toDate(),
];

export const validateQuery = [
  query("page").optional({ values: "falsy" }).isInt({ min: 1 }).toInt(),
  query("limit")
    .optional({ values: "falsy" })
    .isInt({ min: 1, max: 100 })
    .toInt(),
  query("type").optional({ values: "falsy" }).isIn(["income", "expense"]),
  query("category").optional({ values: "falsy" }).isInt({ gt: 0 }).toInt(),
  query("startDate").optional({ values: "falsy" }).isISO8601(),
  query("endDate").optional({ values: "falsy" }).isISO8601(),
  query("sortBy")
    .optional({ values: "falsy" })
    .isIn(["date", "amount", "created_at"]),
  query("order").optional({ values: "falsy" }).isIn(["asc", "desc"]),
];

export const validateId = [param("id").isInt({ gt: 0 }).toInt()];

// Category Validation
export const validateCategoryQuery = [
  query("type").optional().isIn(["income", "expense"]),
];

// Charts Validation
export const validatePeriodQuery = [
  query("period")
    .optional()
    .isIn([
      "current_month",
      "last_month",
      "last_3_months",
      "last_6_months",
      "current_year",
      "last_year",
    ]),
  query("startDate").optional().isISO8601(),
  query("endDate").optional().isISO8601(),
];

export const validateTrendsQuery = [
  query("period").optional().isIn(["monthly", "weekly", "daily"]),
  query("months").optional().isInt({ min: 1, max: 24 }).toInt(),
  query("year").optional().isInt({ min: 2020, max: 2030 }).toInt(),
];
