"use client";

import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  PieChart,
  BarChart,
  RefreshCw,
  ChevronRight,
  Wallet,
  FileText,
  Eye,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";

// Chart components
import {
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
  Sector,
} from "recharts";

// Custom tooltip component for better styling
const CustomTooltip = ({
  active,
  payload,
  label,
  valuePrefix = "",
  valueSuffix = "",
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
        <p className="text-gray-600 font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            style={{ color: entry.color }}
            className="text-sm font-semibold"
          >
            {entry.name}: {valuePrefix}
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
            {valueSuffix}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom active shape for pie charts
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        className="text-sm font-medium"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        className="text-xs"
      >
        {`${value.toLocaleString()}`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
        className="text-xs"
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const StatCard = ({ title, value, icon, color, gradient, delay, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${gradient} p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer`}
      onClick={onClick}
      // whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-white/80 shadow-sm`}>{icon}</div>
      </div>
    </motion.div>
  );
};

const LoanActivityChart = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No loan activity data available
      </div>
    );
  }

  // Format data for the chart - now using the simplified format
  const chartData = [
    {
      name: "Borrowed",
      value: data?.[0]?.borrowed || 0,
      fill: "#4f46e5",
    },
    {
      name: "Lent",
      value: data?.[0]?.lent || 0,
      fill: "#10b981",
    },
  ];

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorBorrowed" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="colorLent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12, fill: "#4B5563" }} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12, fill: "#4B5563" }}
            width={100}
          />
          <Tooltip content={<CustomTooltip valuePrefix="$" />} />
          <Legend
            formatter={(value) => (
              <span className="text-sm font-medium">{value}</span>
            )}
          />
          <Bar
            dataKey="value"
            name="Amount"
            radius={[0, 4, 4, 0]}
            barSize={30}
            animationDuration={1500}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#color${entry.name})`} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const LoanStatusChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data || !data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No loan status data available
      </div>
    );
  }

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

  // Format data for the chart
  const chartData =
    data?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} loans`, "Count"]} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value, entry, index) => (
              <span
                className="text-sm font-medium"
                style={{ color: COLORS[index % COLORS.length] }}
              >
                {value}
              </span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

const TransactionItem = ({ transaction, onClick }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "approved":
        return "text-emerald-500";
      case "pending":
        return "text-amber-500";
      case "failed":
      case "rejected":
        return "text-rose-500";
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
    <motion.div
      className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors cursor-pointer"
      whileHover={{ backgroundColor: "#f9fafb" }}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div
          className={`p-2 rounded-full mr-3 ${
            transaction.type === "lent" ? "bg-indigo-100" : "bg-emerald-100"
          }`}
        >
          {transaction.type === "lent" ? (
            <ArrowUp className="w-4 h-4 text-indigo-500" />
          ) : (
            <ArrowDown className="w-4 h-4 text-emerald-500" />
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
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    dashboardStats,
    loanActivity,
    loanStatusDistribution,
    recentTransactions,
    isLoading,
    error,
    fetchDashboardStats,
  } = useUserDashboardStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardStats(user._id);
    }
  }, [fetchDashboardStats, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?._id) {
        await fetchDashboardStats(user._id);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 800); // Add a slight delay for better UX
    }
  };

  // Navigation functions
  const navigateToProfile = () => navigate("/userProfile");
  const navigateToTransactions = () => navigate("/transactionHistory");
  const navigateToLoans = () => navigate("/active-contracts");
  const navigateToSettings = () => navigate("/userProfile");
  const navigateToTransactionDetails = (id) => navigate(`/transactionHistory`);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-28 px-4">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-gray-500">Loading your dashboard...</p>
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
          <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 text-rose-600 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-rose-500" />
            <p className="text-lg font-medium mb-2">
              Unable to load dashboard data
            </p>
            <p className="mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors duration-200 inline-flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-24 px- pb-12">
        <AnimatePresence>
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
              <div className="flex items-center space-x-4">
                <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
                  <Calendar className="w-5 h-5 text-indigo-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-3 bg-white rounded-lg shadow-sm text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard
                title="Loan Borrowed"
                value={`$${
                  dashboardStats?.loanBorrowed
                    ? dashboardStats.loanBorrowed.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"
                }`}
                icon={<ArrowDown className="w-5 h-5 text-purple-500" />}
                gradient="from-white to-white"
                delay={0.1}
                onClick={() => navigateToLoans()}
              />

              <StatCard
                title="Loan Lended"
                value={`$${
                  dashboardStats?.loanLended
                    ? dashboardStats.loanLended.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"
                }`}
                icon={<ArrowUp className="w-5 h-5 text-indigo-500" />}
                gradient="from-white to-white"
                delay={0.15}
                onClick={() => navigateToLoans()}
              />

              <StatCard
                title="Interest Earnings"
                value={`$${
                  dashboardStats?.interestEarnings
                    ? dashboardStats.interestEarnings.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )
                    : "0.00"
                }`}
                icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
                gradient="from-white to-white"
                delay={0.2}
                onClick={() => navigateToTransactions()}
              />

              <StatCard
                title="Loan Due"
                value={`$${
                  dashboardStats?.loanDue
                    ? dashboardStats.loanDue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"
                }`}
                icon={<Clock className="w-5 h-5 text-amber-500" />}
                gradient="from-white to-white"
                delay={0.25}
                onClick={() => navigateToLoans()}
              />

              <StatCard
                title="Active Loans"
                value={dashboardStats?.activeLoans?.toLocaleString() ?? 0}
                icon={<Activity className="w-5 h-5 text-sky-500" />}
                gradient="from-white to-white"
                delay={0.3}
                onClick={() => navigateToLoans()}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <BarChart className="w-5 h-5 text-indigo-500 mr-2" />
                    <h3 className="text-lg font-bold text-gray-800">
                      Loan Activity
                    </h3>
                  </div>
                  <button
                    onClick={() => navigateToLoans()}
                    className="text-sm text-indigo-500 hover:text-indigo-700 font-medium flex items-center"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <LoanActivityChart data={loanActivity} />
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <PieChart className="w-5 h-5 text-indigo-500 mr-2" />
                    <h3 className="text-lg font-bold text-gray-800">
                      Loan Status Distribution
                    </h3>
                  </div>
                  <button
                    onClick={() => navigateToLoans()}
                    className="text-sm text-indigo-500 hover:text-indigo-700 font-medium flex items-center"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <LoanStatusChart data={loanStatusDistribution} />
              </motion.div>
            </div>

            {/* Profile and Quick Actions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center mb-6">
                  <User className="w-5 h-5 text-indigo-500 mr-2" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Profile Information
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Account Status</p>
                      <p className="font-medium text-emerald-500">Active</p>
                    </div>
                  </div>

                  <motion.button
                    className="w-full py-3 mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                    onClick={navigateToProfile}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Profile
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 text-indigo-500 mr-2" />
                    <h3 className="text-lg font-bold text-gray-800">
                      Quick Actions
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 cursor-pointer"
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => nvaigate("/loan-forml")}
                  >
                    <FileText className="w-8 h-8 text-indigo-500 mb-4" />
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      Apply for Loan
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Need funds? Apply for a new loan with competitive rates.
                    </p>
                    <div className="flex items-center text-indigo-500 font-medium text-sm">
                      Get Started <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </motion.div>

                  <motion.div
                    className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100 cursor-pointer"
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/loan-requests")}
                  >
                    <DollarSign className="w-8 h-8 text-emerald-500 mb-4" />
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      Lend Money
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Earn interest by lending money to verified borrowers.
                    </p>
                    <div className="flex items-center text-emerald-500 font-medium text-sm">
                      Start Lending <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Recent Transactions */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-indigo-500 mr-2" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Recent Transactions
                  </h3>
                </div>
                <motion.button
                  className="text-sm text-indigo-500 hover:text-indigo-700 font-medium flex items-center"
                  onClick={navigateToTransactions}
                  whileHover={{ x: 3 }}
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </motion.button>
              </div>

              <div className="space-y-2">
                {recentTransactions && recentTransactions.length > 0 ? (
                  recentTransactions
                    .slice(0, 5)
                    .map((transaction, index) => (
                      <TransactionItem
                        key={index}
                        transaction={transaction}
                        onClick={() =>
                          navigateToTransactionDetails(transaction.id || index)
                        }
                      />
                    ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      No recent transactions found
                    </p>
                    <motion.button
                      className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium inline-flex items-center"
                      onClick={navigateToTransactions}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      View Transaction History
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
