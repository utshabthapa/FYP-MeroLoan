import { Transaction } from "../models/transaction.model.js";
import { Notification } from "../models/notification.model.js"; // Import the Notification model

import { User } from "../models/user.model.js";
import { io } from "../index.js"; // Import the `io` instance

// Fetch Transactions for a Specific User
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch transactions where the user is either a lender or borrower
    const transactions = await Transaction.find({
      $or: [{ lender: userId }, { borrower: userId }],
    }).populate("loan lender borrower", "loanAmount name email");

    if (!transactions.length) {
      return res
        .status(404)
        .json({ success: false, message: "No transactions found" });
    }

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update adminTransfer status for a transaction
export const updateAdminTransfer = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find and update the transaction
    const transaction = await Transaction.findById(transactionId).populate(
      "borrower lender",
      "name email"
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update the adminTransfer field
    transaction.adminTransfer = true;
    transaction.status = "COMPLETED";
    await transaction.save();

    // Create and save a notification for the borrower
    const borrowerNotification = new Notification({
      userId: transaction.borrower._id,
      message: "Your payment has been verified and marked as completed!",
      transactionId: transaction._id,
      timestamp: new Date(),
    });
    await borrowerNotification.save();

    // Emit a notification to the borrower
    io.to(transaction.borrower._id.toString()).emit("newNotification", {
      message: borrowerNotification.message,
      transactionId: transaction._id,
      timestamp: borrowerNotification.timestamp,
    });

    // Create and save a notification for the lender
    const lenderNotification = new Notification({
      userId: transaction.lender._id,
      message: `Payment for transaction ${transaction._id} has been verified and marked as completed!`,
      transactionId: transaction._id,
      timestamp: new Date(),
    });
    await lenderNotification.save();

    // Emit a notification to the lender
    io.to(transaction.lender._id.toString()).emit("newNotification", {
      message: lenderNotification.message,
      transactionId: transaction._id,
      timestamp: lenderNotification.timestamp,
    });

    res.status(200).json({
      success: true,
      message: "Transaction marked as transferred successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Fetch all transactions for admin view
export const getAdminTransactions = async (req, res) => {
  try {
    // Fetch all transactions
    const transactions = await Transaction.find().populate(
      "loan lender borrower",
      "loanAmount name email"
    );

    if (!transactions.length) {
      return res.status(404).json({
        success: false,
        message: "No transactions found",
      });
    }

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
