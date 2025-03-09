import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/active-contracts"
    : "/api/active-contracts";

axios.defaults.withCredentials = true;

export const useActiveContractStore = create((set) => ({
  isProcessing: false,
  error: null,
  activeContracts: [],

  // Create a new active contract
  createActiveContract: async (contractData) => {
    set({ isProcessing: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/create`, contractData);

      // Optionally update local state if needed
      set((state) => ({
        activeContracts: [...state.activeContracts, response.data],
        isProcessing: false,
      }));

      return response.data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Active contract creation failed",
        isProcessing: false,
      });
      throw error;
    }
  },

  // Fetch active contracts for a user
  fetchActiveContracts: async (userId) => {
    set({ isProcessing: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);

      set({
        activeContracts: response.data.data,
        isProcessing: false,
      });

      return response.data;
      console.log(response.data);
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch active contracts",
        isProcessing: false,
      });
      throw error;
    }
  },

  // Update an existing active contract
  updateActiveContract: async (contractId, updateData) => {
    set({ isProcessing: true, error: null });
    try {
      const response = await axios.patch(
        `${API_URL}/${contractId}`,
        updateData
      );

      // Update local state
      set((state) => ({
        activeContracts: state.activeContracts.map((contract) =>
          contract._id === contractId ? response.data : contract
        ),
        isProcessing: false,
      }));

      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Contract update failed",
        isProcessing: false,
      });
      throw error;
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),
}));
