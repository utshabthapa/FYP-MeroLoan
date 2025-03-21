import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteAllNotifications,
} from "../controllers/notification.controller.js"; // Import notification controllers
import { verifyToken } from "../middleware/verifyToken.js"; // Middleware for user authentication

const router = express.Router();

// Fetch all notifications for a specific user
router.get("/user/:userId", verifyToken, getUserNotifications);

// Mark a notification as read
router.patch("/:notificationId/read", verifyToken, markNotificationAsRead);
router.delete("/user/:userId", verifyToken, deleteAllNotifications); // Add this route

export default router;
