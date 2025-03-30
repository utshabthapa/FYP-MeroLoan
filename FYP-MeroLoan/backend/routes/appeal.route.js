import express from "express";
import {
  getAllAppeals,
  getAppealById,
  getUserAppeals,
  createAppeal,
  updateAppeal,
  deleteAppeal,
} from "../controllers/appeal.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Get all appeals (admin route)
router.get("/", verifyToken, getAllAppeals);

// Get a specific appeal by ID
router.get("/:appealId", verifyToken, getAppealById);

// Get all appeals for a specific user
router.get("/user/:userId", verifyToken, getUserAppeals);

// Create a new appeal
router.post("/", verifyToken, createAppeal);

// Update an appeal (admin route for reviewing appeals)
router.put("/:appealId", verifyToken, updateAppeal);

// Delete an appeal
router.delete("/:appealId", verifyToken, deleteAppeal);

export default router;
