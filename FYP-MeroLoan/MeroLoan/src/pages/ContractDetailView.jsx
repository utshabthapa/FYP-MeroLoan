import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const ContractDetailView = ({ contract, onClose }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [nextPayment, setNextPayment] = useState(null);

  useEffect(() => {
    if (contract && contract.status === "active") {
      const pendingPayment = contract.repaymentSchedule.find(
        (payment) => payment.status === "pending"
      );
      setNextPayment(pendingPayment);
    }
  }, [contract]);

  if (!contract) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const daysUntilDue = (dueDate) => {
    try {
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  const handlePayment = () => {
    navigate(`/loan-details/${contract.loan}`);
    onClose();
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Active
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle size={14} className="inline mr-1" /> Completed
          </span>
        );
      case "paid":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle size={14} className="inline mr-1" /> Paid
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock size={14} className="inline mr-1" /> Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  // Calculate progress for milestone payments
  const calculateProgress = () => {
    if (!contract.repaymentSchedule || contract.repaymentSchedule.length === 0)
      return 0;

    const paidMilestones = contract.repaymentSchedule.filter(
      (item) => item.status === "paid"
    ).length;
    return Math.round(
      (paidMilestones / contract.repaymentSchedule.length) * 100
    );
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-2xl">
      <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Contract Details</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 focus:outline-none"
        >
          &times;
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[70vh]">
        {/* Contract Status Banner */}
        <div
          className={`p-4 mb-6 rounded-lg flex items-center 
          ${
            contract.status === "completed"
              ? "bg-green-50 border border-green-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div
            className={`rounded-full p-2 mr-4 
            ${
              contract.status === "completed" ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            {contract.status === "completed" ? (
              <CheckCircle size={24} className="text-green-600" />
            ) : (
              <AlertCircle size={24} className="text-blue-600" />
            )}
          </div>
          <div>
            <h4
              className={`font-medium ${
                contract.status === "completed"
                  ? "text-green-800"
                  : "text-blue-800"
              }`}
            >
              {contract.status === "completed"
                ? "This contract has been fully completed"
                : "This contract is currently active"}
            </h4>
            <p
              className={`text-sm ${
                contract.status === "completed"
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
            >
              {contract.status === "completed"
                ? "All payments have been made and the loan is closed"
                : contract.borrower === user?._id
                ? "You need to make payments according to the schedule below"
                : "You will receive payments according to the schedule below"}
            </p>
          </div>
        </div>

        {/* Contract Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Contract ID</p>
            <p className="font-medium text-gray-800">{contract._id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div>{renderStatusBadge(contract.status)}</div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Your Role</p>
            <p className="font-medium text-gray-800">
              {contract.borrower === user?._id ? "Borrower" : "Lender"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium text-gray-800">
              Rs. {parseFloat(contract.amount).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Insurance Added</p>
            <p className="font-medium text-gray-800">
              {contract.insuranceAdded ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Repayment Type</p>
            <p className="font-medium text-gray-800">
              {contract.repaymentType === "milestone"
                ? "Milestone Payments"
                : "One-time Payment"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Creation Date</p>
            <p className="font-medium text-gray-800">
              {formatDate(contract.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="font-medium text-gray-800">
              {formatDate(contract.updatedAt)}
            </p>
          </div>
        </div>

        {/* Progress Section (for milestone payments) */}
        {contract.repaymentType === "milestone" && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Payment Progress</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {
                  contract.repaymentSchedule.filter(
                    (item) => item.status === "paid"
                  ).length
                }{" "}
                of {contract.repaymentSchedule.length} payments completed
              </span>
              <span className="text-sm font-medium">
                {calculateProgress()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Transaction Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-800 mb-3">
            Transaction Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="font-medium text-gray-800">
                {contract.transactionId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Repayment Amount</p>
              <p className="font-medium text-gray-800">
                Rs. {parseFloat(contract.totalRepaymentAmount).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Next Payment Alert (only for active contracts with pending payments) */}
        {contract.status === "active" &&
          nextPayment &&
          contract.borrower === user?._id && (
            <div
              className={`p-4 rounded-lg border mb-6 ${
                daysUntilDue(nextPayment.dueDate) <= 3
                  ? "bg-red-50 border-red-200"
                  : daysUntilDue(nextPayment.dueDate) <= 7
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <h4 className="font-medium flex items-center">
                <AlertCircle size={18} className="mr-2" />
                Next Payment Due
              </h4>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">
                    {formatDate(nextPayment.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium">
                    Rs. {nextPayment.amountDue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm">
                  {daysUntilDue(nextPayment.dueDate) <= 0
                    ? "This payment is overdue!"
                    : `${daysUntilDue(
                        nextPayment.dueDate
                      )} days remaining until due date`}
                </p>
                <div className="mt-3">
                  <button
                    onClick={handlePayment}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Make Payment <ArrowRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Repayment Schedule */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Repayment Schedule</h4>
          <div className="space-y-4">
            {contract.repaymentSchedule.map((payment, index) => (
              <div
                key={payment._id}
                className={`p-4 rounded-lg border ${
                  payment.status === "paid"
                    ? "bg-green-50 border-green-100"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">
                      Payment {index + 1} of {contract.repaymentSchedule.length}
                    </h5>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Calendar size={16} className="mr-1" />
                      Due: {formatDate(payment.dueDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold flex items-center">
                      <DollarSign size={16} className="mr-1" />
                      Rs. {payment.amountDue.toLocaleString()}
                    </div>
                    <div className="mt-2">
                      {renderStatusBadge(payment.status)}
                    </div>
                  </div>
                </div>

                {payment.status === "pending" &&
                  contract.borrower === user?._id && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handlePayment}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Make Payment <ArrowRight size={16} className="ml-1" />
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ContractDetailView;
