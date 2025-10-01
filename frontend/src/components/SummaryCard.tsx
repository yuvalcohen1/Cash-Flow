import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  trend,
  color,
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {trend !== undefined && (
          <div
            className={`flex items-center mt-2 text-sm ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div
        className={`p-3 rounded-lg ${
          color === "text-green-600"
            ? "bg-green-100"
            : color === "text-red-600"
            ? "bg-red-100"
            : "bg-blue-100"
        }`}
      >
        {icon}
      </div>
    </div>
  </div>
);
