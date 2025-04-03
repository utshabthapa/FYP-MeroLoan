import express from "express";
import {
  checkUserReminders,
  triggerAllReminders,
} from "../controllers/reminderController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authHandle.js";

const router = express.Router();

// Route for users to check their own reminders with userId in the URL
router.get("/check-user/:userId", verifyToken, checkUserReminders);

// Route for admins to trigger reminders for all users
router.post("/trigger-all", verifyToken, isAdmin, triggerAllReminders);

export default router;
