import express from "express";
import { verifyToken } from "../middleware/verifyToken.js"; // Import verifyToken middleware
import { isAdmin } from "../middleware/authHandle.js"; // Your admin middleware
import {
  getAdminStats,
  getAllUsers,
  //   getLoans,
  //   getInsuranceSubscriptions,
} from "../controllers/admin.controller.js"; // Import admin controllers

const router = express.Router();

// Apply verifyToken middleware to all admin routes
router.use(verifyToken);

// Route to get admin stats (total users, loans, insurance subscriptions, etc.)
router.get("/stats", isAdmin, getAdminStats);

// Route to get all users (for admin)
router.get("/users", isAdmin, getAllUsers);

// Route to get all loans (for admin)
// router.get("/loans", isAdmin, getLoans);

// Route to get all insurance subscriptions (for admin)
// router.get("/insurance-subscriptions", isAdmin, getInsuranceSubscriptions);

export default router;
