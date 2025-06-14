import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePaymentStore } from "../store/paymentStore";
import { useActiveContractStore } from "../store/activeContractStore"; // New store
import { CheckCircle, DollarSign, Home, User, Layers } from "lucide-react";
import Navbar from "@/components/Navbar";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactionDetails, setTransactionDetails] = React.useState(null);
  const [contractCreationStatus, setContractCreationStatus] =
    React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const paymentSuccess = usePaymentStore((state) => state.paymentSuccess);
  const createActiveContract = useActiveContractStore(
    (state) => state.createActiveContract
  );

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
    const processTransaction = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams(location.search);

        // First try to get the direct transaction_uuid parameter
        let transactionId = params.get("transaction_uuid");
        let totalAmount = params.get("total_amount");

        // If not found, try the encoded data approach
        if (!transactionId) {
          const encodedData = params.get("data");
          if (encodedData) {
            try {
              const decodedString = decodeBase64(encodedData);
              const decodedData = JSON.parse(decodedString);
              transactionId = decodedData.transaction_uuid;
              totalAmount = decodedData.total_amount;
            } catch (parseError) {
              console.error("Data parsing error:", parseError);
            }
          }
        }

        if (!transactionId) {
          // Log all available parameters to see what's actually being sent
          console.log(
            "All URL parameters:",
            Object.fromEntries(params.entries())
          );
          throw new Error("Missing transaction ID in response data");
        }

        // Process payment success - ignore "Loan not found" errors
        try {
          await paymentSuccess(transactionId);
        } catch (paymentError) {
          console.log("Payment success API error:", paymentError);
          // If the error is "Loan not found" but we have transaction details, continue
          if (
            paymentError.message?.includes("Loan not found") &&
            transactionId
          ) {
            console.log("Continuing despite 'Loan not found' error");
            // We'll continue with the transaction ID we have
          } else {
            throw paymentError; // Rethrow if it's a different error
          }
        }

        // Retrieve and process pending active contract
        const pendingContractJson = localStorage.getItem(
          "pendingActiveContract"
        );

        if (pendingContractJson) {
          try {
            const pendingContract = JSON.parse(pendingContractJson);

            // Add transaction details to the contract creation payload
            pendingContract.transactionId = transactionId;

            // Create active contract
            const activeContract = await createActiveContract(pendingContract);

            // Clear the pending contract from localStorage
            localStorage.removeItem("pendingActiveContract");

            setContractCreationStatus("success");
          } catch (contractError) {
            console.error("Contract creation error:", contractError);

            // Check if this is a "loan not found" error
            if (
              contractError.message?.includes("Loan not found") &&
              retryCount < 3
            ) {
              // We'll retry after a delay since the payment might still be processing
              console.log(
                `Retrying contract creation (${retryCount + 1}/3)...`
              );
              setRetryCount((prevCount) => prevCount + 1);
              setTimeout(() => processTransaction(), 2000); // Retry after 2 seconds
              return; // Exit this attempt
            }

            setContractCreationStatus("error");
            // Don't redirect - still show payment success
          }
        }

        setTransactionDetails({
          transactionId,
          totalAmount,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error processing transaction:", error);

        // Special handling for "Loan not found" errors
        if (error.message?.includes("Loan not found") && retryCount < 3) {
          console.log(`Transaction processing retry (${retryCount + 1}/3)...`);
          setRetryCount((prevCount) => prevCount + 1);
          setTimeout(() => processTransaction(), 2000); // Retry after 2 seconds
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
          setContractCreationStatus("loan-not-found");
          setIsLoading(false);
          return;
        }

        setError(error.message || "Payment processing error");
        setIsLoading(false);
      }
    };

    processTransaction();
  }, [location.search, paymentSuccess, createActiveContract, retryCount]);

  // Only navigate to failure page if we're not loading, have an error, and
  // exceeded retries with no transaction details
  React.useEffect(() => {
    if (!isLoading && error && retryCount >= 3 && !transactionDetails) {
      navigate("/payment-failure", {
        state: { message: error },
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
                  Processing Payment
                </h1>
                <p className="text-gray-600">
                  Please wait while we process your payment details.
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
                  Payment Successful
                </h1>
                <p className="text-gray-600 mb-4">
                  Your payment has been processed successfully.
                </p>
                {contractCreationStatus === "success" && (
                  <div className="bg-green-100 rounded-lg p-3 mb-4">
                    <p className="text-green-700">
                      Active contract created successfully
                    </p>
                  </div>
                )}
                {contractCreationStatus === "error" && (
                  <div className="bg-yellow-100 rounded-lg p-3 mb-4">
                    <p className="text-yellow-700">
                      Payment successful, but there was an issue creating the
                      contract.
                    </p>
                  </div>
                )}
                {contractCreationStatus === "loan-not-found" && (
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
                  icon={Layers}
                  label="Loans"
                  onClick={() => navigate("/loan-requests")}
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
                  We're waiting for your payment details to arrive.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
