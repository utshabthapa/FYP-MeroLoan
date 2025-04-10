"use client";

import { useEffect, useState } from "react";
import { useFineStore } from "@/store/fineStore";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/utils/date";
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Info,
  Loader2,
  X,
} from "lucide-react";

const FinesModal = ({ show, onHide }) => {
  const { user } = useAuthStore();
  const {
    fines,
    isLoading,
    error,
    fetchUserFines,
    initiateFinePayment,
    clearError,
    isProcessing,
    paymentPayload,
  } = useFineStore();
  const [selectedFine, setSelectedFine] = useState(null);

  useEffect(() => {
    if (show && user?._id) {
      fetchUserFines(user._id);
    }
  }, [show, user?._id]);

  useEffect(() => {
    if (paymentPayload) {
      // Submit to eSewa when payment payload is available
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

      document.body.appendChild(form);
      form.submit();
    }
  }, [paymentPayload]);

  const handlePayFine = async (fineId) => {
    try {
      await initiateFinePayment(fineId, user._id);
    } catch (err) {
      console.error("Payment initiation failed:", err);
    }
  };

  // Helper function to safely display loan ID
  const displayLoanId = (loanId) => {
    if (!loanId) return "N/A";

    // Check if loanId is a string
    if (typeof loanId === "string") {
      return loanId.slice(-6);
    }

    // If loanId is an object with _id or id property (common in MongoDB references)
    if (typeof loanId === "object") {
      if (loanId._id && typeof loanId._id === "string") {
        return loanId._id.slice(-6);
      }
      if (loanId.id && typeof loanId.id === "string") {
        return loanId.id.slice(-6);
      }
    }

    // Fallback: convert to string or show ID format
    return String(loanId).slice(-6);
  };

  const unpaidFines = fines.filter((fine) => fine.status === "pending");
  const paidFines = fines.filter((fine) => fine.status === "paid");

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-xl font-bold text-gray-800">My Fines</h3>
            <button
              onClick={onHide}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Error</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="ml-auto p-1 rounded-full hover:bg-red-100"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}

            {isLoading && !fines.length ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                <p className="mt-4 text-gray-500">Loading fines...</p>
              </div>
            ) : (
              <>
                {/* Unpaid Fines Section */}
                <section className="mb-8">
                  <h4 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Unpaid Fines
                  </h4>

                  {unpaidFines.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Loan ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Original Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fine Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Days Late
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Issued On
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {unpaidFines.map((fine) => (
                            <motion.tr
                              key={fine._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className={`hover:bg-gray-50 ${
                                selectedFine === fine._id ? "bg-gray-50" : ""
                              }`}
                            >
                              <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-700">
                                {displayLoanId(fine.loanId)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                Rs. {fine.originalAmount?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-600">
                                Rs. {fine.fineAmount?.toFixed(2) || "0.00"} (
                                {fine.finePercent || "0"}%)
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                  {fine.daysLate || "0"} days
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {formatDate(fine.createdAt)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => handlePayFine(fine._id)}
                                  disabled={isProcessing}
                                  className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                                    isProcessing
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-red-600 text-white hover:bg-red-700"
                                  }`}
                                >
                                  {isProcessing ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="w-3.5 h-3.5 mr-2" />
                                      Pay Now
                                    </>
                                  )}
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-600">No unpaid fines found</p>
                    </div>
                  )}
                </section>

                {/* Paid Fines Section */}
                <section>
                  <h4 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Paid Fines
                  </h4>

                  {paidFines.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Loan ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Original Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fine Paid
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Paid On
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paidFines.map((fine) => (
                            <motion.tr
                              key={fine._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-700">
                                {displayLoanId(fine.loanId)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                Rs. {fine.originalAmount?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                Rs. {fine.fineAmount?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {formatDate(fine.paidAt)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center w-fit">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Paid
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <Info className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                      <p className="text-gray-600">No paid fines history</p>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onHide}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FinesModal;
