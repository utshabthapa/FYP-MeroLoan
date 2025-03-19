import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/notification"
    : "/api/notification";

axios.defaults.withCredentials = true;

export const useNotificationStore = create((set) => ({
  notifications: [], // Stores all notifications for the user
  unreadCount: 0, // Tracks the number of unread notifications
  isLoading: false,
  error: null,

  // Fetch notifications for a specific user
  fetchNotifications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      const notificationsData = response.data.data || [];
      set({
        notifications: notificationsData,
        unreadCount: notificationsData.filter((n) => !n.read).length,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch notifications",
        isLoading: false,
      });
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`${API_URL}/${notificationId}/read`);
      const updatedNotification = response.data.data;

      // Update the notifications array and unread count
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? updatedNotification : n
        ),
        unreadCount: state.unreadCount - 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to mark as read",
        isLoading: false,
      });
    }
  },

  // Add a new notification (for real-time updates)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Clear all notifications
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
