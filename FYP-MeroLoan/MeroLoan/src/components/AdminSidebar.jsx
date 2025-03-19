import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Shield, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore"; // Adjust the import path as needed

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      path: "/adminDashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/kycApplications",
      name: "User KYC Applications",
      icon: Users,
    },
    {
      path: "/loanApplicationReview",
      name: "Loan Applications",
      icon: FileText,
    },
    {
      path: "/balanceTransferRequests",
      name: "Transfer Requests",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen max-h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
      </div>

      <nav className="mt-4 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                isActive ? "bg-gray-100" : ""
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-3 text-gray-100 hover:bg-gray-700 border-t bg-gray-800 border-gray-200"
      >
        <LogOut className="w-5 h-5 mr-3" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default AdminSidebar;
