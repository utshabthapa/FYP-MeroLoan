import { User } from "../models/user.model.js";
import { Loan } from "../models/loan.model.js";

// Submit Loan Request
export const submitLoanRequest = async (req, res) => {
  try {
    const {
      userId,
      loanAmount,
      interestRate,
      duration,
      repaymentType,
      milestones,
    } = req.body;

    // Validate repaymentType and milestones
    if (repaymentType === "milestone" && !milestones) {
      return res.status(400).json({
        success: false,
        message: "Milestones must be specified for milestone repayment type",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create the loan request
    const newLoan = await Loan.create({
      userId,
      loanAmount,
      interestRate,
      duration,
      repaymentType,
      milestones: repaymentType === "milestone" ? milestones : null,
    });

    // Add the loan ID to the user's loanIds array
    user.loanIds.push(newLoan._id); // Add the newly created loan ID
    await user.save(); // Save the updated user record

    res.status(201).json({
      success: true,
      message: "Loan request submitted successfully",
      data: newLoan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch All Loan Requests
export const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate("userId", "name email"); // Populate user details (if needed)

    if (!loans.length) {
      return res.status(404).json({
        success: false,
        message: "No loan requests found",
      });
    }

    res.status(200).json({
      success: true,
      data: loans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Loan Request
export const deleteLoanRequest = async (req, res) => {
  try {
    const { loanId } = req.params;

    // Check if the loan exists
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });
    }

    // Delete the loan
    await loan.deleteOne();

    res.status(200).json({
      success: true,
      message: "Loan request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
