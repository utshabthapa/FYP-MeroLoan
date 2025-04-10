import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/fines"
    : "/api/fines";

axios.defaults.withCredentials = true;

export const useFineStore = create((set, get) => ({
  fines: [],
  currentFine: null,
  isLoading: false,
  error: null,
  // State
  isProcessing: false,
  paymentPayload: null,

  // Actions
  initiateFinePayment: async (fineId, userId) => {
    set({ isProcessing: true, error: null });
    try {
      const pendingFineData = {
        fineId: fineId,
        timestamp: new Date().toISOString(),
        amount: null, // Will be updated when payment is initiated
        transactionId: null, // Will be updated when payment is initiated
      };
      localStorage.setItem(
        "pendingFinePayment",
        JSON.stringify(pendingFineData)
      );
      const response = await axios.post(`${API_URL}/${fineId}/initiate`, {
        userId,
      });

      set({
        paymentPayload: response.data.paymentPayload,
        isProcessing: false,
      });

      return response.data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to initiate fine payment",
        isProcessing: false,
      });
      throw error;
    }
  },

  // // Add the finePaymentSuccess function to replace verifyFinePayment
  // finePaymentSuccess: async (transaction_uuid) => {
  //   set({ isProcessing: true, error: null });
  //   try {
  //     const response = await axios.get(`${API_URL}/payment-success`, {
  //       params: { transaction_uuid },
  //     });

  //     set({
  //       isProcessing: false,
  //       paymentPayload: null, // Clear payment payload after successful verification
  //     });

  //     return response.data;
  //   } catch (error) {
  //     set({
  //       error:
  //         error.response?.data?.message || "Failed to process fine payment",
  //       isProcessing: false,
  //     });
  //     throw error;
  //   }
  // },

  // Keep the verifyFinePayment for backward compatibility but make it use finePaymentSuccess
  verifyFinePayment: async (transaction_uuid) => {
    console.warn(
      "verifyFinePayment is deprecated, use finePaymentSuccess instead"
    );
    return get().finePaymentSuccess(transaction_uuid);
  },

  // Fetch all fines for a user
  fetchUserFines: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      set({
        fines: response.data.data || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch fines",
        isLoading: false,
      });
    }
  },

  // Fetch a specific fine
  fetchFine: async (fineId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${fineId}`);
      set({
        currentFine: response.data.data,
        isLoading: false,
      });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch fine",
        isLoading: false,
      });
      return null;
    }
  },

  // Pay a fine using eSewa
  payFineWithEsewa: async (fineId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/${fineId}/pay/esewa`);

      // Redirect to eSewa payment page
      const { paymentPayload } = response.data;
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

      // Store the fine details for verification after payment
      const pendingFineData = {
        fineId: fineId,
        transactionId: paymentPayload.transaction_uuid,
        amount: paymentPayload.total_amount,
      };
      localStorage.setItem(
        "pendingFinePayment",
        JSON.stringify(pendingFineData)
      );

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to initiate payment",
        isLoading: false,
      });
      return null;
    }
  },

  // Clear errors
  clearError: () => set({ error: null }),
  clearPayment: () => set({ paymentPayload: null }),

  // Reset state
  resetState: () =>
    set({
      fines: [],
      currentFine: null,
      isLoading: false,
      error: null,
    }),
}));
