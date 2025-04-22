"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ArrowLeftRight,
  UserX,
  Scale,
  Receipt,
  LogOut,
  ChevronDown,
  ChevronRight,
  AlertTriangle, // Icon for Bad Loans
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuthStore();
  const [applicationsOpen, setApplicationsOpen] = useState(true);
  const [moderationOpen, setModerationOpen] = useState(true);

  const handleLogout = () => {
    logout();
  };

  const dashboardItems = [
    {
      path: "/adminDashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
    },
  ];

  const applicationItems = [
    {
      path: "/kycApplications",
      name: "KYC Applications",
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
      icon: ArrowLeftRight,
    },
  ];

  const moderationItems = [
    {
      path: "/banUsers",
      name: "Ban Users",
      icon: UserX,
    },
    {
      path: "/banAppeals",
      name: "Appeals",
      icon: Scale,
    },
    {
      path: "/userFines",
      name: "User Fines",
      icon: Receipt,
    },
  ];

  // Single Bad Loans item
  const badLoansItem = {
    path: "/bad-loans",
    name: "Bad Loans",
    icon: AlertTriangle,
  };

  const renderMenuItem = (item) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-150 rounded-md mx-2 ${
          isActive ? "bg-gray-100 font-medium" : ""
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        <span className="text-sm">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen max-h-screen w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
      </div>

      {/* Scrollable Navigation */}
      <nav className="mt-2 flex-1 overflow-y-auto">
        {/* Dashboard Section */}
        <div className="mb-2">{dashboardItems.map(renderMenuItem)}</div>

        {/* Divider */}
        <div className="mx-4 my-2 border-t border-gray-200"></div>

        {/* Applications Section */}
        <div className="mb-2 ml-2">
          <button
            onClick={() => setApplicationsOpen(!applicationsOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
          >
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Applications</span>
            </div>
            {applicationsOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {applicationsOpen && (
            <div className="mt-1 ml-4 border-l border-gray-200">
              {applicationItems.map(renderMenuItem)}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 my-2 border-t border-gray-200"></div>

        {/* Moderation Section */}
        <div className="mb-2 ml-2">
          <button
            onClick={() => setModerationOpen(!moderationOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
          >
            <div className="flex items-center">
              <Scale className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">User Moderation</span>
            </div>
            {moderationOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {moderationOpen && (
            <div className="mt-1 ml-4 border-l border-gray-200">
              {moderationItems.map(renderMenuItem)}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 my-2 border-t border-gray-200"></div>

        {/* Bad Loans Section - Simple single item */}
        <div className="mb-2">{renderMenuItem(badLoansItem)}</div>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-3 text-white bg-red-600 hover:bg-red-700 transition-colors duration-150 border-t border-gray-200"
      >
        <LogOut className="w-5 h-5 mr-3" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default AdminSidebar;
