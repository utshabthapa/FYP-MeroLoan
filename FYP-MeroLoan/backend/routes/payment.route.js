// routes/payment.js
import express from "express";
import {
  initiatePayment,
  initiateRepayment,
  paymentSuccess,
  repaymentSuccess,
  // verifyPayment,
} from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/verifyToken.js"; // Middleware for user authentication

const router = express.Router();

router.post("/initiate", verifyToken, initiatePayment);
router.post("/initiate-repayment", verifyToken, initiateRepayment);
// router.post("/verify", verifyToken, verifyPayment);
router.get("/payment-success", paymentSuccess);
router.get("/repayment-success", repaymentSuccess);
export default router;
