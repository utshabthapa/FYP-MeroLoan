// routes/payment.js
import express from "express";
import {
  initiatePayment,
  paymentSuccess,
  // verifyPayment,
} from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/verifyToken.js"; // Middleware for user authentication

const router = express.Router();

router.post("/initiate", verifyToken, initiatePayment);
// router.post("/verify", verifyToken, verifyPayment);
router.get("/payment-success", paymentSuccess);
export default router;
