import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { useTransactionStore } from "../store/transactionStore"; // Update path as needed

const TransactionStatus = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
    >
      {status}
    </span>
  );
};

const BalanceTransferRequest = () => {
  const {
    adminTransactions,
    isLoading,
    error,
    fetchAdminTransactions,
    updateAdminTransfer,
  } = useTransactionStore();
  const [activeTab, setActiveTab] = useState("pending");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch transactions when component mounts or when refresh key changes
  useEffect(() => {
    fetchAdminTransactions();
  }, [fetchAdminTransactions, refreshKey]);

  // Re-fetch data when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Force a refetch when switching tabs
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleTransfer = async (transactionId) => {
    try {
      await updateAdminTransfer(transactionId);

      // Trigger a refetch of the data
      setRefreshKey((prevKey) => prevKey + 1);

      setNotification({
        show: true,
        message: "Balance transfer successfully marked as transferred",
        type: "success",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "" }),
        3000
      );
    } catch (error) {
      setNotification({
        show: true,
        message:
          error.response?.data?.message || "Failed to update transfer status",
        type: "error",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "" }),
        3000
      );
    }
  };

  // Filter transactions based on active tab
  const filteredTransactions = adminTransactions.filter((transaction) => {
    if (activeTab === "pending") return !transaction.adminTransfer;
    return transaction.adminTransfer;
  });

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        <div className="fixed h-screen">
          <AdminSidebar />
        </div>
        <div className="flex-1 p-8 ml-64">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {notification.show && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {notification.message}
              </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Balance Transfer Requests
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTabChange("pending")}
                    className={`px-3 py-1 text-sm rounded-md ${
                      activeTab === "pending"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleTabChange("transferred")}
                    className={`px-3 py-1 text-sm rounded-md ${
                      activeTab === "transferred"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Transferred
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No{" "}
                  {activeTab === "pending"
                    ? "pending transfers"
                    : "transferred transactions"}{" "}
                  found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Borrower
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Insurance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        {activeTab === "pending" && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.lender?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.borrower?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${transaction.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.insuranceAdded ? "Yes" : "No"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <TransactionStatus status={transaction.status} />
                          </td>
                          {activeTab === "pending" && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleTransfer(transaction._id)}
                                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
                              >
                                Transfer
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default BalanceTransferRequest;
