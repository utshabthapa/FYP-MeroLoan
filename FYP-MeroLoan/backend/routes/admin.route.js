import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authHandle.js";
import {
  getAdminStats,
  getAllUsers,
  banUser,
  unbanUser,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Apply verifyToken middleware to all admin routes
router.use(verifyToken);

// Route to get admin stats
router.get("/stats", isAdmin, getAdminStats);

// Route to get all users (for admin)
router.get("/users", isAdmin, getAllUsers);

// Route to ban a user
router.patch("/users/:userId/ban", isAdmin, banUser);

// Route to unban a user
router.patch("/users/:userId/unban", isAdmin, unbanUser);

export default router;
