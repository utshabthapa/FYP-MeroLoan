"use client";

import { useEffect, useState, useRef } from "react";
import { useTransactionStore } from "../store/transactionStore";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/authStore";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  CreditCard,
  Search,
  ShieldCheck,
  ShieldX,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Sliders,
} from "lucide-react";

const TransactionStatus = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "COMPLETED":
        return {
          color: "bg-emerald-50 text-emerald-700",
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
        };
      case "PENDING":
        return {
          color: "bg-amber-50 text-amber-700",
          icon: <Clock className="w-3 h-3 mr-1" />,
        };
      case "FAILED":
        return {
          color: "bg-rose-50 text-rose-700",
          icon: <XCircle className="w-3 h-3 mr-1" />,
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700",
          icon: <CreditCard className="w-3 h-3 mr-1" />,
        };
    }
  };

  const { color, icon } = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${color}`}
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
      return <ArrowDown className="w-5 h-5 text-emerald-500" />;
    }
    if (transaction.lender?._id === user?._id) {
      return <ArrowUp className="w-5 h-5 text-indigo-500" />;
    } else if (transaction.borrower?._id === user?._id) {
      return <ArrowDown className="w-5 h-5 text-violet-500" />;
    }
    return <CreditCard className="w-5 h-5 text-gray-500" />;
  };

  const getAmountColor = () => {
    if (transaction.type === "REPAYMENT") {
      return "text-emerald-600";
    }
    if (transaction.lender?._id === user?._id) {
      return "text-indigo-600";
    } else if (transaction.borrower?._id === user?._id) {
      return "text-violet-600";
    }
    return "text-gray-900";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="mb-3 bg-white rounded-xl shadow-sm hover:shadow transition-all duration-200 overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-50">
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
            <div className="flex items-center gap-3">
              <span className={`font-semibold text-lg ${getAmountColor()}`}>
                Rs. {transaction.amount.toFixed(2)}
              </span>
              <motion.button
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-50 flex items-center justify-center"
                onClick={() => toggleExpand(transaction._id)}
                whileHover={{ backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </motion.div>
              </motion.button>
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
              <div className="px-4 pb-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1 text-xs">Status</p>
                      <TransactionStatus status={transaction.status} />
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1 text-xs">Insurance</p>
                      <div className="flex items-center">
                        {transaction.insuranceAdded ? (
                          <div className="group relative">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Protected
                            </span>
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                              This transaction is insured
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            <ShieldX className="w-3 h-3 mr-1" />
                            No Insurance
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
      value: `Rs. ${stats.totalLent.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <ArrowUp className="w-5 h-5 text-indigo-500" />,
      color: "from-white to white",
    },
    {
      title: "Total Borrowed",
      value: `Rs. ${stats.totalBorrowed.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <ArrowDown className="w-5 h-5 text-violet-500" />,
      color: "from-white to white",
    },
    {
      title: "Pending to Receive",
      value: `Rs. ${stats.pendingLent.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      color: "from-white to white",
    },
    {
      title: "Pending to Pay",
      value: `Rs. ${stats.pendingBorrowed.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <Clock className="w-5 h-5 text-rose-500" />,
      color: "from-white to white",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryItems.map((item, index) => (
        <motion.div
          key={index}
          className={`bg-gradient-to-br ${item.color} rounded-xl shadow-sm p-5 border border-gray-100`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{
            // y: -5,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-white/80 shadow-sm">
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-gray-600">{item.title}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-16 px-4"
  >
    <div className="mx-auto w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
      <CreditCard className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No transactions found
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      There are no transactions matching your current filters. Try changing your
      filters or check back later.
    </p>
    <motion.button
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Reset Filters
    </motion.button>
  </motion.div>
);

const LoadingState = () => (
  <div className="space-y-4 py-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="mb-4 bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse"></div>
              <div>
                <div className="h-5 w-40 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-4 w-24 mt-2 bg-gray-100 animate-pulse rounded-md"></div>
              </div>
            </div>
            <div className="h-6 w-20 bg-gray-100 animate-pulse rounded-md"></div>
          </div>
        </div>
        <div className="p-4">
          <div className="h-16 w-full bg-gray-50 animate-pulse rounded-xl"></div>
        </div>
      </div>
    ))}
  </div>
);

const CustomDropdown = ({ options, value, onChange, buttonText, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ backgroundColor: "#f9fafb" }}
        whileTap={{ scale: 0.98 }}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {buttonText}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="ml-1 h-4 w-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10 py-1 border border-gray-100"
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  value === option.value
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                whileHover={{
                  backgroundColor:
                    value === option.value ? "#eef2ff" : "#f9fafb",
                }}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?._id) {
        await fetchUserTransactions(user._id);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 800); // Add a slight delay for better UX
    }
  };

  const exportToCSV = () => {
    if (!sortedTransactions || sortedTransactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    // Create CSV header
    const headers = [
      "Date",
      "Type",
      "Amount",
      "Status",
      "Counterparty",
      "Insurance",
    ];

    // Format transaction data for CSV
    const csvData = sortedTransactions.map((transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString();
      const type =
        transaction.lender?._id === user?._id
          ? "Lent"
          : transaction.type === "REPAYMENT"
          ? "Repayment"
          : "Borrowed";
      const amount = transaction.amount.toFixed(2);
      const status = transaction.status;
      const counterparty =
        transaction.lender?._id === user?._id
          ? transaction.borrower?.name || "Unknown"
          : transaction.lender?.name || "Unknown";
      const insurance = transaction.insuranceAdded ? "Yes" : "No";

      return [date, type, amount, status, counterparty, insurance];
    });

    // Combine header and data
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Highest Amount", value: "highest" },
    { label: "Lowest Amount", value: "lowest" },
  ];

  const resetFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
    setSortOrder("newest");
    setStatusFilter("all");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-24 px- sm:px- lg:px- pb-12">
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
              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <motion.button
                  className="px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center shadow-sm"
                  onClick={handleRefresh}
                  disabled={refreshing || isLoading}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </motion.button>
                <motion.button
                  className="px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center shadow-sm"
                  onClick={exportToCSV}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </motion.button>
              </div>
            </div>

            {!isLoading && transactionsArray.length > 0 && (
              <TransactionSummary
                transactions={transactionsArray}
                user={user}
              />
            )}

            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex bg-gray-50 rounded-lg p-1 shadow-inner">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        activeTab === "all"
                          ? "bg-indigo-500 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      All Transactions
                    </button>
                    <button
                      onClick={() => setActiveTab("lent")}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        activeTab === "lent"
                          ? "bg-indigo-500 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Lent
                    </button>
                    <button
                      onClick={() => setActiveTab("borrowed")}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        activeTab === "borrowed"
                          ? "bg-indigo-500 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Borrowed
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                    </div>

                    <div className="flex gap-3">
                      <CustomDropdown
                        options={sortOptions}
                        value={sortOrder}
                        onChange={setSortOrder}
                        buttonText="Sort"
                        icon={<Sliders className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <LoadingState />
                ) : error ? (
                  <div className="p-6 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
                    <AlertCircle className="h-10 w-10 mx-auto mb-3 text-rose-500" />
                    {/* <p className="font-medium mb-2">
                      Error loading transactions
                    </p> */}
                    <p className="text-sm mb-4">{error}</p>
                    <motion.button
                      className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                      onClick={handleRefresh}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Refresh
                    </motion.button>
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
