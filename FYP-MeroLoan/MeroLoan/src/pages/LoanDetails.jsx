import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLoanStore } from "../store/loanStore";
import { formatDate } from "../utils/date";
import Navbar from "@/components/Navbar";

const LoanDetails = () => {
  const { loanId } = useParams();
  const { loans } = useLoanStore();
  const [loan, setLoan] = useState(null);
  const [withInsurance, setWithInsurance] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const foundLoan = loans.find((loan) => loan._id === loanId);
    if (foundLoan) {
      setLoan(foundLoan);
    } else {
      navigate("/loan-requests");
    }
  }, [loanId, loans, navigate]);

  const getAdjustedInterestRate = () => {
    const baseRate = parseFloat(loan.interestRate);
    return withInsurance ? baseRate - baseRate * 0.15 : baseRate;
  };

  const calculateRepaymentSchedule = () => {
    if (!loan) return [];

    const amount = parseFloat(loan.loanAmount);
    const rate = getAdjustedInterestRate();
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Loan Details</h1>
            </div>

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
                        <span className="font-medium">Amount:</span> Rs.
                        {parseFloat(loan.loanAmount).toLocaleString()}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Interest Rate:</span>{" "}
                        <span className={withInsurance ? "line-through" : ""}>
                          {loan.interestRate}%
                        </span>
                        {withInsurance && (
                          <span className="ml-2 text-gray-800">
                            {getAdjustedInterestRate().toFixed(2)}%
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Duration:</span>{" "}
                        {loan.duration} days
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Total Amount:</span> Rs.
                        {(
                          parseFloat(loan.loanAmount) +
                          (parseFloat(loan.loanAmount) *
                            getAdjustedInterestRate()) /
                            100
                        ).toLocaleString()}
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
                            Rs.{payment.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {loan.repaymentType === "milestone"
                              ? `Milestone ${index + 1} of ${loan.milestones}`
                              : "Full Payment"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => navigate("/loan-requests")}
                  className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Back to Loan Requests
                </button>
                <button
                  onClick={() => setWithInsurance(!withInsurance)}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    withInsurance
                      ? "bg-white border-2 border-gray-800 text-gray-800"
                      : "bg-gray-800 border-2 border-gray-800 text-white hover:bg-gray-600"
                  }`}
                >
                  {withInsurance ? "✓ With Insurance" : "Add Insurance"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoanDetails;
