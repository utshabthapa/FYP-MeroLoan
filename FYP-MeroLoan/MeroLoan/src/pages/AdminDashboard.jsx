import React, { useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Shield,
} from "lucide-react";
import { useAdminStore } from "../store/adminStore";

const StatCard = ({ title, value, change, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        {change && (
          <p
            className={`text-sm mt-2 ${
              change.startsWith("+") ? "text-green-500" : "text-red-500"
            }`}
          >
            {change} from last month
          </p>
        )}
      </div>
      {Icon && <Icon className="w-8 h-8 text-gray-400" />}
    </div>
  </div>
);

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

  const stats = [
    {
      title: "Total Users",
      value: adminStats.totalUsers || 0,
      change: "+12%", // Placeholder until backend supports change tracking
      icon: Users,
    },
    {
      title: "Total Loans",
      value: `${adminStats.totalLoans}` || "N/A",
      change: "+8%",
      icon: FileText,
    },
    {
      title: "Active Loans",
      value: adminStats.activeLoans || 0,
      change: "-3%",
      icon: FileText,
    },
    {
      title: "Total KYC Verifications",
      value: adminStats.totalVerifiedKycs || 0,
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

        {isLoading ? (
          <p>Loading stats...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        )}

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
