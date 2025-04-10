import express from "express";
import {
  getUserFines,
  getFineById,
  initiateFinePayment,
  finePaymentSuccess,
  markFineAsPaid,
  verifyFinePayment,
} from "../controllers/fine.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authHandle.js";

const router = express.Router();

// User-specific routes
router.get("/user/:userId", verifyToken, getUserFines);

// Special routes should come BEFORE wildcard routes
router.get("/verify-payment", verifyFinePayment); // This must be before /:fineId
router.get("/payment-success", finePaymentSuccess);

// Wildcard route for individual fines
router.get("/:fineId", verifyToken, getFineById);

// Fine payment flow
router.post("/:fineId/initiate", verifyToken, initiateFinePayment);

// Admin routes
router.post("/:fineId/mark-paid", verifyToken, isAdmin, markFineAsPaid);

export default router;
