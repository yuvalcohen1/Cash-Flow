import db from "../database";
import {
  CategoryBreakdown,
  SummaryData,
  TrendData,
} from "../interfaces/charts.interface";
import { getCategoryById } from "./category.model";

const getMonthName = (monthIndex: number): string => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[monthIndex];
};

export const getDateRange = (
  period: string
): { startDate: string; endDate: string; label: string } => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  switch (period) {
    case "current_month":
      return {
        startDate: new Date(currentYear, currentMonth, 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date(currentYear, currentMonth + 1, 0)
          .toISOString()
          .split("T")[0],
        label: "This Month",
      };
    case "last_month":
      return {
        startDate: new Date(currentYear, currentMonth - 1, 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date(currentYear, currentMonth, 0)
          .toISOString()
          .split("T")[0],
        label: "Last Month",
      };
    case "last_3_months":
      return {
        startDate: new Date(currentYear, currentMonth - 2, 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date(currentYear, currentMonth + 1, 0)
          .toISOString()
          .split("T")[0],
        label: "Last 3 Months",
      };
    case "last_6_months":
      return {
        startDate: new Date(currentYear, currentMonth - 5, 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date(currentYear, currentMonth + 1, 0)
          .toISOString()
          .split("T")[0],
        label: "Last 6 Months",
      };
    case "current_year":
      return {
        startDate: new Date(currentYear, 0, 1).toISOString().split("T")[0],
        endDate: new Date(currentYear, 11, 31).toISOString().split("T")[0],
        label: "This Year",
      };
    case "last_year":
      return {
        startDate: new Date(currentYear - 1, 0, 1).toISOString().split("T")[0],
        endDate: new Date(currentYear - 1, 11, 31).toISOString().split("T")[0],
        label: "Last Year",
      };
    default:
      return {
        startDate: new Date(currentYear, currentMonth, 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date(currentYear, currentMonth + 1, 0)
          .toISOString()
          .split("T")[0],
        label: "This Month",
      };
  }
};

export const getSummaryData = (
  userId: number,
  startDate: string,
  endDate: string
): SummaryData => {
  const stmt = db.prepare(`
    SELECT 
      type,
      COALESCE(SUM(amount), 0) as total,
      COUNT(*) as count
    FROM transactions 
    WHERE user_id = ? AND date >= ? AND date <= ?
    GROUP BY type
  `);

  const results = stmt.all(userId, startDate, endDate) as Array<{
    type: string;
    total: number;
    count: number;
  }>;

  const income = results.find((r) => r.type === "income")?.total || 0;
  const expenses = results.find((r) => r.type === "expense")?.total || 0;
  const transactionCount = results.reduce((sum, r) => sum + r.count, 0);

  return {
    totalIncome: income,
    totalExpenses: expenses,
    balance: income - expenses,
    period: `${startDate} to ${endDate}`,
    transactionCount,
  };
};

export const getTrendsData = (
  userId: number,
  period: string,
  months: number,
  year?: number
): TrendData => {
  const currentDate = new Date();
  const targetYear = year || currentDate.getFullYear();

  if (period === "monthly") {
    // Get monthly data for the specified number of months
    const endMonth = year ? 11 : currentDate.getMonth(); // If specific year, go to December; otherwise current month
    const startMonth = Math.max(0, endMonth - months + 1);

    const stmt = db.prepare(`
      SELECT 
        strftime('%m', date) as month,
        type,
        COALESCE(SUM(amount), 0) as total
      FROM transactions 
      WHERE user_id = ? AND strftime('%Y', date) = ? AND CAST(strftime('%m', date) AS INTEGER) BETWEEN ? AND ?
      GROUP BY strftime('%m', date), type
      ORDER BY month
    `);

    const results = stmt.all(
      userId,
      targetYear.toString(),
      startMonth + 1,
      endMonth + 1
    ) as Array<{
      month: string;
      type: string;
      total: number;
    }>;

    const labels: string[] = [];
    const income: number[] = [];
    const expenses: number[] = [];

    for (let i = startMonth; i <= endMonth; i++) {
      const monthStr = (i + 1).toString().padStart(2, "0");
      labels.push(getMonthName(i));

      const monthIncome =
        results.find((r) => r.month === monthStr && r.type === "income")
          ?.total || 0;
      const monthExpenses =
        results.find((r) => r.month === monthStr && r.type === "expense")
          ?.total || 0;

      income.push(monthIncome);
      expenses.push(monthExpenses);
    }

    return {
      labels,
      income,
      expenses,
      period: `Monthly trends for ${targetYear}`,
    };
  }

  // Default to current month daily breakdown if period is not monthly
  const startDate = new Date(targetYear, currentDate.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endDate = new Date(targetYear, currentDate.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const stmt = db.prepare(`
    SELECT 
      date,
      type,
      COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE user_id = ? AND date >= ? AND date <= ?
    GROUP BY date, type
    ORDER BY date
  `);

  const results = stmt.all(userId, startDate, endDate) as Array<{
    date: string;
    type: string;
    total: number;
  }>;

  // Create daily breakdown for current month
  const labels: string[] = [];
  const income: number[] = [];
  const expenses: number[] = [];
  const daysInMonth = new Date(
    targetYear,
    currentDate.getMonth() + 1,
    0
  ).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = new Date(targetYear, currentDate.getMonth(), day)
      .toISOString()
      .split("T")[0];
    labels.push(day.toString());

    const dayIncome =
      results.find((r) => r.date === dateStr && r.type === "income")?.total ||
      0;
    const dayExpenses =
      results.find((r) => r.date === dateStr && r.type === "expense")?.total ||
      0;

    income.push(dayIncome);
    expenses.push(dayExpenses);
  }

  return {
    labels,
    income,
    expenses,
    period: `Daily breakdown for ${getMonthName(
      currentDate.getMonth()
    )} ${targetYear}`,
  };
};

export const getCategoryBreakdownData = (
  userId: number,
  startDate: string,
  endDate: string
): CategoryBreakdown => {
  const stmt = db.prepare(`
    SELECT 
      type,
      category_id,
      COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE user_id = ? AND date >= ? AND date <= ? AND category_id IS NOT NULL
    GROUP BY type, category_id
    ORDER BY total DESC
  `);

  const results = stmt.all(userId, startDate, endDate) as Array<{
    type: string;
    category_id: number;
    total: number;
  }>;

  const incomeData = results.filter((r) => r.type === "income");
  const expenseData = results.filter((r) => r.type === "expense");

  const totalIncome = incomeData.reduce((sum, item) => sum + item.total, 0);
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.total, 0);

  const income = incomeData.map((item) => ({
    category: getCategoryById(item.category_id)?.name || "Unknown",
    amount: item.total,
    percentage:
      totalIncome > 0 ? Math.round((item.total / totalIncome) * 100) : 0,
  }));

  const expenses = expenseData.map((item) => ({
    category: getCategoryById(item.category_id)?.name || "Unknown",
    amount: item.total,
    percentage:
      totalExpenses > 0 ? Math.round((item.total / totalExpenses) * 100) : 0,
  }));

  return {
    income,
    expenses,
    period: `${startDate} to ${endDate}`,
  };
};
