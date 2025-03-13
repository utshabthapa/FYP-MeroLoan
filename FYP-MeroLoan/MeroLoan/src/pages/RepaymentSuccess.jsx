import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePaymentStore } from "../store/paymentStore";
import {
  CheckCircle,
  DollarSign,
  Home,
  User,
  Layers,
  BarChart,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const RepaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactionDetails, setTransactionDetails] = React.useState(null);
  const [repaymentProcessingStatus, setRepaymentProcessingStatus] =
    React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const repaymentSuccess = usePaymentStore((state) => state.repaymentSuccess);

  const decodeBase64 = (str) => {
    try {
      // Handle URL-safe base64 by replacing characters
      str = str.replace(/-/g, "+").replace(/_/g, "/");
      // Add padding if needed
      while (str.length % 4) str += "=";
      return atob(str);
    } catch (error) {
      console.error("Base64 decoding error:", error);
      throw new Error("Invalid transaction data format");
    }
  };

  React.useEffect(() => {
    const processRepayment = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams(location.search);
        const encodedData = params.get("data");

        if (!encodedData) {
          setError("Missing transaction data");
          setIsLoading(false);
          return;
        }

        let decodedData;
        try {
          const decodedString = decodeBase64(encodedData);
          decodedData = JSON.parse(decodedString);
        } catch (parseError) {
          console.error("Data parsing error:", parseError);

          // Check if we have direct query parameters as fallback
          const transactionId = params.get("transaction_uuid");
          const totalAmount = params.get("total_amount");
          const loanId = params.get("loanId");

          if (transactionId) {
            decodedData = {
              transaction_uuid: transactionId,
              total_amount: totalAmount || "N/A",
              loanId: loanId,
            };
          } else {
            throw new Error("Failed to parse transaction data");
          }
        }

        const transactionId = decodedData.transaction_uuid;
        const totalAmount = decodedData.total_amount;
        const loanId = decodedData.loanId;

        if (!transactionId) {
          throw new Error("Missing transaction ID in response data");
        }

        // Process repayment success
        try {
          const repaymentResult = await repaymentSuccess(transactionId);

          // Check if all milestones are paid
          if (repaymentResult.allMilestonesPaid) {
            setRepaymentProcessingStatus("fully-paid");
          } else {
            setRepaymentProcessingStatus("partial-paid");
          }

          setTransactionDetails({
            transactionId,
            totalAmount,
            loanId: repaymentResult.loanId || loanId,
            activeContractId: repaymentResult.activeContractId,
          });
        } catch (repaymentError) {
          console.log("Repayment success API error:", repaymentError);

          // If the error is "Loan not found" but we have transaction details, continue
          if (
            repaymentError.message?.includes("Loan not found") &&
            transactionId
          ) {
            console.log("Continuing despite 'Loan not found' error");
            setRepaymentProcessingStatus("loan-not-found");
            setTransactionDetails({
              transactionId,
              totalAmount,
              loanId,
            });
          } else {
            throw repaymentError; // Rethrow if it's a different error
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error processing repayment:", error);

        // Special handling for "Loan not found" errors
        if (error.message?.includes("Loan not found") && retryCount < 3) {
          console.log(`Repayment processing retry (${retryCount + 1}/3)...`);
          setRetryCount((prevCount) => prevCount + 1);
          setTimeout(() => processRepayment(), 2000); // Retry after 2 seconds
          return;
        }

        // If we've reached max retries but have transaction info from URL,
        // still show success but note the loan issue
        const params = new URLSearchParams(location.search);
        const transactionId =
          params.get("transaction_uuid") || params.get("data");

        if (transactionId && error.message?.includes("Loan not found")) {
          setTransactionDetails({
            transactionId: transactionId.substring(0, 20) + "...", // Truncate if it's the encoded data
            totalAmount: params.get("total_amount") || "Amount processing",
          });
          setRepaymentProcessingStatus("loan-not-found");
          setIsLoading(false);
          return;
        }

        setError(error.message || "Repayment processing error");
        setIsLoading(false);
      }
    };

    processRepayment();
  }, [location.search, repaymentSuccess, retryCount]);

  // Only navigate to failure page if we're not loading, have an error, and
  // exceeded retries with no transaction details
  React.useEffect(() => {
    if (!isLoading && error && retryCount >= 3 && !transactionDetails) {
      navigate("/payment-failure", {
        state: { message: error, isRepayment: true },
      });
    }
  }, [isLoading, error, navigate, retryCount, transactionDetails]);

  const NavigationButton = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-center space-x-2 px-4 py-2 
        bg-gray-800 text-white rounded-lg hover:bg-gray-700 
        transition-colors duration-300 ease-in-out"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  // Show retry indicator
  const RetryIndicator = () => (
    <div className="text-yellow-600 text-sm mt-2">
      {retryCount > 0 && isLoading && (
        <div className="flex items-center justify-center space-x-2">
          <span>Retry attempt {retryCount}/3</span>
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-gray-100 shadow-2xl rounded-2xl p-8 max-w-md w-full transform transition-all duration-500 hover:scale-105">
          {isLoading ? (
            <div className="text-center space-y-6">
              <DollarSign
                className="mx-auto w-16 h-16 text-gray-600 animate-pulse"
                strokeWidth={1.5}
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Processing Repayment
                </h1>
                <p className="text-gray-600">
                  Please wait while we process your repayment details.
                </p>
                <RetryIndicator />
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-800"></div>
              </div>
            </div>
          ) : transactionDetails ? (
            <div className="text-center space-y-6">
              <CheckCircle
                className="mx-auto w-16 h-16 text-green-600"
                strokeWidth={1.5}
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Repayment Successful
                </h1>
                <p className="text-gray-600 mb-4">
                  Your repayment has been processed successfully.
                </p>

                {repaymentProcessingStatus === "fully-paid" && (
                  <div className="bg-green-100 rounded-lg p-3 mb-4">
                    <p className="text-green-700">
                      Congratulations! All repayments completed. Your loan is
                      now fully paid.
                    </p>
                  </div>
                )}

                {repaymentProcessingStatus === "partial-paid" && (
                  <div className="bg-blue-100 rounded-lg p-3 mb-4">
                    <p className="text-blue-700">
                      Payment recorded successfully. You have remaining
                      repayments on your schedule.
                    </p>
                  </div>
                )}

                {repaymentProcessingStatus === "loan-not-found" && (
                  <div className="bg-yellow-100 rounded-lg p-3 mb-4">
                    <p className="text-yellow-700">
                      Payment successful, but we couldn't find the associated
                      loan. Your payment should still be recorded.
                    </p>
                  </div>
                )}

                <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">
                      Transaction ID
                    </span>
                    <span className="text-gray-900">
                      {transactionDetails.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">
                      Total Amount
                    </span>
                    <span className="text-green-600 font-bold">
                      ${transactionDetails.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <NavigationButton
                  icon={Home}
                  label="Dashboard"
                  onClick={() => navigate("/dashboard")}
                />
                <NavigationButton
                  icon={User}
                  label="Profile"
                  onClick={() => navigate("/userProfile")}
                />
                <NavigationButton
                  icon={BarChart}
                  label="Repayments"
                  onClick={() => navigate("/repayments")}
                />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <DollarSign
                className="mx-auto w-16 h-16 text-yellow-600"
                strokeWidth={1.5}
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Waiting for Data
                </h1>
                <p className="text-gray-600">
                  We're waiting for your repayment details to arrive.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RepaymentSuccess;
