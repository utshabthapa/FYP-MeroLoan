"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useUserDashboardStore } from "../store/userDashboardStore";
import { formatDate } from "../utils/date";
import Navbar from "@/components/Navbar";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  PieChart,
  BarChart,
} from "lucide-react";

// Chart components
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const StatCard = ({ title, value, change, icon, color, delay }) => {
  const isPositive = parseFloat(change) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <p
            className={`text-sm ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {change}% from last month
          </p>
        </div>
      )}
    </motion.div>
  );
};

const LoanActivityChart = ({ data }) => {
  // Format data for the chart - now using the simplified format
  const chartData = [
    {
      name: "Borrowed",
      value: data?.[0]?.borrowed || 0,
      fill: "#8884d8",
    },
    {
      name: "Lent",
      value: data?.[0]?.lent || 0,
      fill: "#82ca9d",
    },
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 12, fill: "#4B5563" }} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12, fill: "#4B5563" }} // Darker gray and smaller text
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Amount">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const LoanStatusChart = ({ data }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Format data for the chart
  const chartData =
    data?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} loans`, "Count"]} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

const MonthlyComparisonChart = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="thisYear" name="This Year" fill="#8884d8" />
          <Bar dataKey="lastYear" name="Last Year" fill="#82ca9d" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TransactionItem = ({ transaction }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "approved":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
      case "rejected":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "approved":
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case "pending":
        return <Clock className="w-4 h-4 mr-1" />;
      case "failed":
      case "rejected":
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
      <div className="flex items-center">
        <div
          className={`p-2 rounded-full mr-3 ${
            transaction.type === "lent" ? "bg-blue-100" : "bg-purple-100"
          }`}
        >
          {transaction.type === "lent" ? (
            <ArrowUp className="w-4 h-4 text-blue-500" />
          ) : (
            <ArrowDown className="w-4 h-4 text-purple-500" />
          )}
        </div>
        <div>
          <p className="font-medium text-sm">{transaction.description}</p>
          <p className="text-xs text-gray-500">
            {formatDate(transaction.date)}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-medium">${transaction.amount.toFixed(2)}</p>
        <div
          className={`flex items-center text-xs ${getStatusColor(
            transaction.status
          )}`}
        >
          {getStatusIcon(transaction.status)}
          {transaction.status}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const {
    dashboardStats,
    loanActivity,
    loanStatusDistribution,
    recentTransactions,
    monthlyComparison,
    isLoading,
    error,
    fetchDashboardStats,
  } = useUserDashboardStore();

  useEffect(() => {
    if (user?._id) {
      fetchDashboardStats(user._id);
    }
  }, [fetchDashboardStats, user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-28 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-28 px-4">
          <div className="bg-red-50 p-4 rounded-lg text-red-500 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>Error loading dashboard data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-24 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Welcome back, {user?.name}</p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="Loan Borrowed"
              value={`$${
                dashboardStats?.loanBorrowed
                  ? dashboardStats.loanBorrowed.toFixed(2)
                  : "0.00"
              }`}
              change={dashboardStats?.monthlyGrowth?.borrowed || 0}
              icon={<ArrowDown className="w-5 h-5 text-purple-500" />}
              color="bg-purple-100"
              delay={0.1}
            />

            <StatCard
              title="Loan Lended"
              value={`$${
                dashboardStats?.loanLended
                  ? dashboardStats.loanLended.toFixed(2)
                  : "0.00"
              }`}
              change={dashboardStats?.monthlyGrowth?.lended || 0}
              icon={<ArrowUp className="w-5 h-5 text-blue-500" />}
              color="bg-blue-100"
              delay={0.15}
            />

            <StatCard
              title="Interest Earnings"
              value={`$${
                dashboardStats?.interestEarnings
                  ? dashboardStats.interestEarnings.toFixed(2)
                  : "0.00"
              }`}
              change={dashboardStats?.monthlyGrowth?.earnings || 0}
              icon={<DollarSign className="w-5 h-5 text-green-500" />}
              color="bg-green-100"
              delay={0.2}
            />

            <StatCard
              title="Loan Due"
              value={`$${
                dashboardStats?.loanDue
                  ? dashboardStats.loanDue.toFixed(2)
                  : "0.00"
              }`}
              icon={<Clock className="w-5 h-5 text-amber-500" />}
              color="bg-amber-100"
              delay={0.25}
            />

            <StatCard
              title="Active Loans"
              value={dashboardStats?.activeLoans ?? 0}
              icon={<Activity className="w-5 h-5 text-indigo-500" />}
              color="bg-indigo-100"
              delay={0.3}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              className="bg-white p-4 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center mb-4">
                <BarChart className="w-5 h-5 text-gray-700 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Loan Activity
                </h3>
              </div>
              <LoanActivityChart data={loanActivity} />
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center mb-4">
                <PieChart className="w-5 h-5 text-gray-700 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Loan Status Distribution
                </h3>
              </div>
              <LoanStatusChart data={loanStatusDistribution} />
            </motion.div>
          </div>

          {/* Monthly Comparison and Profile Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <motion.div
              className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="flex items-center mb-4">
                <Activity className="w-5 h-5 text-gray-700 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Monthly Comparison (This Year vs Last Year)
                </h3>
              </div>
              <MonthlyComparisonChart data={monthlyComparison} />
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-gray-700 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Profile Information
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Activity className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Account Status</p>
                    <p className="font-medium text-green-500">Active</p>
                  </div>
                </div>

                <button
                  className="w-full py-2 mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  onClick={() => {
                    /* Navigate to profile page */
                  }}
                >
                  View Full Profile
                </button>
              </div>
            </motion.div>
          </div>

          {/* Recent Transactions */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-700 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Transactions
                </h3>
              </div>
              <button
                className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                onClick={() => {
                  /* Navigate to transactions page */
                }}
              >
                View All
              </button>
            </div>

            <div className="space-y-1">
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions
                  .slice(0, 5)
                  .map((transaction, index) => (
                    <TransactionItem key={index} transaction={transaction} />
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent transactions found
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
