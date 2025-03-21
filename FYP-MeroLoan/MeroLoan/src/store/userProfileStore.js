import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/users"
    : "/api/users";

axios.defaults.withCredentials = true;

export const useUserProfileStore = create((set) => ({
  userProfile: null,
  isLoading: false,
  error: null,

  // Fetch a user profile by ID
  fetchUserProfile: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/profile/${userId}`);
      set({ userProfile: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch user profile",
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear the user profile data (useful when navigating away)
  clearUserProfile: () => {
    set({ userProfile: null });
  },

  // Get active contracts for a specific user
  getUserActiveContracts: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/active-contracts/${userId}`);
      return response.data.data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Failed to fetch user's active contracts",
        isLoading: false,
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
