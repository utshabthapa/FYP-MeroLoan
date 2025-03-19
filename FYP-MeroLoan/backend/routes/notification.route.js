import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller.js"; // Import notification controllers
import { verifyToken } from "../middleware/verifyToken.js"; // Middleware for user authentication

const router = express.Router();

// Fetch all notifications for a specific user
router.get("/user/:userId", verifyToken, getUserNotifications);

// Mark a notification as read
router.patch("/:notificationId/read", verifyToken, markNotificationAsRead);

export default router;
