// stores/paymentStore.js
import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/payment"
    : "/api/payment";

axios.defaults.withCredentials = true;

export const usePaymentStore = create((set) => ({
  isProcessing: false,
  error: null,

  // Initiate eSewa payment
  initiateEsewaPayment: async (paymentData) => {
    set({ isProcessing: true, error: null });
    try {
      const { loanId, amount, insuranceAdded, lenderId, borrowerId } =
        paymentData;

      // Create transaction record
      const response = await axios.post(`${API_URL}/initiate`, {
        loanId,
        amount,
        insuranceAdded,
        lenderId,
        borrowerId,
      });

      // Return the payment payload for form submission
      return response.data; // Updated to return payload instead of URL
    } catch (error) {
      set({
        error: error.response?.data?.message || "Payment initiation failed",
        isProcessing: false,
      });
      throw error;
    }
  },

  // Verify payment status
  // stores/paymentStore.js
  verifyPayment: async (transactionId, productCode, signature, totalAmount) => {
    set({ isProcessing: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify`, {
        transactionId,
        productCode,
        signature,
        totalAmount,
      });
      return response.data.success; // Return verification result
    } catch (error) {
      set({
        error: error.response?.data?.message || "Payment verification failed",
        isProcessing: false,
      });
      throw error;
    }
  },
  // Payment success: call the success endpoint to update the loan status to "active"
  paymentSuccess: async (transactionId) => {
    set({ isProcessing: true, error: null });
    try {
      // The backend endpoint should update the transaction status and the associated loan to "active".
      // Here we assume the success endpoint is a GET request that accepts transaction_uuid as a query parameter.
      const response = await axios.get(`${API_URL}/payment-success`, {
        params: { transaction_uuid: transactionId },
      });
      set({ isProcessing: false });
      return response.data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Payment success processing failed",
        isProcessing: false,
      });
      throw error;
    }
  },

  // Reset payment state
  resetPaymentState: () => set({ isProcessing: false, error: null }),
}));
