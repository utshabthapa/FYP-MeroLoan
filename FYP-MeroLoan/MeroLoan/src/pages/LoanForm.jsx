import React, { useState } from "react";
import { useLoanStore } from "../store/loanStore";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/date";
import Navbar from "@/components/Navbar";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LoanForm = () => {
  const { submitLoanRequest, deleteLoanRequest } = useLoanStore();
  const { user } = useAuthStore();
  const userId = user?._id;
  const kycStatus = user?.kycStatus || "notApplied";
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loanData, setLoanData] = useState({
    userId: userId || "",
    loanAmount: "",
    interestRate: "",
    duration: "",
    repaymentType: "one-time",
    milestones: 2,
  });
  const [validationErrors, setValidationErrors] = useState({
    loanAmount: "",
  });

  const MIN_LOAN_AMOUNT = 500;
  const MAX_LOAN_AMOUNT = 500000; // 5 lakhs

  const isKycApproved = kycStatus === "approved";

  const getKycStatusMessage = () => {
    switch (kycStatus) {
      case "notApplied":
        return "You haven't applied for KYC verification yet. Please complete your KYC to apply for a loan.";
      case "pending":
        return "Your KYC verification is pending. Please wait for approval before applying for a loan.";
      case "rejected":
        return "Your KYC verification was rejected. Please update your KYC information to apply for a loan.";
      default:
        return "";
    }
  };

  const redirectToProfile = () => {
    navigate("/userProfile");
  };

  // Calculate interest amount based on annual rate
  const calculateInterestAmount = () => {
    const principal = parseFloat(loanData.loanAmount) || 0;
    const annualRate = parseFloat(loanData.interestRate) || 0;
    const durationDays = parseInt(loanData.duration) || 0;

    return (principal * annualRate * durationDays) / (100 * 365);
  };

  const calculateRepaymentSchedule = () => {
    const principal = parseFloat(loanData.loanAmount) || 0;
    const interestAmount = calculateInterestAmount();
    const totalAmount = principal + interestAmount;
    const startDate = new Date();
    const durationDays = parseInt(loanData.duration) || 0;

    if (loanData.repaymentType === "one-time") {
      const endDate = new Date(
        startDate.getTime() + durationDays * 24 * 60 * 60 * 1000
      );
      return [
        {
          date: endDate,
          amount: totalAmount,
        },
      ];
    } else {
      const milestones = parseInt(loanData.milestones);
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

  const validateLoanAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return "Please enter a valid amount";
    }
    if (numAmount < MIN_LOAN_AMOUNT) {
      return `Loan amount must be at least Rs. ${MIN_LOAN_AMOUNT}`;
    }
    if (numAmount > MAX_LOAN_AMOUNT) {
      return `Loan amount cannot exceed Rs. ${MAX_LOAN_AMOUNT.toLocaleString()} (5 lakhs)`;
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanData({ ...loanData, [name]: value });

    // Validate loan amount
    if (name === "loanAmount") {
      const error = validateLoanAmount(value);
      setValidationErrors({
        ...validationErrors,
        loanAmount: error,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User ID is required to submit a loan request.");
      return;
    }

    if (!isKycApproved) {
      toast.error("KYC verification is required to submit a loan request.");
      return;
    }

    const loanAmountError = validateLoanAmount(loanData.loanAmount);
    if (loanAmountError) {
      toast.error(loanAmountError);
      return;
    }

    try {
      await submitLoanRequest(loanData);
      toast.success("Loan application submitted successfully!");
      setStep(1);
      setLoanData({
        userId: userId,
        loanAmount: "",
        interestRate: "",
        duration: "",
        repaymentType: "one-time",
        milestones: 2,
      });
    } catch (error) {
      toast.error("Failed to submit loan application.");
    }
  };

  const handleNext = (e) => {
    e.preventDefault();

    const loanAmountError = validateLoanAmount(loanData.loanAmount);
    if (loanAmountError) {
      toast.error(loanAmountError);
      return;
    }

    setStep(2);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto "
        >
          <div className="max-w-3xl mx-auto">
            {!isKycApproved ? (
              <div className="bg-white rounded-lg shadow-lg p-8 transition-all duration-300">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    KYC Verification Required
                  </h2>
                  <div className="my-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-700 mb-4">
                      {getKycStatusMessage()}
                    </p>
                    <button
                      onClick={redirectToProfile}
                      className="bg-gray-800 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      {kycStatus === "notApplied"
                        ? "Apply for KYC"
                        : kycStatus === "pending"
                        ? "Check KYC Status"
                        : "Update KYC Information"}
                    </button>
                  </div>
                </div>
              </div>
            ) : step === 1 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 transition-all duration-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Apply for a Loan
                </h2>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 font-medium">
                    Loan Amount Range: Minimum Rs.{" "}
                    {MIN_LOAN_AMOUNT.toLocaleString()} to Maximum Rs.{" "}
                    {MAX_LOAN_AMOUNT.toLocaleString()} (5 lakhs)
                  </p>
                </div>

                <form onSubmit={handleNext}>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Amount (NPR)
                      </label>
                      <input
                        type="number"
                        name="loanAmount"
                        value={loanData.loanAmount}
                        onChange={handleInputChange}
                        min={MIN_LOAN_AMOUNT}
                        max={MAX_LOAN_AMOUNT}
                        required
                        className={`w-full px-4 py-2 border ${
                          validationErrors.loanAmount
                            ? "border-red-500 focus:ring-red-400"
                            : "border-gray-300 focus:ring-gray-400"
                        } rounded-md focus:ring-2 focus:border-transparent transition-all duration-200`}
                      />
                      {validationErrors.loanAmount && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.loanAmount}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interest Rate (% per annum)
                      </label>
                      <input
                        type="number"
                        name="interestRate"
                        value={loanData.interestRate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repayment Duration (days)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={loanData.duration}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repayment Type
                      </label>
                      <select
                        name="repaymentType"
                        value={loanData.repaymentType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                      >
                        <option value="one-time">One-time</option>
                        <option value="milestone">Milestone</option>
                      </select>
                    </div>

                    {loanData.repaymentType === "milestone" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Milestones
                        </label>
                        <select
                          name="milestones"
                          value={loanData.milestones}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                        >
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                        </select>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gray-800 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Loan Summary
                </h2>
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Loan Details
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Principal Amount:</span>{" "}
                        Rs.
                        {parseFloat(loanData.loanAmount || 0).toLocaleString()}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Interest Rate:</span>{" "}
                        {loanData.interestRate}%{" "}
                        <span className="text-sm text-gray-500">per annum</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Duration:</span>{" "}
                        {loanData.duration} days
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Interest Amount:</span>{" "}
                        Rs.
                        {calculateInterestAmount().toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">
                          Total Amount (Principal + Interest):
                        </span>{" "}
                        Rs.
                        {(
                          parseFloat(loanData.loanAmount || 0) +
                          calculateInterestAmount()
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Repayment Schedule
                    </h3>
                    <div className="space-y-3">
                      {calculateRepaymentSchedule().map((payment, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-md">
                          <p className="text-gray-600">
                            <span className="font-medium">
                              Payment {index + 1}:
                            </span>{" "}
                            Rs.
                            {payment.amount.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Due Date:</span>{" "}
                            {formatDate(payment.date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoanForm;
