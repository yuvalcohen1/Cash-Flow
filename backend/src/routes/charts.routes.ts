import { Response, Router } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../interfaces/AuthRequest.interface";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  validatePeriodQuery,
  validateTrendsQuery,
} from "../middlewares/validation.middleware";
import {
  getCategoryBreakdownData,
  getDateRange,
  getSummaryData,
  getTrendsData,
} from "../models/charts.model";

const router = Router();

// GET /api/charts/summary - Basic totals and summary stats
router.get(
  "/summary",
  authenticateToken,
  validatePeriodQuery,
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const userId = req.user!.id;
      const period = (req.query.period as string) || "current_month";

      let startDate: string, endDate: string, label: string;

      if (req.query.startDate && req.query.endDate) {
        startDate = req.query.startDate as string;
        endDate = req.query.endDate as string;
        label = "Custom Period";
      } else {
        const dateRange = getDateRange(period);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
        label = dateRange.label;
      }

      const summary = getSummaryData(userId, startDate, endDate);
      summary.period = label;

      res.json(summary);
    } catch (error) {
      console.error("Get summary error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/charts/trends - Income vs expenses trends over time
router.get(
  "/trends",
  authenticateToken,
  validateTrendsQuery,
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const userId = req.user!.id;
      const period = (req.query.period as string) || "monthly";
      const months = parseInt(req.query.months as string) || 6;
      const year = req.query.year
        ? parseInt(req.query.year as string)
        : undefined;

      const trends = getTrendsData(userId, period, months, year);

      res.json(trends);
    } catch (error) {
      console.error("Get trends error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/charts/category-breakdown - Spending breakdown by categories
router.get(
  "/category-breakdown",
  authenticateToken,
  validatePeriodQuery,
  (req: AuthRequest, res: Response): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const userId = req.user!.id;
      const period = (req.query.period as string) || "current_month";

      let startDate: string, endDate: string, label: string;

      if (req.query.startDate && req.query.endDate) {
        startDate = req.query.startDate as string;
        endDate = req.query.endDate as string;
        label = "Custom Period";
      } else {
        const dateRange = getDateRange(period);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
        label = dateRange.label;
      }

      const breakdown = getCategoryBreakdownData(userId, startDate, endDate);
      breakdown.period = label;

      res.json(breakdown);
    } catch (error) {
      console.error("Get category breakdown error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
