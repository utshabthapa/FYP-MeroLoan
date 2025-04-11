import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/admin" // Admin API base URL
    : "/api/admin";

axios.defaults.withCredentials = true;

export const useAdminStore = create((set) => ({
  // State for admin stats
  adminStats: {
    totalUsers: 0,
    totalLoans: 0,
    totalInsuranceSubscriptions: 0,
  },
  allUsers: [], // State for all users
  allLoans: [], // State for all loans
  allFines: [], // State for all fines

  allInsuranceSubscriptions: [], // State for all insurance subscriptions
  isLoading: false, // Loading state
  error: null, // Error state

  // Fetch admin stats (total users, loans, insurance subscriptions, etc.)
  fetchAdminStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/stats`, {
        withCredentials: true,
      });

      // Store the data property from the response
      set({
        adminStats: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch admin stats",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch all users (for admin)
  fetchAllUsers: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/users`, {
        withCredentials: true,
      });

      set({
        allUsers: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch all users",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch all fines (for admin)
  fetchAllFines: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/fines`, {
        withCredentials: true,
      });

      set({
        allFines: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch all fines",
        isLoading: false,
      });
      throw error;
    }
  },
  // Ban a user
  banUser: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      await axios.patch(
        `${API_URL}/users/${userId}/ban`,
        {},
        {
          withCredentials: true,
        }
      );

      // Update the user's status in the store
      set((state) => ({
        allUsers: state.allUsers.map((user) =>
          user._id === userId ? { ...user, banStatus: "banned" } : user
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to ban user",
        isLoading: false,
      });
      throw error;
    }
  },

  // Unban a user
  unbanUser: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      await axios.patch(
        `${API_URL}/users/${userId}/unban`,
        {},
        {
          withCredentials: true,
        }
      );

      // Update the user's status in the store
      set((state) => ({
        allUsers: state.allUsers.map((user) =>
          user._id === userId ? { ...user, banStatus: "notBanned" } : user
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to unban user",
        isLoading: false,
      });
      throw error;
    }
  },
}));
