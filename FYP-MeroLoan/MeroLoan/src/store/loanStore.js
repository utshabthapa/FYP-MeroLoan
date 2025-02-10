import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/loan"
    : "/api/loans";

axios.defaults.withCredentials = true;

export const useLoanStore = create((set) => ({
  loans: [],
  isLoading: false,
  error: null,

  // Submit a loan request
  submitLoanRequest: async (loanData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/apply`, loanData);
      set((state) => ({
        loans: [...state.loans, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to submit loan request",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch all loan requests
  fetchLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/all-loans`);
      // Extract the data array from the response
      const loansData = response.data.data || []; // Ensure it's an array
      set({ loans: loansData, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch loans",
        isLoading: false,
      });
    }
  },

  // Delete a loan request
  deleteLoan: async (loanId) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/delete-loan/${loanId}`);
      set((state) => ({
        loans: state.loans.filter((loan) => loan._id !== loanId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete loan request",
        isLoading: false,
      });
    }
  },
  updateLoanStatus: async (transactionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/update-status/${transactionId}`
      );
      // set((state) => ({
      //   loans: state.loans.map((loan) =>
      //     loan.transactionId === transactionId
      //       ? { ...loan, status: newStatus }
      //       : loan
      //   ),
      //   isLoading: false,
      // }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update loan status",
        isLoading: false,
      });
      throw error;
    }
  },
}));
