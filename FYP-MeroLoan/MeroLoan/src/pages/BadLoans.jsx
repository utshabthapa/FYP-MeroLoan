// components/BadLoans.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { useAdminStore } from "../store/adminStore";
import { formatDate } from "../utils/date";

const BadLoans = () => {
  const { badLoans, isLoading, error, fetchBadLoans } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBadLoans();
  }, [fetchBadLoans]);

  const filteredLoans = badLoans.filter(
    (loan) =>
      loan.borrower?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      loan.borrower?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      loan.borrower?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loan?._id?.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="fixed h-screen">
        <AdminSidebar />
      </div>
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Bad Loans Management
          </h1>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by borrower name, email, or loan ID..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Bad Loans Table */}
          {!isLoading && !error && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrower
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Overdue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLoans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {loan.borrower?.firstName}{" "}
                              {loan.borrower?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {loan.borrower?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {loan.loan?._id.toString().slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹{loan.amountDue.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {loan.daysOverdue} days
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.lastPaymentDate
                          ? formatDate(loan.lastPaymentDate)
                          : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLoans.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No bad loans found
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BadLoans;
