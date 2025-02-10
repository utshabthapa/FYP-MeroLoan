// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// const PaymentSuccess = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [transactionDetails, setTransactionDetails] = useState(null);

//   // Helper function to decode Base64-encoded strings
//   const decodeBase64 = (str) => {
//     str = str.replace(/-/g, "+").replace(/_/g, "/");
//     while (str.length % 4) str += "=";
//     return atob(str);
//   };

//   useEffect(() => {
//     const processTransaction = async () => {
//       const params = new URLSearchParams(location.search);
//       const encodedData = params.get("data");

//       if (!encodedData) {
//         // If no data is provided, navigate to failure page
//         navigate("/payment-failure", {
//           state: { message: "Missing transaction data" },
//         });
//         return;
//       }

//       try {
//         // Decode and parse the transaction data
//         const decodedData = JSON.parse(decodeBase64(encodedData));
//         console.log("Decoded Data:", decodedData);

//         // Extract necessary details
//         const transactionId = decodedData.transaction_uuid;
//         const totalAmount = decodedData.total_amount;

//         // Set the transaction details for display
//         setTransactionDetails({
//           transactionId,
//           totalAmount,
//         });
//       } catch (error) {
//         console.error("Error processing transaction:", error);
//         navigate("/payment-failure", { state: { message: error.message } });
//       }
//     };

//     processTransaction();
//   }, [location.search, navigate]);

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//       {transactionDetails ? (
//         <div className="text-center">
//           <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
//           <p>Your payment has been processed successfully.</p>
//           <div className="mt-4">
//             <p>
//               <strong>Transaction ID:</strong>{" "}
//               {transactionDetails.transactionId}
//             </p>
//             <p>
//               <strong>Total Amount Paid:</strong>{" "}
//               {transactionDetails.totalAmount}
//             </p>
//           </div>
//           <p className="mt-4">Thank you for your payment.</p>
//         </div>
//       ) : (
//         <div className="text-center">
//           <h1 className="text-2xl font-bold mb-4">Processing Payment...</h1>
//           <p>Please wait while we process your payment details.</p>
//           <div className="mt-4">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PaymentSuccess;

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePaymentStore } from "../store/paymentStore";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactionDetails, setTransactionDetails] = useState(null);
  // Get the paymentSuccess action from the payment store
  const paymentSuccess = usePaymentStore((state) => state.paymentSuccess);

  // Helper function to decode Base64-encoded strings
  const decodeBase64 = (str) => {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    return atob(str);
  };

  useEffect(() => {
    const processTransaction = async () => {
      const params = new URLSearchParams(location.search);
      const encodedData = params.get("data");

      if (!encodedData) {
        // If no data is provided, navigate to failure page
        navigate("/payment-failure", {
          state: { message: "Missing transaction data" },
        });
        return;
      }

      try {
        // Decode and parse the transaction data
        const decodedData = JSON.parse(decodeBase64(encodedData));
        console.log("Decoded Data:", decodedData);

        // Extract necessary details
        const transactionId = decodedData.transaction_uuid;
        const totalAmount = decodedData.total_amount;

        // Call the payment success endpoint via the store to update the transaction
        // and activate the associated loan.
        await paymentSuccess(transactionId);

        // Set the transaction details for display after successful backend update
        setTransactionDetails({
          transactionId,
          totalAmount,
        });
      } catch (error) {
        console.error("Error processing transaction:", error);
        navigate("/payment-failure", {
          state: { message: error.message || "Payment processing error" },
        });
      }
    };

    processTransaction();
  }, [location.search, navigate, paymentSuccess]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {transactionDetails ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
          <p>Your payment has been processed successfully.</p>
          <div className="mt-4">
            <p>
              <strong>Transaction ID:</strong>{" "}
              {transactionDetails.transactionId}
            </p>
            <p>
              <strong>Total Amount Paid:</strong>{" "}
              {transactionDetails.totalAmount}
            </p>
          </div>
          <p className="mt-4">Thank you for your payment.</p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Processing Payment...</h1>
          <p>Please wait while we process your payment details.</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
