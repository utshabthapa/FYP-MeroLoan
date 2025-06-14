import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authHandle.js";
import {
  getAdminStats,
  getAllUsers,
  banUser,
  unbanUser,
  getAllFines,
} from "../controllers/admin.controller.js";
import { getBadLoans } from "../controllers/badLoan.controller.js"; // Add this import

const router = express.Router();

// Apply verifyToken middleware to all admin routes
router.use(verifyToken);

// Route to get admin stats
router.get("/stats", isAdmin, getAdminStats);

// Route to get all users (for admin)
router.get("/users", isAdmin, getAllUsers);

router.get("/fines", isAdmin, getAllFines);

// Route to ban a user
router.patch("/users/:userId/ban", isAdmin, banUser);
// Route to get all bad loans
router.get("/bad-loans", isAdmin, getBadLoans);
// Route to unban a user
router.patch("/users/:userId/unban", isAdmin, unbanUser);

export default router;
