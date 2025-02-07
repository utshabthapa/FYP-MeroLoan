import express from "express";
import {
  submitLoanRequest,
  deleteLoanRequest,
  getAllLoans,
} from "../controllers/loan.controller.js";
import { verifyToken } from "../middleware/verifyToken.js"; // Middleware for user authentication

const router = express.Router();

// User routes
router.post("/apply", verifyToken, submitLoanRequest); // Submit a new loan request
router.get("/all-loans", verifyToken, getAllLoans); // Fetch all loan requests for public viewing
router.delete("/delete-loan/:loanId", verifyToken, deleteLoanRequest); // Delete a specific loan request

export default router;
