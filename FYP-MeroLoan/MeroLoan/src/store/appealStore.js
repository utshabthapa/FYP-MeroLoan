import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/appeals"
    : "/api/appeals";

axios.defaults.withCredentials = true;

export const useAppealStore = create((set, get) => ({
  appeals: [],
  currentAppeal: null,
  isLoading: false,
  error: null,

  // Fetch all appeals (admin function)
  fetchAllAppeals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}`);
      set({
        appeals: response.data.data || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch appeals",
        isLoading: false,
      });
    }
  },

  // Fetch user's appeals
  fetchUserAppeals: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      set({
        appeals: response.data.data || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch appeals",
        isLoading: false,
      });
    }
  },

  // Fetch a specific appeal
  fetchAppeal: async (appealId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${appealId}`);
      set({
        currentAppeal: response.data.data,
        isLoading: false,
      });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch appeal",
        isLoading: false,
      });
      return null;
    }
  },

  // Create a new appeal
  createAppeal: async (appealData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}`, appealData);
      // Add the new appeal to the appeals array
      set((state) => ({
        appeals: [response.data.data, ...state.appeals],
        currentAppeal: response.data.data,
        isLoading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create appeal",
        isLoading: false,
      });
      return null;
    }
  },

  // Update an appeal (admin function)
  updateAppeal: async (appealId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${appealId}`, updateData);
      // Update the appeal in the appeals array
      set((state) => ({
        appeals: state.appeals.map((appeal) =>
          appeal._id === appealId ? response.data.data : appeal
        ),
        currentAppeal:
          state.currentAppeal?._id === appealId
            ? response.data.data
            : state.currentAppeal,
        isLoading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update appeal",
        isLoading: false,
      });
      return null;
    }
  },

  // Delete an appeal (admin function)
  deleteAppeal: async (appealId) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${appealId}`);
      // Remove the appeal from the appeals array
      set((state) => ({
        appeals: state.appeals.filter((appeal) => appeal._id !== appealId),
        currentAppeal:
          state.currentAppeal?._id === appealId ? null : state.currentAppeal,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete appeal",
        isLoading: false,
      });
      return false;
    }
  },

  // Clear errors
  clearError: () => set({ error: null }),

  // Reset state
  resetState: () =>
    set({
      appeals: [],
      currentAppeal: null,
      isLoading: false,
      error: null,
    }),
}));
