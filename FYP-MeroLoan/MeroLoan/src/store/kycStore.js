import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/kyc" // KYC API base URL
    : "/api/kyc";

axios.defaults.withCredentials = true;

export const useKYCStore = create((set) => ({
  kycRequests: [],
  selectedKYC: null,
  isLoading: false,
  error: null,

  // Fetch all KYC requests (admin)
  fetchKYCRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/requests`);
      set({ kycRequests: response.data.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch KYC requests",
        isLoading: false,
      });
    }
  },

  // Fetch single KYC request details for a specific user
  fetchSingleKYCRequest: async (kycId) => {
    console.log("Fetch KYC request details for:", kycId);
    if (!kycId) {
      console.error("KYC ID is missing");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log("KYC request details:", kycId);
      const response = await axios.get(`${API_URL}/request/${kycId}`);
      set({ selectedKYC: response.data.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching KYC details:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch KYC details",
        isLoading: false,
      });
    }
  },
  // Submit new KYC request (user-specific)
  submitKYCRequest: async (kycData) => {
    set({ isLoading: true, error: null });
    try {
      console.log(kycData);
      const response = await axios.post(`${API_URL}/submit`, kycData);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to submit KYC request",
        isLoading: false,
      });
      throw error;
    }
  },

  // Approve or reject a KYC request (admin)
  verifyKYCRequest: async (kycId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify`, { kycId, status });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to verify KYC request",
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear selected KYC request
  clearSelectedKYC: () => set({ selectedKYC: null }),
}));
