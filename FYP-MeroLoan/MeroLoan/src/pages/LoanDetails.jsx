import React, { act, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLoanStore } from "../store/loanStore";
import { formatDate } from "../utils/date";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { usePaymentStore } from "@/store/paymentStore";
import { motion } from "framer-motion";

const LoanDetails = () => {
  const { loanId } = useParams();
  const { loans, deleteLoan } = useLoanStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [loan, setLoan] = useState(null);
  const [withInsurance, setWithInsurance] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const kycStatus = user?.kycStatus || "notApplied";
  const userId = user?._id;
  const { initiateEsewaPayment, initiateRepayment, isProcessing } =
    usePaymentStore();

  const isKycApproved = kycStatus === "approved";

  useEffect(() => {
    const foundLoan = loans.find((loan) => loan._id === loanId);
    if (foundLoan) {
      setLoan(foundLoan);
    } else {
      navigate("/loan-requests");
    }
  }, [loanId, loans, navigate]);

  const handleDeleteLoan = async () => {
    if (!window.confirm("Are you sure you want to delete this loan request?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteLoan(loanId);
      navigate("/userLoanRequests");
    } catch (error) {
      console.error("Failed to delete loan:", error);
      alert("Failed to delete loan request. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEsewaPayment = async (
    paymentAmount,
    isMilestone = false,
    milestoneNumber = null
  ) => {
    if (!loan || !user) {
      alert("Loan or user data is missing.");
      return;
    }

    // Check if user's KYC is approved before proceeding
    if (!isKycApproved) {
      alert(
        "Your KYC must be approved before you can lend money. Please complete your KYC verification first."
      );
      navigate(`/kyc-form/${user._id}`);
      return;
    }

    try {
      const paymentDetails = {
        loanId: loan._id,
        amount: paymentAmount,
        insuranceAdded: withInsurance,
        lenderId: user._id,
        borrowerId: loan.userId._id,
        isMilestonePayment: isMilestone,
        milestoneNumber: milestoneNumber,
      };

      // Initiate eSewa Payment
      const response = await initiateEsewaPayment(paymentDetails);

      if (!response?.paymentPayload) {
        throw new Error("Payment payload is missing from the response.");
      }

      const { paymentPayload } = response;
      console.log("eSewa Payment Payload:", paymentPayload);

      // Create form for eSewa payment
      const form = document.createElement("form");
      form.method = "POST";
      form.action = import.meta.env.VITE_ESEWA_PAYMENT_URL;
      form.enctype = "application/x-www-form-urlencoded";
      form.style.display = "none";

      const orderedFields = [
        "amount",
        "tax_amount",
        "product_service_charge",
        "product_delivery_charge",
        "total_amount",
        "transaction_uuid",
        "product_code",
        "success_url",
        "failure_url",
        "signed_field_names",
        "signature",
      ];

      orderedFields.forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentPayload[key];
        form.appendChild(input);
      });

      // Prepare Active Contract Creation Details
      const activeContractDetails = {
        loan: loan._id,
        lender: user._id,
        borrower: loan.userId._id,
        amount: paymentAmount,
        insuranceAdded: withInsurance,
        isMilestonePayment: isMilestone,
        transactionUuid: paymentPayload.transaction_uuid,
        milestoneNumber: isMilestone ? milestoneNumber : null,
      };

      // Store the active contract creation details for later processing
      localStorage.setItem(
        "pendingActiveContract",
        JSON.stringify(activeContractDetails)
      );

      // Submit eSewa payment form
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert(
        `Payment initiation failed: ${
          error.response?.data?.message || error.message
        }\nCheck the console for details.`
      );
    }
  };

  // Updated function to handle repayments by borrowers
  const handleRepayment = async (
    paymentAmount,
    isMilestone = false,
    milestoneNumber = null
  ) => {
    if (!loan || !user) {
      alert("Loan or user data is missing.");
      return;
    }

    try {
      // Round the payment amount to a whole number (no decimal places)
      const roundedAmount = Math.ceil(paymentAmount);

      const repaymentDetails = {
        loanId: loan._id,
        amount: roundedAmount,
        borrowerId: user._id,
        lenderId: loan.activeContract?.lender || null,
        isMilestonePayment: isMilestone,
        milestoneNumber: milestoneNumber,
      };

      // Initiate eSewa Payment for repayment
      const response = await initiateRepayment(repaymentDetails);

      if (!response?.paymentPayload) {
        throw new Error("Payment payload is missing from the response.");
      }

      const { paymentPayload } = response;
      console.log("eSewa Repayment Payload:", paymentPayload);

      // Create form for eSewa payment
      const form = document.createElement("form");
      form.method = "POST";
      form.action = import.meta.env.VITE_ESEWA_PAYMENT_URL;
      form.enctype = "application/x-www-form-urlencoded";
      form.style.display = "none";

      const orderedFields = [
        "amount",
        "tax_amount",
        "product_service_charge",
        "product_delivery_charge",
        "total_amount",
        "transaction_uuid",
        "product_code",
        "success_url",
        "failure_url",
        "signed_field_names",
        "signature",
      ];

      orderedFields.forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentPayload[key];
        form.appendChild(input);
      });

      // Prepare Repayment Details
      const repaymentProcessDetails = {
        loan: loan._id,
        borrower: user._id,
        lender: loan.activeContract?.lender || null,
        amount: paymentAmount,
        isMilestonePayment: isMilestone,
        transactionUuid: paymentPayload.transaction_uuid,
        milestoneNumber: isMilestone ? milestoneNumber : null,
      };

      // Store the repayment details for later processing
      localStorage.setItem(
        "pendingRepayment",
        JSON.stringify(repaymentProcessDetails)
      );

      // Submit eSewa payment form
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Repayment initiation failed:", error);
      alert(
        `Repayment initiation failed: ${
          error.response?.data?.message || error.message
        }\nCheck the console for details.`
      );
    }
  };

  // Updated function to calculate repayment schedule with annual interest rate
  // Updated function to calculate repayment schedule with annual interest rate
  const calculateRepaymentSchedule = () => {
    if (!loan) return [];

    const principal = parseFloat(loan.loanAmount);
    // For borrower repayment, always use the original interest rate, not the insurance-adjusted one
    const annualInterestRate = parseFloat(loan.interestRate);
    const durationDays = parseInt(loan.duration);

    // Calculate interest for the actual loan period (convert annual rate to daily rate)
    const interestAmount =
      (principal * annualInterestRate * durationDays) / (100 * 365);
    const totalAmount = principal + interestAmount;

    if (loan.repaymentType === "one-time") {
      const endDate = new Date(
        new Date(loan.appliedAt).getTime() + durationDays * 24 * 60 * 60 * 1000
      );
      // Round up the amount to ensure no decimals
      return [{ date: endDate, amount: Math.ceil(totalAmount) }];
    } else {
      const milestones = parseInt(loan.milestones);
      const amountPerMilestone = totalAmount / milestones;
      const daysPerMilestone = durationDays / milestones;
      const startDate = new Date(loan.appliedAt);

      return Array.from({ length: milestones }, (_, index) => ({
        date: new Date(
          startDate.getTime() +
            daysPerMilestone * (index + 1) * 24 * 60 * 60 * 1000
        ),
        // Round up the amount to ensure no decimals
        amount: Math.ceil(amountPerMilestone),
      }));
    }
  };

  // This function is for lender's perspective (with potential insurance discount)
  const getAdjustedInterestRate = () => {
    const baseRate = parseFloat(loan.interestRate);
    return withInsurance ? baseRate - baseRate * 0.15 : baseRate;
  };

  // Calculate interest amount for display
  const calculateInterestAmount = () => {
    const principal = parseFloat(loan.loanAmount);
    // For display purposes, use the appropriate interest rate
    const isUserLoan = user?._id === loan.userId._id;
    // Borrowers always see the original interest rate
    const annualRate = isUserLoan
      ? parseFloat(loan.interestRate)
      : getAdjustedInterestRate();
    const durationDays = parseInt(loan.duration);

    return (principal * annualRate * durationDays) / (100 * 365);
  };

  // Update the renderActionButton function to handle KYC validation for lenders
  const renderActionButton = () => {
    const isUserLoan = user?._id === loan.userId._id;

    // For lenders viewing someone else's loan
    if (!isUserLoan) {
      const isMilestonePayment = loan.repaymentType === "milestone";
      const milestoneNumber = isMilestonePayment ? 1 : null;

      // Check if user's KYC is approved
      if (!isKycApproved) {
        return (
          <div className="flex flex-col space-y-2 items-center">
            <button
              onClick={() => navigate(`/kyc-form/${user._id}`)}
              className="px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200"
            >
              Complete KYC Verification First
            </button>
            <p className="text-sm text-gray-600 italic">
              You need KYC approval before lending
            </p>
          </div>
        );
      }

      return (
        <button
          onClick={() =>
            handleEsewaPayment(
              loan.loanAmount,
              isMilestonePayment,
              milestoneNumber
            )
          }
          disabled={isProcessing}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Lend via eSewa"}
        </button>
      );
    }

    // For borrowers viewing their own loan
    if (loan.status === "completed") {
      return (
        <div className="px-6 py-3 bg-green-100 text-green-800 rounded-md font-medium border border-green-200 text-center">
          Loan Completed
        </div>
      );
    } else if (loan.status !== "active") {
      return (
        <button
          onClick={handleDeleteLoan}
          disabled={isDeleting}
          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete Loan Request"}
        </button>
      );
    }

    // Handle borrower repayment actions for active loans
    const repaymentSchedule = calculateRepaymentSchedule();

    // Find the active contract to get actual repayment schedule
    const activeContract = loan.activeContract;

    // Handle case where activeContract or repaymentSchedule is missing
    if (!activeContract || !activeContract.repaymentSchedule) {
      return (
        <button
          disabled
          className="px-6 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed"
        >
          No Active Contract Found
        </button>
      );
    }

    // Find the next unpaid milestone
    const nextUnpaidMilestone =
      activeContract?.repaymentSchedule.findIndex(
        (payment) => payment.status === "pending"
      ) ?? -1;

    if (loan.repaymentType === "one-time") {
      // Calculate total amount with interest
      const principal = parseFloat(loan.loanAmount);
      const annualRate = parseFloat(loan.interestRate); // Original interest rate for borrower
      const durationDays = parseInt(loan.duration);
      const interestAmount =
        (principal * annualRate * durationDays) / (100 * 365);
      const totalAmount = principal + interestAmount;
      // Round up the total amount to ensure no decimals
      const roundedTotalAmount = Math.ceil(totalAmount);

      return (
        <button
          onClick={() => handleRepayment(roundedTotalAmount, false)}
          disabled={isProcessing}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Pay Loan with Interest"}
        </button>
      );
    } else if (nextUnpaidMilestone !== -1) {
      // For milestone payments, use the correct calculated amount for each milestone
      const totalAmount =
        parseFloat(loan.loanAmount) +
        (parseFloat(loan.loanAmount) *
          parseFloat(loan.interestRate) *
          parseInt(loan.duration)) /
          (100 * 365);
      const milestoneAmount = totalAmount / parseInt(loan.milestones);
      // Round up the milestone amount to ensure no decimals
      const roundedMilestoneAmount = Math.ceil(milestoneAmount);

      return (
        <button
          onClick={() =>
            handleRepayment(
              roundedMilestoneAmount,
              true,
              nextUnpaidMilestone + 1
            )
          }
          disabled={isProcessing}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
        >
          {isProcessing
            ? "Processing..."
            : `Pay Milestone ${nextUnpaidMilestone + 1}`}
        </button>
      );
    }

    return (
      <button
        disabled
        className="px-6 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed"
      >
        All Payments Completed
      </button>
    );
  };

  if (!loan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  const isUserLoan = user?._id === loan.userId._id;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto "
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Loan Details</h1>
                {!isUserLoan && isKycApproved && (
                  <button
                    onClick={() => setWithInsurance(!withInsurance)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      withInsurance
                        ? "bg-white border-2 border-gray-800 text-gray-800"
                        : "bg-gray-700 border-2 border-gray-800 text-white hover:bg-gray-600"
                    }`}
                  >
                    {withInsurance ? "✓ With Insurance" : "Add Insurance"}
                  </button>
                )}
                {!isUserLoan && !isKycApproved && (
                  <div className="px-4 py-2 bg-gray-700 text-white rounded-lg opacity-70">
                    Insurance available after KYC
                  </div>
                )}
              </div>

              {!isUserLoan && !isKycApproved && (
                <div className="bg-yellow-50 p-4 border-b border-yellow-100">
                  <div className="flex items-center text-yellow-800">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p>
                      You need to complete KYC verification before you can lend
                      money on our platform.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Basic Information
                      </h2>
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium">Name:</span>{" "}
                          {loan.userId.name}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Email:</span>{" "}
                          {loan.userId.email}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Applied On:</span>{" "}
                          {formatDate(loan.appliedAt)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Status:</span>
                          <span className="ml-2 px-2 py-1 text-sm rounded-full bg-gray-200">
                            {loan.status || "Pending"}
                          </span>
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
                          <span className="font-medium">Amount:</span>
                          &nbsp;Rs.{" "}
                          {parseFloat(loan.loanAmount).toLocaleString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Interest Rate:</span>{" "}
                          <span
                            className={
                              !isUserLoan && withInsurance ? "line-through" : ""
                            }
                          >
                            {loan.interestRate}%
                          </span>
                          {!isUserLoan && withInsurance && (
                            <span className="ml-2 text-gray-800">
                              {getAdjustedInterestRate().toFixed(2)}%
                            </span>
                          )}
                          <span className="ml-1 text-sm text-gray-500">
                            per annum
                          </span>
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Duration:</span>{" "}
                          {loan.duration} days
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Interest Amount:</span>{" "}
                          Rs.&nbsp;
                          {calculateInterestAmount().toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Total Amount:</span>{" "}
                          Rs.&nbsp;
                          {(
                            parseFloat(loan.loanAmount) +
                            calculateInterestAmount()
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Repayment Schedule
                  </h2>
                  <div className="space-y-4">
                    {calculateRepaymentSchedule().map((payment, index) => (
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
                              Rs.&nbsp;
                              {payment.amount.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-500">
                                {loan.repaymentType === "milestone"
                                  ? `Milestone ${index + 1} of ${
                                      loan.milestones
                                    }`
                                  : "Full Payment"}
                              </p>
                              {payment.paid && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  Paid
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() =>
                      navigate(
                        isUserLoan ? "/userLoanRequests" : "/loan-requests"
                      )
                    }
                    className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    {isUserLoan ? "Back to My Loans" : "Back to Loan Requests"}
                  </button>

                  {renderActionButton()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoanDetails;
