import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Shield,
} from "lucide-react";

const StatCard = ({ title, value, change, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        <p
          className={`text-sm mt-2 ${
            change.startsWith("+") ? "text-green-500" : "text-red-500"
          }`}
        >
          {change} from last month
        </p>
      </div>
      {Icon && <Icon className="w-8 h-8 text-gray-400" />}
    </div>
  </div>
);

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "24,521",
      change: "+12%",
      icon: Users,
    },
    {
      title: "Total Loans",
      value: "$12.9M",
      change: "+8%",
      icon: FileText,
    },
    {
      title: "Active Loans",
      value: "8,234",
      change: "-3%",
      icon: FileText,
    },
    {
      title: "Insurance Subs",
      value: "5,147",
      change: "+15%",
      icon: Shield,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard Overview
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Welcome, Admin</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              User Growth Trend
            </h2>
            {/* Add your chart component here */}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Loan Applications Status
            </h2>
            {/* Add your chart component here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
