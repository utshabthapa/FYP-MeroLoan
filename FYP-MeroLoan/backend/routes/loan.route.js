import express from "express";
import {
  submitLoanRequest,
  deleteLoanRequest,
  getAllLoans,
} from "../controllers/loan.controller.js";
import { verifyToken } from "../middleware/verifyToken.js"; // Middleware for user authentication
import { Loan } from "../models/loan.model.js";

const router = express.Router();

// User routes
router.post("/apply", verifyToken, submitLoanRequest); // Submit a new loan request
router.get("/all-loans", verifyToken, getAllLoans); // Fetch all loan requests for public viewing
router.delete("/delete-loan/:loanId", verifyToken, deleteLoanRequest); // Delete a specific loan request
router.put("/update-status/:transactionId", async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    const loan = await Loan.findById(transactionId);
    loan.status = req.body.status;
    await loan.save();

    // const loan = await Loan.findByIdAndUpdate(
    //   req.params.transactionId,
    //   { status: req.body.status },
    //   { new: true }
    // ).populate("userId");
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: "Error updating loan status" });
  }
});
export default router;
