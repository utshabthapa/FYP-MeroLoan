import express from "express";
import {
  getUserTransactions,
  updateAdminTransfer,
  getAdminTransactions,
} from "../controllers/transaction.controller.js";
import { verifyToken } from "../middleware/verifyToken.js"; // Middleware for user authentication

const router = express.Router();

// Fetch all transactions for a specific user
router.get("/user/:userId", verifyToken, getUserTransactions);

// Admin routes
router.get("/admin", verifyToken, getAdminTransactions);
router.patch(
  "/admin/transfer/:transactionId",
  verifyToken,
  updateAdminTransfer
);

export default router;
