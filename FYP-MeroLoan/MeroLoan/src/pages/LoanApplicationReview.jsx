import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Make sure to import useNavigate
import AdminSidebar from "@/components/AdminSidebar";
import { useLoanStore } from "../store/loanStore";
import { formatDate } from "../utils/date";
import { motion } from "framer-motion";

const LoanApplicationReview = () => {
  const { loans, isLoading, error, fetchLoans, deleteLoan } = useLoanStore();
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // Add function to navigate to loan details
  const handleViewDetails = (loanId) => {
    navigate(`/loanApplicationDetails/${loanId}`);
  };
  const handleDeleteClick = (loanId) => {
    setLoanToDelete(loanId);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!loanToDelete) return;

    setDeleteInProgress(true);
    try {
      await deleteLoan(loanToDelete);
      // Refresh the loans after deletion
      fetchLoans();
    } catch (error) {
      console.error("Failed to delete loan:", error);
    } finally {
      setDeleteInProgress(false);
      setShowConfirmModal(false);
      setLoanToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setLoanToDelete(null);
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
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                Loan Application Review
              </h1>
              <span className="bg-gray-700 px-4 py-1 rounded-full text-white text-sm">
                {loans.length}{" "}
                {loans.length === 1 ? "Application" : "Applications"}
              </span>
            </div>

            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-pulse space-y-4 w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : loans.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-lg">
                  No loan applications found
                </div>
              </div>
            ) : (
              <div className="grid gap-4 p-6">
                {loans.map((loan) => (
                  <div
                    key={loan._id}
                    className={`rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
                      loan.status === "active" ? "bg-green-50" : "bg-gray-50"
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Applicant</p>
                        <p className="font-medium text-gray-800">
                          {loan.userId?.name || "Unknown"}
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
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p
                          className={`font-medium ${
                            loan.status === "active"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {loan.status === "active" ? "Active" : "Not Active"}
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
                          onClick={() => handleDeleteClick(loan._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                        >
                          Delete
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
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this loan application? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={deleteInProgress}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={deleteInProgress}
              >
                {deleteInProgress ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanApplicationReview;
