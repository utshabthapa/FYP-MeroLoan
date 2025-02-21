import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/userDashboard"
    : "/api/userDashboard";

axios.defaults.withCredentials = true;

export const useUserDashboardStore = create((set) => ({
  // Dashboard statistics
  dashboardStats: {
    loanBorrowed: 0,
    loanLended: 0,
    interestEarnings: 0,
    loanDue: 0,
    activeLoans: 0,
    monthlyGrowth: {
      borrowed: 0,
      lended: 0,
      earnings: 0,
    },
    loanDueDate: null,
    newLoansThisMonth: 0,
  },

  // Loan activity data for charts
  loanActivity: [],
  loanStatusDistribution: [],

  // Recent activity
  recentTransactions: [],

  isLoading: false,
  error: null,

  // Fetch dashboard statistics
  fetchDashboardStats: async (userId) => {
    set({ isLoading: true, error: null });
    // console.log("the response is", userId);

    try {
      const response = await axios.get(`${API_URL}/dashboard`, {
        params: { userId }, // Send userId as a query parameter
        withCredentials: true,
      });

      set({
        dashboardStats: response.data.data.stats,
        loanActivity: response.data.data.loanActivity,
        loanStatusDistribution: response.data.data.statusDistribution,
        recentTransactions: response.data.data.recentTransactions,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch dashboard data",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch recent transactions separately if needed
  //   fetchRecentTransactions: async () => {
  //     set({ isLoading: true, error: null });

  //     try {
  //       const response = await axios.get(`${API_URL}/transactions/recent`, {
  //         withCredentials: true,
  //       });

  //       set({
  //         recentTransactions: response.data.data,
  //         isLoading: false,
  //       });
  //     } catch (error) {
  //       set({
  //         error:
  //           error.response?.data?.message ||
  //           "Failed to fetch recent transactions",
  //         isLoading: false,
  //       });
  //       throw error;
  //     }
  //   },
}));
