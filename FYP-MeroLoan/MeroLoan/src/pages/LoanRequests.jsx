import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoanStore } from "../store/loanStore";
import Navbar from "@/components/Navbar";
import { formatDate } from "../utils/date";

const LoanRequests = () => {
  const { loans, isLoading, error, fetchLoans } = useLoanStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleViewDetails = (loanId) => {
    navigate(`/loan-details/${loanId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-gray-800">
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  // Filter loans with status "not active"
  const filteredLoans = loans.filter((loan) => loan.status === "not active");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-24 px-4 pb-12">
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

            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-pulse space-y-4 w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : filteredLoans.length === 0 ? (
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
                {filteredLoans.map((loan) => (
                  <div
                    key={loan._id}
                    className="bg-gray-50 rounded-lg p-6 transition-all duration-200 hover:shadow-md hover:transform hover:-translate-y-1"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Applicant</p>
                        <p className="font-medium text-gray-800">
                          {loan.userId.name}
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
                        {/* <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            loan.status === "approved"
                              ? "bg-gray-800 text-white"
                              : loan.status === "rejected"
                              ? "bg-gray-200 text-gray-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {loan.status || "Pending"}
                        </span> */}
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
      </div>
    </>
  );
};

export default LoanRequests;
