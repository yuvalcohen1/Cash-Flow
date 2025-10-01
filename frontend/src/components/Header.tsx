import React, { useState } from "react";
import { DollarSign, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">CashFlow</h1>
            </div>

            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === "dashboard"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView("transactions")}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === "transactions"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Transactions
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <span className="hidden md:block font-medium">
                  {user?.name}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    {user?.email}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center ${
              currentView === "dashboard"
                ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView("transactions")}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center ${
              currentView === "transactions"
                ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Transactions
          </button>
        </nav>
      </div>
    </header>
  );
};
