import React, { useEffect, useState } from "react";
import { useTransactionStore } from "../store/transactionStore"; // Update this path to match your file structure
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/authStore"; // Update this path to match your file structure

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

const TransactionHistory = () => {
  const { transactions, isLoading, error, fetchUserTransactions } =
    useTransactionStore();
  const { user } = useAuthStore();
  const [transactionType, setTransactionType] = useState("all");

  useEffect(() => {
    if (user?._id) {
      fetchUserTransactions(user._id);
    }
  }, [fetchUserTransactions, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Make sure transactions is an array before filtering
  const transactionsArray = Array.isArray(transactions) ? transactions : [];

  const filteredTransactions = transactionsArray.filter((transaction) => {
    if (transactionType === "all") return true;
    if (transactionType === "lent")
      return transaction.lender?._id === user?._id;
    if (transactionType === "borrowed")
      return transaction.borrower?._id === user?._id;
    return true;
  });

  const getTransactionTypeLabel = (transaction) => {
    if (transaction.lender?._id === user?._id) {
      return "Lent to";
    } else if (transaction.borrower?._id === user?._id) {
      return "Borrowed from";
    }
    return "Transaction with";
  };

  const getCounterparty = (transaction) => {
    if (transaction.lender?._id === user?._id) {
      return transaction.borrower?.name || "Unknown";
    } else if (transaction.borrower?._id === user?._id) {
      return transaction.lender?.name || "Unknown";
    }
    return "Unknown";
  };

  // Function to check and log the actual structure of transactions data
  const debugData = () => {
    console.log("Transactions data:", transactions);
    console.log("Is array:", Array.isArray(transactions));
    console.log("User ID:", user?._id);
  };

  // Call this in development to help diagnose issues
  useEffect(() => {
    if (transactions) {
      debugData();
    }
  }, [transactions]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-28 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto"
          >
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Transaction History
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTransactionType("all")}
                    className={`px-3 py-1 text-sm rounded-md ${
                      transactionType === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTransactionType("lent")}
                    className={`px-3 py-1 text-sm rounded-md ${
                      transactionType === "lent"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Lent
                  </button>
                  <button
                    onClick={() => setTransactionType("borrowed")}
                    className={`px-3 py-1 text-sm rounded-md ${
                      transactionType === "borrowed"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Borrowed
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
                  No transactions found.
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
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          With
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getTransactionTypeLabel(transaction)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getCounterparty(transaction)}
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

export default TransactionHistory;
