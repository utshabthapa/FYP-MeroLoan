"use client";

import { useEffect, useState } from "react";
import { useTransactionStore } from "../store/transactionStore";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/authStore";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  CreditCard,
  DollarSign,
  Filter,
  Search,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

const TransactionStatus = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "COMPLETED":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <DollarSign className="w-3 h-3 mr-1" />,
        };
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Calendar className="w-3 h-3 mr-1" />,
        };
      case "FAILED":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <ShieldX className="w-3 h-3 mr-1" />,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <CreditCard className="w-3 h-3 mr-1" />,
        };
    }
  };

  const { color, icon } = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}
    >
      {icon}
      {status}
    </span>
  );
};

const TransactionCard = ({ transaction, user, expanded, toggleExpand }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTransactionTypeLabel = (transaction) => {
    if (transaction.type === "REPAYMENT") {
      return "Repaid to";
    }
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

  const getTransactionIcon = () => {
    if (transaction.type === "REPAYMENT") {
      return <ArrowDown className="w-5 h-5 text-green-500" />;
    }
    if (transaction.lender?._id === user?._id) {
      return <ArrowUp className="w-5 h-5 text-blue-500" />;
    } else if (transaction.borrower?._id === user?._id) {
      return <ArrowDown className="w-5 h-5 text-purple-500" />;
    }
    return <CreditCard className="w-5 h-5 text-gray-500" />;
  };

  const getBorderColor = () => {
    if (transaction.lender?._id === user?._id) {
      return "border-blue-500";
    } else if (transaction.type === "REPAYMENT") {
      return "border-green-500";
    } else {
      return "border-purple-500";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`mb-4 bg-white rounded-lg shadow overflow-hidden border-l-4 hover:shadow-md transition-all duration-200 ${getBorderColor()}`}
      >
        <div className="p-4 ">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-100">
                {getTransactionIcon()}
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  {getTransactionTypeLabel(transaction)}{" "}
                  {getCounterparty(transaction)}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">
                ${transaction.amount.toFixed(2)}
              </span>
              <button
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 flex items-center justify-center"
                onClick={() => toggleExpand(transaction._id)}
              >
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 pt-3">
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Status</p>
                    <TransactionStatus status={transaction.status} />
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Insurance</p>
                    <div className="flex items-center">
                      {transaction.insuranceAdded ? (
                        <div className="group relative">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Protected
                          </span>
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            This transaction is insured
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">
                          <ShieldX className="w-3 h-3 mr-1" />
                          No Insurance
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="p-4 pt-0 flex justify-end">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  View Details
                </button>
              </div> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const TransactionSummary = ({ transactions, user }) => {
  // Calculate summary statistics
  const stats = transactions.reduce(
    (acc, transaction) => {
      if (transaction.lender?._id === user?._id) {
        acc.totalLent += transaction.amount;
        if (transaction.status !== "COMPLETED") {
          acc.pendingLent += transaction.amount;
        }
      } else if (transaction.borrower?._id === user?._id) {
        acc.totalBorrowed += transaction.amount;
        if (transaction.status !== "COMPLETED") {
          acc.pendingBorrowed += transaction.amount;
        }
      }
      return acc;
    },
    {
      totalLent: 0,
      totalBorrowed: 0,
      pendingLent: 0,
      pendingBorrowed: 0,
    }
  );

  const summaryItems = [
    {
      title: "Total Lent",
      value: `$${stats.totalLent.toFixed(2)}`,
      icon: <ArrowUp className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      title: "Total Borrowed",
      value: `$${stats.totalBorrowed.toFixed(2)}`,
      icon: <ArrowDown className="w-5 h-5 text-purple-500" />,
      color: "bg-purple-50",
    },
    {
      title: "Pending to Receive",
      value: `$${stats.pendingLent.toFixed(2)}`,
      icon: <Calendar className="w-5 h-5 text-amber-500" />,
      color: "bg-amber-50",
    },
    {
      title: "Pending to Pay",
      value: `$${stats.pendingBorrowed.toFixed(2)}`,
      icon: <Calendar className="w-5 h-5 text-red-500" />,
      color: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryItems.map((item, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${item.color}`}>{item.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-xl font-semibold">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12"
  >
    <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <CreditCard className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">
      No transactions found
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      There are no transactions matching your current filters. Try changing your
      filters or create a new transaction.
    </p>
    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
      Create New Transaction
    </button>
  </motion.div>
);

const LoadingState = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="mb-4 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 pb-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div>
                <div className="h-5 w-40 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-24 mt-2 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
            <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const CustomDropdown = ({ options, value, onChange, buttonText }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {buttonText}
        <ChevronDown className="ml-1 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1">
          {options.map((option) => (
            <button
              key={option.value}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                value === option.value ? "bg-gray-50 font-medium" : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TransactionHistory = () => {
  const { transactions, isLoading, error, fetchUserTransactions } =
    useTransactionStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchUserTransactions(user._id);
    }
  }, [fetchUserTransactions, user]);

  // Make sure transactions is an array before filtering
  const transactionsArray = Array.isArray(transactions) ? transactions : [];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredTransactions = transactionsArray.filter((transaction) => {
    // Filter by transaction type (tab)
    if (activeTab === "lent" && transaction.lender?._id !== user?._id)
      return false;
    if (activeTab === "borrowed" && transaction.borrower?._id !== user?._id)
      return false;

    // Filter by status
    if (statusFilter !== "all" && transaction.status !== statusFilter)
      return false;

    // Filter by search query
    if (searchQuery) {
      const counterparty =
        transaction.lender?._id === user?._id
          ? transaction.borrower?.name
          : transaction.lender?.name;

      const searchLower = searchQuery.toLowerCase();

      if (counterparty && counterparty.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (transaction.amount.toString().includes(searchLower)) {
        return true;
      }

      if (transaction.status.toLowerCase().includes(searchLower)) {
        return true;
      }

      return false;
    }

    return true;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOrder === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortOrder === "highest") {
      return b.amount - a.amount;
    } else if (sortOrder === "lowest") {
      return a.amount - b.amount;
    }
    return 0;
  });

  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Pending", value: "PENDING" },
    { label: "Failed", value: "FAILED" },
  ];

  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Highest Amount", value: "highest" },
    { label: "Lowest Amount", value: "lowest" },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Transaction History
                </h1>
                <p className="text-gray-500">
                  View and manage your transaction records
                </p>
              </div>
              <button className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                New Transaction
              </button>
            </div>

            {!isLoading && transactionsArray.length > 0 && (
              <TransactionSummary
                transactions={transactionsArray}
                user={user}
              />
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex bg-gray-100 rounded-md p-1">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${
                        activeTab === "all"
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Transactions
                    </button>
                    <button
                      onClick={() => setActiveTab("lent")}
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${
                        activeTab === "lent"
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Lent
                    </button>
                    <button
                      onClick={() => setActiveTab("borrowed")}
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${
                        activeTab === "borrowed"
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Borrowed
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                          onClick={() =>
                            setIsStatusDropdownOpen(!isStatusDropdownOpen)
                          }
                        >
                          {statusOptions.find(
                            (option) => option.value === statusFilter
                          )?.label || "Status"}
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </button>

                        {isStatusDropdownOpen && (
                          <div className="absolute left-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 py-1">
                            {statusOptions.map((option) => (
                              <button
                                key={option.value}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                  statusFilter === option.value
                                    ? "bg-gray-50 font-medium"
                                    : ""
                                }`}
                                onClick={() => {
                                  setStatusFilter(option.value);
                                  setIsStatusDropdownOpen(false);
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <CustomDropdown
                        options={sortOptions}
                        value={sortOrder}
                        onChange={setSortOrder}
                        buttonText={<Filter className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <LoadingState />
                ) : error ? (
                  <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
                    {error}
                  </div>
                ) : sortedTransactions.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-1 mt-4">
                    <AnimatePresence>
                      {sortedTransactions.map((transaction) => (
                        <TransactionCard
                          key={transaction._id}
                          transaction={transaction}
                          user={user}
                          expanded={expandedId === transaction._id}
                          toggleExpand={toggleExpand}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TransactionHistory;
