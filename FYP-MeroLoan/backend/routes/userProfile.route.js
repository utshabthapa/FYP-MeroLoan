import express from "express";
import {
  getUserProfile,
  getUserActiveContracts,
} from "../controllers/userProfile.controller.js";
import { verifyToken } from "../middleware/verifyToken.js"; // Middleware for user authentication

const router = express.Router();

// User profile routes
router.get("/profile/:userId", verifyToken, getUserProfile); // Get a specific user's profile
router.get("/active-contracts/:userId", verifyToken, getUserActiveContracts); // Get a specific user's active contracts

export default router;
