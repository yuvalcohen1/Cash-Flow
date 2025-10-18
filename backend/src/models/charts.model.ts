import { query } from "../database";
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

export const getSummaryData = async (
  userId: string, // UUID
  startDate: string,
  endDate: string
): Promise<SummaryData> => {
  const result = await query(
    `SELECT 
      type,
      COALESCE(SUM(amount), 0) as total,
      COUNT(*) as count
    FROM transactions 
    WHERE user_id = $1 AND date >= $2 AND date <= $3
    GROUP BY type`,
    [userId, startDate, endDate]
  );

  const results = result.rows as Array<{
    type: string;
    total: string; // PostgreSQL returns numeric as string
    count: string;
  }>;

  const income = parseFloat(
    results.find((r) => r.type === "income")?.total || "0"
  );
  const expenses = parseFloat(
    results.find((r) => r.type === "expense")?.total || "0"
  );
  const transactionCount = results.reduce(
    (sum, r) => sum + parseInt(r.count),
    0
  );

  return {
    totalIncome: income,
    totalExpenses: expenses,
    balance: income - expenses,
    period: `${startDate} to ${endDate}`,
    transactionCount,
  };
};

export const getTrendsData = async (
  userId: string, // UUID
  period: string,
  months: number,
  year?: number
): Promise<TrendData> => {
  const currentDate = new Date();
  const targetYear = year || currentDate.getFullYear();

  if (period === "monthly") {
    // Get monthly data for the specified number of months
    const endMonth = year ? 11 : currentDate.getMonth();
    const startMonth = Math.max(0, endMonth - months + 1);

    const result = await query(
      `SELECT 
        EXTRACT(MONTH FROM date)::integer as month,
        type,
        COALESCE(SUM(amount), 0) as total
      FROM transactions 
      WHERE user_id = $1 
        AND EXTRACT(YEAR FROM date) = $2 
        AND EXTRACT(MONTH FROM date) BETWEEN $3 AND $4
      GROUP BY EXTRACT(MONTH FROM date), type
      ORDER BY month`,
      [userId, targetYear, startMonth + 1, endMonth + 1]
    );

    const results = result.rows as Array<{
      month: number;
      type: string;
      total: string;
    }>;

    const labels: string[] = [];
    const income: number[] = [];
    const expenses: number[] = [];

    for (let i = startMonth; i <= endMonth; i++) {
      const monthNum = i + 1;
      labels.push(getMonthName(i));

      const monthIncome = parseFloat(
        results.find((r) => r.month === monthNum && r.type === "income")
          ?.total || "0"
      );
      const monthExpenses = parseFloat(
        results.find((r) => r.month === monthNum && r.type === "expense")
          ?.total || "0"
      );

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

  // Default to current month daily breakdown
  const startDate = new Date(targetYear, currentDate.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endDate = new Date(targetYear, currentDate.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const result = await query(
    `SELECT 
      date,
      type,
      COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE user_id = $1 AND date >= $2 AND date <= $3
    GROUP BY date, type
    ORDER BY date`,
    [userId, startDate, endDate]
  );

  const results = result.rows as Array<{
    date: string;
    type: string;
    total: string;
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

    const dayIncome = parseFloat(
      results.find((r) => r.date === dateStr && r.type === "income")?.total ||
        "0"
    );
    const dayExpenses = parseFloat(
      results.find((r) => r.date === dateStr && r.type === "expense")?.total ||
        "0"
    );

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

export const getCategoryBreakdownData = async (
  userId: string, // UUID
  startDate: string,
  endDate: string
): Promise<CategoryBreakdown> => {
  const result = await query(
    `SELECT 
      type,
      category_id,
      COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE user_id = $1 AND date >= $2 AND date <= $3 AND category_id IS NOT NULL
    GROUP BY type, category_id
    ORDER BY total DESC`,
    [userId, startDate, endDate]
  );

  const results = result.rows as Array<{
    type: string;
    category_id: number;
    total: string;
  }>;

  const incomeData = results.filter((r) => r.type === "income");
  const expenseData = results.filter((r) => r.type === "expense");

  const totalIncome = incomeData.reduce(
    (sum, item) => sum + parseFloat(item.total),
    0
  );
  const totalExpenses = expenseData.reduce(
    (sum, item) => sum + parseFloat(item.total),
    0
  );

  const income = incomeData.map((item) => {
    const amount = parseFloat(item.total);
    return {
      category: getCategoryById(item.category_id)?.name || "Unknown",
      amount,
      percentage:
        totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
    };
  });

  const expenses = expenseData.map((item) => {
    const amount = parseFloat(item.total);
    return {
      category: getCategoryById(item.category_id)?.name || "Unknown",
      amount,
      percentage:
        totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    };
  });

  return {
    income,
    expenses,
    period: `${startDate} to ${endDate}`,
  };
};
