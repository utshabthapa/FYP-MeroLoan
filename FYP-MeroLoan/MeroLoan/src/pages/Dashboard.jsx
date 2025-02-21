import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useUserDashboardStore } from "../store/userDashboardStore";
import { formatDate } from "../utils/date";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
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

  useEffect(() => {
    fetchDashboardStats(user._id);
  }, [fetchDashboardStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto  pt-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className="container mx-auto px- py-"
        >
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="text-gray-500">Loan Borrowed</h3>
              <p className="text-2xl font-bold">
                ${dashboardStats.loanBorrowed}
              </p>
              <p className="text-sm text-gray-500">
                {dashboardStats.monthlyGrowth.borrowed}% from last month
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="text-gray-500">Loan Lended</h3>
              <p className="text-2xl font-bold">${dashboardStats.loanLended}</p>
              <p className="text-sm text-gray-500">
                {dashboardStats.monthlyGrowth.lended}% from last month
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="text-gray-500">Interest Earnings</h3>
              <p className="text-2xl font-bold">
                ${dashboardStats.interestEarnings}
              </p>
              <p className="text-sm text-gray-500">
                {dashboardStats.monthlyGrowth.earnings}% from last month
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="text-gray-500">Loan Due</h3>
              <p className="text-2xl font-bold">${dashboardStats.loanDue}</p>
              <p className="text-sm text-gray-500">Due in 15 days</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="text-gray-500">Active Loans</h3>
              <p className="text-2xl font-bold">{dashboardStats.activeLoans}</p>
              <p className="text-sm text-gray-500">
                +{dashboardStats.newLoansThisMonth} new this month
              </p>
            </motion.div>
          </div>

          {/* Profile and Account Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <motion.div
              className="p-6 bg-white rounded-lg shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Profile Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-800">Name: {user.name}</p>
                <p className="text-gray-800">Email: {user.email}</p>
              </div>
            </motion.div>

            <motion.div
              className="p-6 bg-white rounded-lg shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Recent Transactions
              </h3>
              {/* <div className="space-y-2">
                {recentTransactions.slice(0, 3).map((transaction, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div>
                      <p className="font-medium">{transaction.Transaction}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.Date)}
                      </p>
                    </div>
                    <p
                      className={`font-medium ${
                        transaction.Status === "Approved"
                          ? "text-green-500"
                          : transaction.Status === "Pending"
                          ? "text-yellow-500"
                          : "text-blue-500"
                      }`}
                    >
                      ${transaction.Amount}
                    </p>
                  </div>
                ))}
              </div> */}
            </motion.div>
          </div>

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex justify-center mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="py-3 px-8 bg-gradient-to-r from-gray-500 to-gray-600 text-white 
              font-bold rounded-lg shadow-lg hover:from-gray-600 hover:to-gray-700"
            >
              Logout
            </motion.button>
          </motion.div> */}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
