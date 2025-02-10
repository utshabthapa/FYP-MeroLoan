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
  const paymentSuccess = usePaymentStore((state) => state.paymentSuccess);
  const createActiveContract = useActiveContractStore(
    (state) => state.createActiveContract
  );

  const decodeBase64 = (str) => {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    return atob(str);
  };

  React.useEffect(() => {
    const processTransaction = async () => {
      const params = new URLSearchParams(location.search);
      const encodedData = params.get("data");

      if (!encodedData) {
        navigate("/payment-failure", {
          state: { message: "Missing transaction data" },
        });
        return;
      }

      try {
        const decodedData = JSON.parse(decodeBase64(encodedData));
        const transactionId = decodedData.transaction_uuid;
        const totalAmount = decodedData.total_amount;

        // Process payment success
        await paymentSuccess(transactionId);

        // Retrieve and process pending active contract
        const pendingContractJson = localStorage.getItem(
          "pendingActiveContract"
        );

        if (pendingContractJson) {
          const pendingContract = JSON.parse(pendingContractJson);

          // Add transaction details to the contract creation payload
          pendingContract.transactionId = transactionId;

          // Create active contract
          const activeContract = await createActiveContract(pendingContract);

          // Clear the pending contract from localStorage
          localStorage.removeItem("pendingActiveContract");

          setContractCreationStatus("success");
        }

        setTransactionDetails({
          transactionId,
          totalAmount,
        });
      } catch (error) {
        console.error("Error processing transaction:", error);
        setContractCreationStatus("error");
        navigate("/payment-failure", {
          state: { message: error.message || "Payment processing error" },
        });
      }
    };

    processTransaction();
  }, [location.search, navigate, paymentSuccess, createActiveContract]);

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-gray-100 shadow-2xl rounded-2xl p-8 max-w-md w-full transform transition-all duration-500 hover:scale-105">
          {transactionDetails ? (
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
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
