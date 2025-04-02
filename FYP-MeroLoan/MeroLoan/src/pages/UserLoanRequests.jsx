import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoanStore } from "../store/loanStore";
import { formatDate } from "../utils/date";
import { useAuthStore } from "../store/authStore"; // Assuming you have an auth store
import { motion } from "framer-motion";

import Navbar from "@/components/navbar";

const UserLoanRequests = () => {
  const { loans, isLoading, error, fetchLoans } = useLoanStore();
  const { user } = useAuthStore(); // Get current user from auth store
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleViewDetails = (loanId) => {
    navigate(`/loan-details/${loanId}`);
  };

  // Filter loans for current user
  const userLoans = loans.filter((loan) => loan.userId._id === user?._id);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-24 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto "
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">
                  My Loan Requests
                </h1>
                <div>
                  <button
                    onClick={() => navigate("/loan-requests")}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    All Loan Requests
                  </button>
                  <span className="ml-4 bg-gray-700 px-4 py-1 rounded-full text-white text-sm">
                    {userLoans.length}{" "}
                    {userLoans.length === 1 ? "Request" : "Requests"}
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-gray-100 rounded-lg" />
                    ))}
                  </div>
                </div>
              ) : userLoans.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-lg mb-4">
                    You haven't made any loan requests yet
                  </div>
                  <button
                    onClick={() => navigate("/apply-loan")}
                    className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    Apply for a Loan
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 p-6">
                  {userLoans.map((loan) => (
                    <div
                      key={loan._id}
                      className="bg-gray-50 rounded-lg p-6 transition-all duration-200 hover:shadow-md hover:transform hover:-translate-y-1"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p
                            className={`font-medium ${
                              loan.status === "active"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {loan.status.charAt(0).toUpperCase() +
                              loan.status.slice(1)}
                          </p>
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
                        <button
                          onClick={() => handleViewDetails(loan._id)}
                          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                        >
                          View Details
                        </button>
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

export default UserLoanRequests;
