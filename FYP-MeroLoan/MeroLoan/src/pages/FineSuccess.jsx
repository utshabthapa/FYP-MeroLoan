"use client";

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { CheckCircle, DollarSign, Home, User, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";

// Define API URL based on environment
const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/fines"
    : "/api/fines";

const FineSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactionDetails, setTransactionDetails] = React.useState(null);
  const [fineProcessingStatus, setFineProcessingStatus] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);

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

  // Function to directly process the payment without using store functions
  // const processFinePayment = async (transactionId) => {
  //   try {
  //     // First, try to get the fine details from localStorage
  //     const pendingFineJson = localStorage.getItem("pendingFinePayment");
  //     let pendingFine = null;

  //     if (pendingFineJson) {
  //       try {
  //         pendingFine = JSON.parse(pendingFineJson);
  //         console.log("Found pending fine in localStorage:", pendingFine);
  //       } catch (e) {
  //         console.error("Error parsing pending fine data:", e);
  //       }
  //     }

  //     // Make a direct API call to the backend
  //     const response = await axios.get(`${API_URL}/payment-success`, {
  //       params: { transaction_uuid: transactionId },
  //       withCredentials: true,
  //     });

  //     console.log("Payment success API response:", response.data);

  //     // Clear localStorage after successful verification
  //     if (pendingFineJson) {
  //       localStorage.removeItem("pendingFinePayment");
  //     }

  //     return response.data;
  //   } catch (error) {
  //     console.error("Error in processFinePayment:", error);

  //     // If we have pending fine data in localStorage, use it as fallback
  //     const pendingFineJson = localStorage.getItem("pendingFinePayment");
  //     if (pendingFineJson) {
  //       try {
  //         const pendingFine = JSON.parse(pendingFineJson);
  //         console.log("Using localStorage data as fallback:", pendingFine);

  //         // Return a structured object similar to what the API would return
  //         return {
  //           fineId: pendingFine.fineId,
  //           amount: pendingFine.amount,
  //           transactionId: transactionId,
  //           paidAt: new Date().toISOString(),
  //           _usingFallback: true,
  //         };
  //       } catch (e) {
  //         console.error("Error parsing pending fine data:", e);
  //       }
  //     }

  //     // Rethrow the error if we couldn't use the fallback
  //     throw error;
  //   }
  // };

  const processFinePayment = async (transactionId) => {
    try {
      // First, try to get the fine details from localStorage
      const pendingFineJson = localStorage.getItem("pendingFinePayment");
      let pendingFine = null;
      let fineId = null;

      if (pendingFineJson) {
        try {
          pendingFine = JSON.parse(pendingFineJson);
          console.log("Found pending fine in localStorage:", pendingFine);
          fineId = pendingFine.fineId; // Extract fineId from localStorage data
        } catch (e) {
          console.error("Error parsing pending fine data:", e);
        }
      }

      // Prepare params object with transaction_uuid and fineId (if available)
      const params = { transaction_uuid: transactionId };
      if (fineId) {
        params.fineId = fineId;
      }

      // Make a direct API call to the backend with both parameters
      const response = await axios.get(`${API_URL}/payment-success`, {
        params: params,
        withCredentials: true,
      });

      console.log("Payment success API response:", response.data);

      // Clear localStorage after successful verification
      if (pendingFineJson) {
        localStorage.removeItem("pendingFinePayment");
      }

      return response.data;
    } catch (error) {
      console.error("Error in processFinePayment:", error);

      // If we have pending fine data in localStorage, use it as fallback
      const pendingFineJson = localStorage.getItem("pendingFinePayment");
      if (pendingFineJson) {
        try {
          const pendingFine = JSON.parse(pendingFineJson);
          console.log("Using localStorage data as fallback:", pendingFine);

          // Return a structured object similar to what the API would return
          return {
            fineId: pendingFine.fineId,
            amount: pendingFine.amount,
            transactionId: transactionId,
            paidAt: new Date().toISOString(),
            _usingFallback: true,
          };
        } catch (e) {
          console.error("Error parsing pending fine data:", e);
        }
      }

      // Rethrow the error if we couldn't use the fallback
      throw error;
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
        let fineId = params.get("fineId");

        // If not found, try the encoded data approach
        if (!transactionId) {
          const encodedData = params.get("data");
          if (encodedData) {
            try {
              const decodedString = decodeBase64(encodedData);
              const decodedData = JSON.parse(decodedString);
              transactionId = decodedData.transaction_uuid;
              totalAmount = decodedData.total_amount;
              fineId = decodedData.fineId;
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

        // Process fine payment directly
        try {
          console.log("Processing transaction:", transactionId);
          const result = await processFinePayment(transactionId);

          // Extract data from the API response
          const fineData = result.data || result;

          setFineProcessingStatus(
            fineData._usingFallback ? "fine-not-found" : "paid"
          );
          setTransactionDetails({
            transactionId,
            totalAmount: fineData.amount || totalAmount,
            fineId: fineData.fineId || fineId,
            fineAmount: fineData.amount,
            originalAmount: fineData.originalAmount,
            daysLate: fineData.daysLate,
            paidAt: fineData.paidAt || new Date().toISOString(),
            usingFallback: fineData._usingFallback,
          });
        } catch (fineError) {
          console.log("Fine payment processing error:", fineError);

          // Check if this is a "Fine not found" error
          const errorMessage =
            fineError.response?.data?.message || fineError.message || "";
          const isFineNotFound = errorMessage.includes("Fine not found");

          if (isFineNotFound) {
            console.log("Fine not found, using URL parameters as fallback");

            // Use URL parameters as fallback
            setFineProcessingStatus("fine-not-found");
            setTransactionDetails({
              transactionId,
              totalAmount,
              fineId,
              paidAt: new Date().toISOString(),
              usingFallback: true,
            });
          } else {
            // For other errors, throw to be caught by the outer catch block
            throw fineError;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error processing transaction:", error);

        // Special handling for "Fine not found" errors with retry logic
        const errorMessage =
          error.response?.data?.message || error.message || "";
        const isFineNotFound = errorMessage.includes("Fine not found");

        if (isFineNotFound && retryCount < 3) {
          console.log(`Transaction processing retry (${retryCount + 1}/3)...`);
          setRetryCount((prevCount) => prevCount + 1);
          setTimeout(() => processTransaction(), 2000); // Retry after 2 seconds
          return;
        }

        // If we've reached max retries but have transaction info from URL,
        // still show success but note the fine issue
        const params = new URLSearchParams(location.search);
        const transactionId =
          params.get("transaction_uuid") || params.get("data");

        if (transactionId && isFineNotFound) {
          setTransactionDetails({
            transactionId:
              typeof transactionId === "string" && transactionId.length > 20
                ? transactionId.substring(0, 20) + "..."
                : transactionId,
            totalAmount: params.get("total_amount") || "Amount processing",
            paidAt: new Date().toISOString(),
            usingFallback: true,
          });
          setFineProcessingStatus("fine-not-found");
          setIsLoading(false);
          return;
        }

        setError(errorMessage || "Fine payment processing error");
        setIsLoading(false);
      }
    };

    processTransaction();
  }, [location.search, retryCount]);

  // Only navigate to failure page if we're not loading, have an error, and
  // exceeded retries with no transaction details
  React.useEffect(() => {
    if (!isLoading && error && retryCount >= 3 && !transactionDetails) {
      navigate("/payment-failure", {
        state: { message: error, isFinePayment: true },
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
                  Processing Fine Payment
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
                  Your fine payment has been processed successfully.
                </p>
                {fineProcessingStatus === "paid" && (
                  <div className="bg-green-100 rounded-lg p-3 mb-4">
                    <p className="text-green-700">
                      Thank you for paying your fine. The late payment has been
                      cleared.
                    </p>
                  </div>
                )}
                {fineProcessingStatus === "fine-not-found" && (
                  <div className="bg-yellow-100 rounded-lg p-3 mb-4">
                    <p className="text-yellow-700">
                      Payment successful, but we couldn't find the associated
                      fine. Your payment should still be recorded.
                    </p>
                    {transactionDetails.usingFallback && (
                      <p className="text-yellow-700 text-sm mt-1">
                        (Using transaction details from payment gateway)
                      </p>
                    )}
                  </div>
                )}
                <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                  {transactionDetails.originalAmount && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Original Amount
                        </span>
                        <span className="text-gray-900">
                          Rs. {transactionDetails.originalAmount?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Fine Percentage
                        </span>
                        <span className="text-red-600">
                          {(
                            (transactionDetails.fineAmount /
                              transactionDetails.originalAmount) *
                            100
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Days Late
                        </span>
                        <span className="text-gray-900">
                          {transactionDetails.daysLate} days
                        </span>
                      </div>
                    </>
                  )}
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
                      Rs. {transactionDetails.totalAmount}
                    </span>
                  </div>
                  {transactionDetails.paidAt && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Paid At</span>
                      <span className="text-gray-900">
                        {new Date(transactionDetails.paidAt).toLocaleString()}
                      </span>
                    </div>
                  )}
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
                  icon={FileText}
                  label="Fines"
                  onClick={() => navigate("/fines")}
                />
              </div>
            </div>
          ) : error ? (
            <div className="text-center space-y-6">
              <DollarSign
                className="mx-auto w-16 h-16 text-red-600"
                strokeWidth={1.5}
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Payment Processing Issue
                </h1>
                <p className="text-gray-600 mb-4">
                  There was an issue processing your payment.
                </p>
                <div className="bg-red-100 rounded-lg p-3 mb-4">
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Return to Dashboard
                </button>
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

export default FineSuccess;
