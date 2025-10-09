import React, { useState } from "react";
import { FileText, Sparkles, Calendar, TrendingUp, Award } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import ReactMarkdown from "react-markdown";

export const Reports: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const generateReport = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await api.generateAIReport(
        token,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      );
      setReportData(response);
    } catch (error: any) {
      console.error("Error generating report:", error);
      alert(error.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const clearDateRange = () => {
    setDateRange({ startDate: "", endDate: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            AI Financial Report
          </h2>
          <p className="text-gray-600 mt-1">
            Get personalized insights powered by AI
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-900">Select Date Range</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Report
                </>
              )}
            </button>

            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={clearDateRange}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {!dateRange.startDate && !dateRange.endDate && (
          <p className="text-sm text-gray-500 mt-3">
            Leave dates empty to analyze all your transactions
          </p>
        )}
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-800">
                  Savings Rate
                </h3>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-green-900">
                {reportData.processed_insights?.summary?.savings_rate?.toFixed(
                  1
                )}
                %
              </p>
              <p className="text-xs text-green-700 mt-1">
                $
                {reportData.processed_insights?.summary?.net_savings?.toLocaleString()}{" "}
                saved
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-800">
                  Total Transactions
                </h3>
                <FileText className="text-blue-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {reportData.metadata?.num_transactions}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {reportData.processed_insights?.time_period?.num_days} days
                analyzed
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-800">
                  Milestones
                </h3>
                <Award className="text-purple-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {reportData.processed_insights?.milestones?.length || 0}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Achievements unlocked
              </p>
            </div>
          </div>

          {/* AI Report */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center gap-3 text-white">
                <Sparkles size={24} />
                <div>
                  <h3 className="text-xl font-bold">
                    Your Personalized Financial Report
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Generated on{" "}
                    {new Date(
                      reportData.metadata?.generated_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  components={{
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-2 mb-4">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {reportData.ai_report}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Insights Summary */}
          {reportData.processed_insights?.behavioral_insights?.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <Sparkles className="text-amber-600" size={20} />
                Key Behavioral Insights
              </h3>
              <ul className="space-y-2">
                {reportData.processed_insights.behavioral_insights.map(
                  (insight: string, index: number) => (
                    <li
                      key={index}
                      className="text-amber-800 flex items-start gap-2"
                    >
                      <span className="text-amber-600 mt-1">→</span>
                      {insight}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-blue-600" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Get Insights?
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Click "Generate Report" to get a personalized AI-powered analysis of
            your financial data with actionable recommendations.
          </p>
        </div>
      )}
    </div>
  );
};
