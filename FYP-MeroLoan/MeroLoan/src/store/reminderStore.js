// src/store/reminderStore.js
import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/reminders"
    : "/api/reminders";

axios.defaults.withCredentials = true;

export const useReminderStore = create((set) => ({
  isCheckingReminders: false,
  reminderError: null,

  // Function to check reminders for a specific user
  checkReminders: async (userId) => {
    set({ isCheckingReminders: true, reminderError: null });
    try {
      const response = await axios.get(`${API_URL}/check-user/${userId}`);
      set({ isCheckingReminders: false });

      return response.data;
    } catch (error) {
      set({
        reminderError:
          error.response?.data?.message || "Failed to check reminders",
        isCheckingReminders: false,
      });
      throw error;
    }
  },

  // Function for admins to trigger reminders for all users
  triggerAllReminders: async () => {
    set({ isCheckingReminders: true, reminderError: null });
    try {
      const response = await axios.post(`${API_URL}/trigger-all`);
      set({ isCheckingReminders: false });

      return response.data;
    } catch (error) {
      set({
        reminderError:
          error.response?.data?.message || "Failed to trigger reminders",
        isCheckingReminders: false,
      });
      throw error;
    }
  },

  // Clear error state
  clearReminderError: () => set({ reminderError: null }),
}));
