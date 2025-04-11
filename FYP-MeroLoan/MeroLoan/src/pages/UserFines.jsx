import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { useAdminStore } from "../store/adminStore";
import { formatDate } from "../utils/date";
import { DollarSign, Filter, RefreshCw, Search } from "lucide-react";

const UserFines = () => {
  const { allFines, isLoading, error, fetchAllFines } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchAllFines();
  }, [fetchAllFines]);

  // Filter fines based on status and search term
  const filteredFines = allFines
    .filter((fine) => {
      if (filterStatus === "all") return true;
      return fine.status === filterStatus;
    })
    .filter((fine) => {
      if (!searchTerm) return true;
      // Search by borrower ID, loan ID, or transaction ID
      return (
        fine.borrowerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fine.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fine.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  // Sort fines
  const sortedFines = [...filteredFines].sort((a, b) => {
    if (sortBy === "amount") {
      return sortOrder === "asc"
        ? a.fineAmount - b.fineAmount
        : b.fineAmount - a.fineAmount;
    } else if (sortBy === "createdAt") {
      return sortOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  // Calculate total fine amount from paid fines
  const totalPaidFines = allFines
    .filter((fine) => fine.status === "paid")
    .reduce((total, fine) => total + fine.fineAmount, 0);

  const handleRefresh = () => {
    fetchAllFines();
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

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
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">User Fines</h1>
                <p className="text-gray-300 text-sm mt-1">
                  Manage and track all user fines
                </p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by ID"
                    className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-2 text-gray-300 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  onClick={handleRefresh}
                  className="p-2 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {/* Stats and Filters */}
            <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-w-[180px]">
                  <p className="text-sm text-gray-500">Total Paid Fines</p>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <p className="text-xl font-bold text-gray-800">
                      ${totalPaidFines.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-w-[180px]">
                  <p className="text-sm text-gray-500">Total Fines</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">
                    {allFines.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Filter size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">Filter:</span>
                <div className="flex bg-white rounded-md border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-4 py-2 text-sm ${
                      filterStatus === "all"
                        ? "bg-gray-800 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus("pending")}
                    className={`px-4 py-2 text-sm ${
                      filterStatus === "pending"
                        ? "bg-yellow-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilterStatus("paid")}
                    className={`px-4 py-2 text-sm ${
                      filterStatus === "paid"
                        ? "bg-green-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>
            </div>

            {/* Fines Table */}
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-pulse space-y-4 w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : sortedFines.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-lg">
                  {searchTerm || filterStatus !== "all"
                    ? "No matching fines found"
                    : "No fines found"}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Borrower ID
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange("amount")}
                      >
                        <div className="flex items-center gap-1">
                          Fine Amount
                          {sortBy === "amount" && (
                            <span className="text-gray-400">
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fine Percent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days Late
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange("createdAt")}
                      >
                        <div className="flex items-center gap-1">
                          Created At
                          {sortBy === "createdAt" && (
                            <span className="text-gray-400">
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedFines.map((fine) => (
                      <tr
                        key={fine._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fine.loanId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fine.borrowerId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${fine.fineAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fine.finePercent}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fine.daysLate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              fine.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {fine.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(fine.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fine.paidAt ? formatDate(fine.paidAt) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-b-lg">
                {error}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserFines;
