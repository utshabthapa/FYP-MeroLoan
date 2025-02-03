import express from "express";
import {
  submitKYC,
  verifyKYC,
  fetchKYCRequests,
  fetchSingleKYCRequest,
} from "../controllers/kyc.controller.js";
import { verifyToken } from "../middleware/verifyToken.js"; // Import verifyToken middleware
import { isAdmin } from "../middleware/authHandle.js"; // Your admin middleware
import upload from "../middleware/multerConfig.js";

const router = express.Router();

// User routes
router.post("/submit", upload.none(), verifyToken, submitKYC); // Submit a new KYC request

// Admin routes
router.get("/requests", verifyToken, isAdmin, fetchKYCRequests); // Fetch all KYC requests
router.get("/request/:kycId", verifyToken, isAdmin, fetchSingleKYCRequest); // Fetch a single KYC request
router.post("/verify", verifyToken, isAdmin, verifyKYC); // Approve or reject a KYC request

export default router;
