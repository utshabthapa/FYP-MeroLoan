import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { useLoanStore } from "../store/loanStore";
import { formatDate } from "../utils/date";
import { motion } from "framer-motion";

const LoanApplicationDetail = () => {
  const { loanId } = useParams();
  const { loans, fetchLoans, deleteLoan } = useLoanStore();
  const [loan, setLoan] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  useEffect(() => {
    const foundLoan = loans.find((loan) => loan._id === loanId);
    if (foundLoan) {
      setLoan(foundLoan);
    } else {
      navigate("/loanApplicationReview");
    }
  }, [loanId, loans, navigate]);

  const handleDeleteLoan = async () => {
    try {
      setIsDeleting(true);
      await deleteLoan(loanId);
      navigate("/loanApplicationReview");
    } catch (error) {
      console.error("Failed to delete loan:", error);
      alert("Failed to delete loan request. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
  };

  const calculateRepaymentSchedule = () => {
    if (!loan) return [];

    const amount = parseFloat(loan.loanAmount);
    const rate = parseFloat(loan.interestRate);
    const totalAmount = amount + (amount * rate) / 100;
    const startDate = new Date(loan.appliedAt);
    const durationDays = parseInt(loan.duration);

    if (loan.repaymentType === "one-time") {
      const endDate = new Date(
        startDate.getTime() + durationDays * 24 * 60 * 60 * 1000
      );
      return [{ date: endDate, amount: totalAmount }];
    } else {
      const milestones = parseInt(loan.milestones);
      const amountPerMilestone = totalAmount / milestones;
      const daysPerMilestone = durationDays / milestones;

      return Array.from({ length: milestones }, (_, index) => ({
        date: new Date(
          startDate.getTime() +
            daysPerMilestone * (index + 1) * 24 * 60 * 60 * 1000
        ),
        amount: amountPerMilestone,
      }));
    }
  };

  if (!loan) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="fixed h-screen">
          <AdminSidebar />
        </div>
        <div className="flex-1 p-8 ml-64">
          <div className="animate-pulse text-gray-600 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

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
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">
                  Loan Application Details
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    loan.status === "active"
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-white"
                  }`}
                >
                  {loan.status === "active" ? "Active" : "Not Active"}
                </span>
              </div>

              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Applicant Information
                      </h2>
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium">Name:</span>{" "}
                          {loan.userId?.name || "Unknown"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Email:</span>{" "}
                          {loan.userId?.email || "Unknown"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Applied On:</span>{" "}
                          {formatDate(loan.appliedAt)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">User ID:</span>{" "}
                          {loan.userId?._id || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Loan Terms
                      </h2>
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium">Amount:</span> Rs.
                          {parseFloat(loan.loanAmount).toLocaleString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Interest Rate:</span>{" "}
                          {loan.interestRate}%
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Duration:</span>{" "}
                          {loan.duration} days
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Repayment Type:</span>{" "}
                          {loan.repaymentType === "milestone"
                            ? `Milestone (${loan.milestones} payments)`
                            : "One-time Payment"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Total Amount:</span> Rs.
                          {(
                            parseFloat(loan.loanAmount) +
                            (parseFloat(loan.loanAmount) *
                              parseFloat(loan.interestRate)) /
                              100
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {loan.activeContract && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      Active Contract Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Lender:</span>{" "}
                          {loan.activeContract.lender?.name || "Unknown"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Created On:</span>{" "}
                          {formatDate(loan.activeContract?.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Insurance:</span>{" "}
                          {loan.activeContract.insuranceAdded ? "Yes" : "No"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Contract Status:</span>{" "}
                          <span className="ml-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {loan.activeContract.status || "Active"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Repayment Schedule
                  </h2>
                  <div className="space-y-4">
                    {loan.activeContract?.repaymentSchedule
                      ? loan.activeContract.repaymentSchedule.map(
                          (payment, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-md shadow-sm border border-gray-100"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-800">
                                    Payment {index + 1}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Due: {formatDate(payment.dueDate)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-800">
                                    Rs.
                                    {payment.amountDue?.toLocaleString() ||
                                      "N/A"}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        payment.status === "paid"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {payment.status === "paid"
                                        ? "Paid"
                                        : "Pending"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )
                      : calculateRepaymentSchedule().map((payment, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-md shadow-sm border border-gray-100"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-800">
                                  Payment {index + 1}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Due: {formatDate(payment.date)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-800">
                                  Rs.{payment.amount.toLocaleString()}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm text-gray-500">
                                    {loan.repaymentType === "milestone"
                                      ? `Milestone ${index + 1} of ${
                                          loan.milestones
                                        }`
                                      : "Full Payment"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => navigate("/loanApplicationReview")}
                    className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Back to Loan Applications
                  </button>

                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isDeleting}
                    className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete Loan"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
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
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLoan}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoanApplicationDetail;
