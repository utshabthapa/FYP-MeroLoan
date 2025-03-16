import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/transaction"
    : "/api/transaction";

axios.defaults.withCredentials = true;

export const useTransactionStore = create((set) => ({
  transactions: [],
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
}));
