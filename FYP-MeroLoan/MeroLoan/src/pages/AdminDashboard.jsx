import React, { useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Shield,
  CreditCard,
  DollarSign,
  Activity,
  PieChart,
  BarChart,
  LineChart as LineChartIcon,
  Wallet,
  Repeat,
  ArrowUpDown,
} from "lucide-react";
import { useAdminStore } from "../store/adminStore";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const StatCard = ({ title, value, change, icon: Icon, changeColor }) => {
  // Determine color based on change value or explicit prop
  const color =
    changeColor ||
    (change && parseFloat(change) >= 0 ? "text-green-500" : "text-red-500");

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          {change && (
            <p className={`text-sm mt-2 ${color} flex items-center`}>
              {parseFloat(change) >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {change.startsWith("+")
                ? change
                : change.startsWith("-")
                ? change
                : `+${change}`}
              % from last month
            </p>
          )}
        </div>
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
    </div>
  );
};

const UserGrowthChart = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No user growth data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    users: item.count,
  }));

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#8884d8"
            fill="#8884d8"
            name="New Users"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const LoanStatusChart = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No loan status data available
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8844FF"];
  const chartData = data.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  return (
    <div style={{ width: "100%", height: "400px" }}>
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
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

const TransactionVolumeChart = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No transaction volume data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: `${item._id.day}/${item._id.month}`,
    amount: item.totalAmount,
    count: item.count,
  }));

  return (
    <div style={{ width: "100%", height: "450px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="amount"
            name="Amount (₹)"
            fill="#8884d8"
          />
          <Bar
            yAxisId="right"
            dataKey="count"
            name="Transaction Count"
            fill="#82ca9d"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TransactionTypeChart = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No transaction type data available
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const chartData = data.map((item) => ({
    name: item._id,
    value: item.totalAmount,
    count: item.count,
  }));

  return (
    <div style={{ width: "100%", height: "400px" }}>
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
              `${name}: ₹${(
                chartData.find((item) => item.name === name)?.value || 0
              ).toLocaleString()}`
            }
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

const MonthlyCashFlowChart = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No monthly cash flow data available
      </div>
    );
  }

  // Process data to make it suitable for recharts
  const months = [
    ...new Set(data.map((item) => `${item._id.month}/${item._id.year}`)),
  ].sort();
  const types = [...new Set(data.map((item) => item._id.type))];

  const chartData = months.map((month) => {
    const monthData = { name: month };

    // Add values for each transaction type
    types.forEach((type) => {
      const entry = data.find(
        (item) =>
          `${item._id.month}/${item._id.year}` === month &&
          item._id.type === type
      );
      monthData[type] = entry ? entry.totalAmount : 0;
    });

    return monthData;
  });

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
          <Legend />
          {types.map((type, index) => (
            <Bar
              key={type}
              dataKey={type}
              name={type}
              fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][index % 4]}
              stackId="a"
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const AdminDashboard = () => {
  const { adminStats, isLoading, error, fetchAdminStats, fetchAllUsers } =
    useAdminStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchAdminStats(), fetchAllUsers()]);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchData();
  }, [fetchAdminStats, fetchAllUsers]);

  // Format growth rates correctly
  const formatGrowthRate = (rate) => {
    if (!rate) return "+0%";
    return rate > 0 ? `+${rate}` : `${rate}`;
  };

  const stats = [
    {
      title: "Total Users",
      value: adminStats?.totalUsers?.toLocaleString() || 0,
      change: formatGrowthRate(adminStats?.userGrowthRate || 0),
      icon: Users,
    },
    {
      title: "Total Loans",
      value: adminStats?.totalLoans?.toLocaleString() || 0,
      change: "+8%", // Using static value since we don't have loan growth rate
      icon: FileText,
    },
    {
      title: "Active Loans",
      value: adminStats?.activeLoans?.toLocaleString() || 0,
      change: "-3%", // Using static value
      icon: Activity,
    },
    {
      title: "KYC Verifications",
      value: adminStats?.totalVerifiedKycs?.toLocaleString() || 0,
      change: "+15%", // Using static value
      icon: Shield,
    },
    {
      title: "Total Money Flow",
      value: adminStats?.totalMoneyFlow?.totalAmount
        ? `₹${adminStats.totalMoneyFlow.totalAmount.toLocaleString()}`
        : "₹0",
      change: formatGrowthRate(adminStats?.transactionGrowthRate || 0),
      icon: Wallet,
    },
    {
      title: "Total Transactions",
      value: adminStats?.totalMoneyFlow?.count?.toLocaleString() || 0,
      change: "+7.2%", // Using static value
      icon: Repeat,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed h-screen">
        <AdminSidebar />
      </div>
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard Overview
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Welcome, Admin</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-500 text-center">
            <p>Error loading dashboard data: {error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" /> User Growth (Last 6 Months)
                </h2>
                <UserGrowthChart data={adminStats?.userGrowth} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" /> Loan Status Distribution
                </h2>
                <LoanStatusChart data={adminStats?.loanStatusDistribution} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ArrowUpDown className="w-5 h-5 mr-2" /> Transaction Types
                </h2>
                <TransactionTypeChart
                  data={adminStats?.transactionTypeDistribution}
                />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BarChart className="w-5 h-5 mr-2" /> Monthly Cash Flow
                </h2>
                <MonthlyCashFlowChart data={adminStats?.monthlyCashFlow} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <LineChartIcon className="w-5 h-5 mr-2" /> Transaction Volume
                  (Last 30 Days)
                </h2>
                <TransactionVolumeChart data={adminStats?.transactionVolume} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
