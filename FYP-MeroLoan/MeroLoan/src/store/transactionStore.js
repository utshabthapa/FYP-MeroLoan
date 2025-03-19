import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/transaction"
    : "/api/transaction";

axios.defaults.withCredentials = true;

export const useTransactionStore = create((set) => ({
  transactions: [],
  adminTransactions: [], // For admin view of transactions
  isLoading: false,
  error: null,

  // Fetch transactions for a specific user
  fetchUserTransactions: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      // Extract the transactions array from the response data
      const transactionsData = response.data.data || [];
      set({ transactions: transactionsData, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch transactions",
        isLoading: false,
      });
    }
  },

  // Fetch all transactions for admin
  fetchAdminTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/admin`);
      const transactionsData = response.data.data || [];
      set({ adminTransactions: transactionsData, isLoading: false });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch admin transactions",
        isLoading: false,
      });
    }
  },

  // Update adminTransfer status
  updateAdminTransfer: async (transactionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(
        `${API_URL}/admin/transfer/${transactionId}`,
        {
          adminTransfer: true,
        }
      );

      // Update local state
      set((state) => ({
        adminTransactions: state.adminTransactions.map((transaction) =>
          transaction._id === transactionId
            ? { ...transaction, adminTransfer: true }
            : transaction
        ),
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to update transfer status",
        isLoading: false,
      });
      throw error;
    }
  },
}));
