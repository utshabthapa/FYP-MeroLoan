import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getDashboardStats } from "../controllers/userDashboard.controller.js";

const router = express.Router();

// Apply verifyToken middleware to all dashboard routes
router.use(verifyToken);

// Route to get user dashboard stats
router.get("/dashboard", getDashboardStats);

// Route to get recent transactions
router.get("/transactions/recent", async (req, res) => {
  try {
    const { getDashboardStats } = await import(
      "../controllers/userDashboard.controller.js"
    );
    const result = await getDashboardStats(req, res);
    return result;
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch recent transactions" });
  }
});

export default router;
