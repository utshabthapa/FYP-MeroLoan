import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoanStore } from "../store/loanStore";
import { useAuthStore } from "../store/authStore";
import Navbar from "@/components/Navbar";
import { formatDate } from "../utils/date";
import { motion } from "framer-motion";
import { User, Search, ArrowDown, ArrowUp, Filter } from "lucide-react";

const LoanRequests = () => {
  const { loans, isLoading, error, fetchLoans } = useLoanStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // States for filtering and sorting
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [amountRange, setAmountRange] = useState({
    min: "",
    max: "",
  });

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleViewDetails = (loanId) => {
    navigate(`/loan-details/${loanId}`);
  };

  const handleViewProfile = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  // Filter out the current user's loan requests and only show not active status
  const filteredLoans = loans.filter(
    (loan) => loan.status === "not active" && loan.userId._id !== user?._id
  );

  // Apply search filter
  const searchFilteredLoans = filteredLoans.filter((loan) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      loan.userId.name.toLowerCase().includes(searchLower) ||
      loan.loanAmount.toString().includes(searchTerm) ||
      loan.interestRate.toString().includes(searchTerm)
    );
  });

  // Apply amount range filter
  const rangeFilteredLoans = searchFilteredLoans.filter((loan) => {
    const amount = parseFloat(loan.loanAmount);
    const min = amountRange.min ? parseFloat(amountRange.min) : 0;
    const max = amountRange.max ? parseFloat(amountRange.max) : Infinity;

    return amount >= min && amount <= max;
  });

  // Sort loans by date
  const sortedLoans = [...rangeFilteredLoans].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.appliedAt) - new Date(a.appliedAt);
    } else {
      return new Date(a.appliedAt) - new Date(b.appliedAt);
    }
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-24 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Loan Requests</h1>
                <div>
                  <button
                    onClick={() => navigate("/userLoanRequests")}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    My Loan Requests
                  </button>
                  <span className="ml-4 bg-gray-700 px-4 py-1 rounded-full text-white text-sm">
                    {filteredLoans.length}{" "}
                    {filteredLoans.length === 1 ? "Request" : "Requests"}
                  </span>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name, amount or interest rate"
                      className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setSortOrder(
                          sortOrder === "newest" ? "oldest" : "newest"
                        )
                      }
                      className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border"
                      title={
                        sortOrder === "newest"
                          ? "Showing newest first"
                          : "Showing oldest first"
                      }
                    >
                      {sortOrder === "newest" ? (
                        <>
                          <ArrowDown className="w-4 h-4 mr-1" /> Newest
                        </>
                      ) : (
                        <>
                          <ArrowUp className="w-4 h-4 mr-1" /> Oldest
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Filters
                    </button>
                  </div>
                </div>

                {/* Amount range filter */}
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 p-4 bg-gray-100 rounded-md"
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Amount Range
                    </h3>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">
                          Min Amount
                        </label>
                        <input
                          type="number"
                          placeholder="Min"
                          className="w-full p-2 border rounded-md"
                          value={amountRange.min}
                          onChange={(e) =>
                            setAmountRange({
                              ...amountRange,
                              min: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">
                          Max Amount
                        </label>
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-full p-2 border rounded-md"
                          value={amountRange.max}
                          onChange={(e) =>
                            setAmountRange({
                              ...amountRange,
                              max: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => setAmountRange({ min: "", max: "" })}
                          className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-gray-100 rounded-lg" />
                    ))}
                  </div>
                </div>
              ) : sortedLoans.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-lg mb-4">
                    No pending loan requests found
                  </div>
                  <button
                    onClick={() => navigate("/loan-form")}
                    className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    Apply for a Loan
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 p-6">
                  {sortedLoans.map((loan) => (
                    <div
                      key={loan._id}
                      className="bg-gray-50 rounded-lg p-6 transition-all duration-200 hover:shadow-md hover:transform hover:-translate-y-1"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Applicant</p>
                          <div className="flex items-center">
                            <p className="font-medium text-gray-800">
                              {loan.userId.name}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(loan.userId._id);
                              }}
                              className="ml-2 p-1 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                              title="View Profile"
                            >
                              <User className="w-3 h-3 mr-1" />
                              Profile
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Loan Amount</p>
                          <p className="font-medium text-gray-800">
                            Rs.{parseFloat(loan.loanAmount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Interest Rate</p>
                          <p className="font-medium text-gray-800">
                            {loan.interestRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Applied On</p>
                          <p className="font-medium text-gray-800">
                            {formatDate(loan.appliedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {loan.repaymentType === "milestone"
                              ? `${loan.milestones} Milestones`
                              : "One-time Payment"}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProfile(loan.userId._id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleViewDetails(loan._id)}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoanRequests;
