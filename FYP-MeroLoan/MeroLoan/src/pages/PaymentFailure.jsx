// PaymentFailure.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoanStore } from "../store/loanStore";

const PaymentFailure = () => {
  const navigate = useNavigate();
  const { error } = useLoanStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorMessage = params.get("message") || "Payment processing failed";
    // setError(error);

    // Cleanup error on unmount
    // return () => setError(null);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
        <div className="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          {error ||
            "There was an error processing your payment. Please try again."}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/loan-requests")}
            className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Loans
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
