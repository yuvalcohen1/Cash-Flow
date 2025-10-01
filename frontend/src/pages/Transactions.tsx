import {
  Edit3,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { TransactionForm } from "../components/TransactionForm";
import { CATEGORIES, getCategoryById } from "../constants/categories";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { Transaction } from "../types";

export const Transactions: React.FC = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null
  );
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    search: "",
    page: 1,
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.getTransactions(token, {
        ...filters,
        limit: 20,
      });

      // Add category names to transactions
      const transactionsWithCategories =
        response.transactions?.map((t: Transaction) => ({
          ...t,
          category_name: getCategoryById(t.category_id || 0)?.name || null,
        })) || [];

      setTransactions(transactionsWithCategories);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData: any) => {
    if (!token) return;
    try {
      await api.createTransaction(token, transactionData);
      setShowForm(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  const handleEditTransaction = async (transactionData: any) => {
    if (!token || !editTransaction) return;
    try {
      await api.updateTransaction(token, editTransaction.id, transactionData);
      setEditTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!token || !confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      await api.deleteTransaction(token, id);
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search transactions..."
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions found
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                      transaction.type === "income"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <TrendingUp size={20} />
                    ) : (
                      <TrendingDown size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {transaction.description || "No description"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {transaction.category_name || "No category"} •{" "}
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`font-bold text-lg ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {transaction.amount.toFixed(2)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setShowForm(false)}
          categories={CATEGORIES}
        />
      )}

      {editTransaction && (
        <TransactionForm
          onSubmit={handleEditTransaction}
          onCancel={() => setEditTransaction(null)}
          categories={CATEGORIES}
          editTransaction={editTransaction}
        />
      )}
    </div>
  );
};
