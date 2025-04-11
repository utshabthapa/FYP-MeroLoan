"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Shield,
  Activity,
  PieChart,
  BarChart,
  LineChartIcon,
  Wallet,
  Repeat,
  ArrowUpDown,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useAdminStore } from "../store/adminStore";
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
  AreaChart,
  Area,
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
            {entry.value.toLocaleString()}
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

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  changeColor,
  gradient,
}) => {
  // Determine color based on change value or explicit prop
  const color =
    changeColor ||
    (change && Number.parseFloat(change) >= 0
      ? "text-emerald-500"
      : "text-rose-500");

  // Default gradient if none provided
  const defaultGradient = "from-blue-50 to-indigo-50";
  const cardGradient = gradient || defaultGradient;

  return (
    <div
      className={`p-6 rounded-xl shadow-sm border border-gray-100 bg-gradient-to-br ${cardGradient} transition-all duration-300 hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-800">{value}</h3>
          {/* {change && (
            <p
              className={`text-sm mt-2 ${color} flex items-center font-medium`}
            >
              {Number.parseFloat(change) >= 0 ? (
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
          )} */}
        </div>
        {Icon && (
          <div className="p-3 rounded-full bg-white/80 shadow-sm">
            <Icon className="w-6 h-6 text-indigo-500" />
          </div>
        )}
      </div>
    </div>
  );
};

const ChartCard = ({ title, icon: Icon, children, className = "" }) => {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md ${className}`}
    >
      <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
        {Icon && <Icon className="w-5 h-5 mr-2 text-indigo-500" />}
        {title}
      </h2>
      {children}
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
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fill: "#666" }} />
          <YAxis tick={{ fill: "#666" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#8884d8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUsers)"
            name="New Users"
            activeDot={{ r: 8 }}
          />
        </AreaChart>
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

  const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"];
  const chartData = data.map((item) => ({
    name: item._id,
    value: item.count,
  }));

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
          <Tooltip />
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
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fill: "#666" }} />
          <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
          <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
          <Tooltip content={<CustomTooltip valuePrefix="₹" />} />
          <Legend
            formatter={(value) => (
              <span className="text-sm font-medium">{value}</span>
            )}
          />
          <Bar
            yAxisId="left"
            dataKey="amount"
            name="Amount (₹)"
            fill="url(#colorAmount)"
            radius={[4, 4, 0, 0]}
            barSize={20}
            animationDuration={1500}
          />
          <Bar
            yAxisId="right"
            dataKey="count"
            name="Transaction Count"
            fill="url(#colorCount)"
            radius={[4, 4, 0, 0]}
            barSize={20}
            animationDuration={1500}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TransactionTypeChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data || !data.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No transaction type data available
      </div>
    );
  }

  const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981"];
  const chartData = data.map((item) => ({
    name: item._id,
    value: item.totalAmount,
    count: item.count,
  }));

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
          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
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

  // Custom colors for each transaction type
  const typeColors = {
    Deposit: "#4f46e5",
    Withdrawal: "#f43f5e",
    Transfer: "#f59e0b",
    Loan: "#10b981",
    Payment: "#8b5cf6",
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fill: "#666" }} />
          <YAxis tick={{ fill: "#666" }} />
          <Tooltip content={<CustomTooltip valuePrefix="₹" />} />
          <Legend
            formatter={(value) => (
              <span className="text-sm font-medium">{value}</span>
            )}
          />
          {types.map((type) => (
            <Bar
              key={type}
              dataKey={type}
              name={type}
              fill={typeColors[type] || "#8884d8"}
              stackId="a"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
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
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchAdminStats(), fetchAllUsers()]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 800); // Add a slight delay for better UX
    }
  };

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
      gradient: "from-white to-white",
    },
    {
      title: "Total Loans",
      value: adminStats?.totalLoans?.toLocaleString() || 0,
      change: "+9", // Using static value since we don't have loan growth rate
      icon: FileText,
      gradient: "from-white to-white",
    },
    {
      title: "Active Loans",
      value: adminStats?.activeLoans?.toLocaleString() || 0,
      change: "-3", // Using static value
      icon: Activity,
      gradient: "from-white to-white",
    },
    {
      title: "KYC Verifications",
      value: adminStats?.totalVerifiedKycs?.toLocaleString() || 0,
      change: "+15", // Using static value
      icon: Shield,
      gradient: "from-white to-white",
    },
    {
      title: "Total Money Flow",
      value: adminStats?.totalMoneyFlow?.totalAmount
        ? `₹${adminStats.totalMoneyFlow.totalAmount.toLocaleString()}`
        : "₹0",
      change: formatGrowthRate(adminStats?.transactionGrowthRate || 0),
      icon: Wallet,
      gradient: "from-white to-white",
    },
    {
      title: "Total Transactions",
      value: adminStats?.totalMoneyFlow?.count?.toLocaleString() || 0,
      change: "+7.2", // Using static value
      icon: Repeat,
      gradient: "from-white to-white",
    },
  ];

  // Skeleton loader for stats cards
  const StatCardSkeleton = () => (
    <div className="p-6 rounded-xl shadow-sm border border-gray-100 bg-white animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );

  // Skeleton loader for chart cards
  const ChartCardSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-80 bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed h-screen">
        <AdminSidebar />
      </div>
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading || refreshing}
              className="flex items-center space-x-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-md transition-colors duration-200"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <ChartCardSkeleton />
              <ChartCardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <ChartCardSkeleton />
              <ChartCardSkeleton />
            </div>
            <div className="grid grid-cols-1 gap-6 mt-8">
              <ChartCardSkeleton />
            </div>
          </>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-xl text-red-600 text-center border border-red-100">
            <p className="font-medium">Error loading dashboard data: {error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors duration-200 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <ChartCard title="User Growth (Last 6 Months)" icon={Users}>
                <UserGrowthChart data={adminStats?.userGrowth} />
              </ChartCard>
              <ChartCard title="Loan Status Distribution" icon={PieChart}>
                <LoanStatusChart data={adminStats?.loanStatusDistribution} />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <ChartCard title="Transaction Types" icon={ArrowUpDown}>
                <TransactionTypeChart
                  data={adminStats?.transactionTypeDistribution}
                />
              </ChartCard>
              <ChartCard title="Monthly Cash Flow" icon={BarChart}>
                <MonthlyCashFlowChart data={adminStats?.monthlyCashFlow} />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-8">
              <ChartCard
                title="Transaction Volume (Last 30 Days)"
                icon={LineChartIcon}
              >
                <TransactionVolumeChart data={adminStats?.transactionVolume} />
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
