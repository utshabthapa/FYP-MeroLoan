import { create } from "zustand";
import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api/landing" // Base API URL
    : "/api/landing";

axios.defaults.withCredentials = true;

export const useLandingStore = create((set) => ({
  // State for landing page stats
  landingStats: {
    totalUsers: 0,
    totalLoans: 0,
    totalMoneyFlow: 0,
    totalTransactions: 0,
  },
  isLoading: false, // Loading state
  error: null, // Error state

  // Fetch landing page stats
  fetchLandingStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/stats`);

      // Store the data property from the response
      set({
        landingStats: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch landing page stats",
        isLoading: false,
      });
      console.error("Error fetching landing page stats:", error);
    }
  },
}));
