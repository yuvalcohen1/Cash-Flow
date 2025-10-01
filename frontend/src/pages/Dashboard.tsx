import { Calendar, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../services/api";
import { SummaryCard } from "../components/SummaryCard";
import { useAuth } from "../contexts/AuthContext";
import type { CategoryBreakdownData, SummaryData, TrendData } from "../types";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
];

export const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [trendsData, setTrendsData] = useState<TrendData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdownData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);

      // Fetch summary data
      const summary = await api.getSummary(token, "current_month");
      setSummaryData({
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        balance: summary.balance,
        transactionCount: summary.transactionCount,
        period: summary.period,
      });

      // Fetch trends data
      const trends = await api.getTrends(token, "monthly", 6);

      // Transform backend data to match chart format
      const transformedTrends = trends.labels.map(
        (label: string, index: number) => ({
          month: label,
          income: trends.income[index],
          expenses: trends.expenses[index],
        })
      );
      setTrendsData(transformedTrends);

      // Fetch category breakdown
      const breakdown = await api.getCategoryBreakdown(token, "current_month");

      // Transform expense categories for pie chart
      const transformedCategories = breakdown.expenses.map(
        (
          item: { category: string; amount: number; percentage: number },
          index: number
        ) => ({
          name: item.category,
          value: item.amount,
          color: COLORS[index % COLORS.length],
        })
      );
      setCategoryData(transformedCategories);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Optionally show error message to user
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-96 rounded-xl"></div>
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Income"
            value={`$${summaryData?.totalIncome?.toLocaleString() || "0"}`}
            icon={<TrendingUp className="text-green-600" size={24} />}
            color="text-green-600"
          />
          <SummaryCard
            title="Total Expenses"
            value={`$${summaryData?.totalExpenses?.toLocaleString() || "0"}`}
            icon={<TrendingDown className="text-red-600" size={24} />}
            color="text-red-600"
          />
          <SummaryCard
            title="Balance"
            value={`$${summaryData?.balance}`}
            icon={<DollarSign className="text-blue-600" size={24} />}
            color={
              summaryData?.balance !== undefined && summaryData.balance >= 0
                ? "text-green-600"
                : "text-red-600"
            }
          />
          <SummaryCard
            title="Transactions"
            value={summaryData?.transactionCount?.toString() || "0"}
            icon={<Calendar className="text-purple-600" size={24} />}
            color="text-purple-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income vs Expenses Trend */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Income vs Expenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any) => [`$${value}`, ""]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Income"
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={3}
                  name="Expenses"
                  dot={{ fill: "#EF4444", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Expense Categories
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData as any}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent as any) * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${value}`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Overview Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any) => [`$${value}`, ""]}
              />
              <Legend />
              <Bar
                dataKey="income"
                fill="#10B981"
                name="Income"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="#EF4444"
                name="Expenses"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
