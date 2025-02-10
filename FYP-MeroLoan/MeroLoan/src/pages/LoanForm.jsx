import React, { useState } from "react";
import { useLoanStore } from "../store/loanStore";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/date";
import Navbar from "@/components/Navbar";
import { toast } from "react-toastify";

const LoanForm = () => {
  const { submitLoanRequest, deleteLoanRequest } = useLoanStore();
  const { user } = useAuthStore();
  const userId = user?._id;

  const [step, setStep] = useState(1);
  const [loanData, setLoanData] = useState({
    userId: userId || "",
    loanAmount: "",
    interestRate: "",
    duration: "",
    repaymentType: "one-time",
    milestones: 2,
  });

  const calculateRepaymentSchedule = () => {
    const amount = parseFloat(loanData.loanAmount);
    const rate = parseFloat(loanData.interestRate);
    const totalAmount = amount + (amount * rate) / 100;
    const startDate = new Date();
    const durationDays = parseInt(loanData.duration);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanData({ ...loanData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User ID is required to submit a loan request.");
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
    setStep(2);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 pt-32">
        <div className="max-w-3xl mx-auto">
          {step === 1 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Apply for a Loan
              </h2>
              <form onSubmit={handleNext}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount
                    </label>
                    <input
                      type="number"
                      name="loanAmount"
                      value={loanData.loanAmount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (%)
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
                      <span className="font-medium">Amount:</span> $
                      {parseFloat(loanData.loanAmount).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Interest Rate:</span>{" "}
                      {loanData.interestRate}%
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Duration:</span>{" "}
                      {loanData.duration} days
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">
                        Total Amount (with interest):
                      </span>{" "}
                      $
                      {(
                        parseFloat(loanData.loanAmount) +
                        (parseFloat(loanData.loanAmount) *
                          parseFloat(loanData.interestRate)) /
                          100
                      ).toLocaleString()}
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
                          ${payment.amount.toLocaleString()}
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
      </div>
    </>
  );
};

export default LoanForm;
