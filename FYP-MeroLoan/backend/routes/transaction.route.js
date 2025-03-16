import express from "express";
import { getUserTransactions } from "../controllers/transaction.controller.js";
import { verifyToken } from "../middleware/verifyToken.js"; // Middleware for user authentication

const router = express.Router();

// Fetch all transactions for a specific user
router.get("/user/:userId", verifyToken, getUserTransactions);

export default router;
