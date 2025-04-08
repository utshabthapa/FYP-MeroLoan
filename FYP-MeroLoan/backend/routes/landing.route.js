import express from "express";
import { getLandingStats } from "../controllers/landing.controller.js";

const router = express.Router();

// Public routes for landing page
router.get("/stats", getLandingStats); // Fetch public statistics for landing page

export default router;
