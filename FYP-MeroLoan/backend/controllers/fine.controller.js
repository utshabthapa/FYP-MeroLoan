import crypto from "crypto";
import CryptoJS from "crypto-js";

import { Loan } from "../models/loan.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { Fine } from "../models/fine.model.js";
import { Transaction } from "../models/transaction.model.js";

export const generateFineSignature = (data, secret) => {
  // Create the string to be hashed in the required format
  const hashString = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`;

  // Generate HMAC-SHA256 hash
  const hash = CryptoJS.HmacSHA256(hashString, secret);

  // Convert to Base64 string
  const hashedSignature = CryptoJS.enc.Base64.stringify(hash);

  return hashedSignature;
};

export const initiateFinePayment = async (req, res) => {
  try {
    const { fineId } = req.params;
    const { userId } = req.body;

    // Find the fine
    const fine = await Fine.findById(fineId);
    if (!fine) {
      return res.status(404).json({ message: "Fine not found" });
    }

    if (fine.status === "paid") {
      return res.status(400).json({ message: "Fine has already been paid" });
    }

    // Calculate total amount based on eSewa requirements
    const taxAmount = 0;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;
    const totalAmount =
      fine.fineAmount +
      taxAmount +
      productServiceCharge +
      productDeliveryCharge;

    // Create a unique ID for this payment attempt
    const paymentAttemptId = crypto.randomUUID();

    // Update fine with pending payment details
    fine.pendingPaymentId = paymentAttemptId;
    fine.pendingPaymentDetails = {
      userId,
      timestamp: new Date(),
    };
    await fine.save();

    // Prepare eSewa payload
    const payload = {
      amount: fine.fineAmount.toString(),
      tax_amount: taxAmount.toString(),
      product_service_charge: productServiceCharge.toString(),
      product_delivery_charge: productDeliveryCharge.toString(),
      total_amount: totalAmount.toString(),
      transaction_uuid: paymentAttemptId,
      product_code: process.env.MERCHANT_ID,
      success_url: `http://localhost:5173/fine-payment-success`,
      failure_url: `http://localhost:5173/fine-payment-failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    // Generate signature
    payload.signature = generateFineSignature(
      payload,
      process.env.ESEWA_SECRET
    );

    res.json({
      paymentPayload: payload,
      fineId: fine._id,
    });
  } catch (error) {
    console.error("Error in initiateFinePayment:", error);
    res.status(500).json({
      message: "Fine payment initiation failed",
      error: error.message,
    });
  }
};

export const finePaymentSuccess = async (req, res) => {
  try {
    const { transaction_uuid, fineId } = req.query;

    console.log("Fine Payment Success - Transaction UUID:", transaction_uuid);
    console.log("Fine ID from query params:", fineId);

    if (!transaction_uuid) {
      return res.status(400).json({ message: "Missing transaction ID" });
    }

    if (!fineId) {
      return res.status(400).json({ message: "Missing fine ID" });
    }

    // First try to find the fine by ID (prioritize fineId over transaction_uuid)
    let fine = await Fine.findById(fineId);

    // If not found by ID, fall back to pendingPaymentId lookup
    if (!fine) {
      console.log(
        "Fine not found by ID, trying by pendingPaymentId:",
        transaction_uuid
      );
      fine = await Fine.findOne({ pendingPaymentId: transaction_uuid });
    }

    if (!fine) {
      return res.status(404).json({
        message: "Fine not found",
        transaction_uuid,
        fineId,
        receivedParams: req.query,
      });
    }

    console.log("Found fine:", fine._id);

    // Verify the pendingPaymentId matches if the fine was found by ID
    if (fine.pendingPaymentId && fine.pendingPaymentId !== transaction_uuid) {
      return res.status(400).json({
        message: "Transaction ID doesn't match the fine's pending payment",
        finePendingPaymentId: fine.pendingPaymentId,
        receivedTransactionId: transaction_uuid,
      });
    }

    // Check if this fine already has a transaction
    if (fine.transactionId) {
      console.log("Fine already has transaction:", fine.transactionId);
      const existingTransaction = await Transaction.findById(
        fine.transactionId
      );

      if (existingTransaction) {
        return res.json({
          message: "Fine payment already processed",
          fineId: fine._id,
          transactionId: existingTransaction._id,
          amount: fine.fineAmount,
          paidAt: fine.paidAt,
          originalAmount: fine.originalAmount,
          daysLate: fine.daysLate,
          alreadyProcessed: true,
        });
      }
    }

    // Create the transaction record
    const transaction = await Transaction.create({
      loan: fine.loanId,
      amount: fine.fineAmount,
      lender: fine.borrowerId,
      borrower: fine.borrowerId,
      status: "COMPLETED",
      type: "FINE",
      referenceId: transaction_uuid, // Store the payment gateway reference
    });

    console.log("Created transaction:", transaction._id);

    // Update fine status
    fine.status = "paid";
    fine.paidAt = new Date();
    fine.transactionId = transaction._id;
    fine.pendingPaymentId = undefined;
    fine.pendingPaymentDetails = undefined;

    await fine.save();
    console.log("Updated fine status to paid:", fine._id);

    // Handle user notifications
    const user = await User.findById(fine.borrowerId);
    if (user) {
      // Update user's transaction history
      user.transactionIds = user.transactionIds || [];
      user.transactionIds.push(transaction._id);
      await user.save();

      // Create user notification
      const notification = new Notification({
        userId: fine.borrowerId,
        message: `You have successfully paid your late payment fine of Rs. ${fine.fineAmount.toFixed(
          2
        )}`,
        timestamp: new Date(),
      });
      await notification.save();

      // Create lender notification if applicable
      if (fine.lenderId) {
        const lenderNotification = new Notification({
          userId: fine.lenderId,
          message: `A late payment fine of Rs. ${fine.fineAmount.toFixed(
            2
          )} has been paid by ${user.name || "a borrower"}`,
          timestamp: new Date(),
        });
        await lenderNotification.save();

        // Emit real-time notifications
        if (req.io) {
          req.io.to(fine.lenderId.toString()).emit("newNotification", {
            message: lenderNotification.message,
            timestamp: lenderNotification.timestamp,
          });
        }
      }

      // Emit real-time notification to borrower
      if (req.io) {
        req.io.to(fine.borrowerId.toString()).emit("newNotification", {
          message: notification.message,
          timestamp: notification.timestamp,
        });
      }
    }

    res.json({
      message: "Fine payment successful",
      fineId: fine._id,
      transactionId: transaction._id,
      amount: fine.fineAmount,
      paidAt: fine.paidAt,
      originalAmount: fine.originalAmount,
      daysLate: fine.daysLate,
    });
  } catch (error) {
    console.error("Error in finePaymentSuccess:", error);
    res.status(500).json({
      message: "Error processing fine payment success",
      error: error.message,
    });
  }
};

export const getUserFines = async (req, res) => {
  try {
    const fines = await Fine.find({ borrowerId: req.params.userId })
      .populate("loanId", "amount")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: fines,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a specific fine by ID
export const getFineById = async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.fineId).populate(
      "loanId borrowerId"
    );

    if (!fine) {
      return res.status(404).json({
        status: "fail",
        message: "Fine not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: fine,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Verify fine payment after returning from eSewa
export const verifyFinePayment = async (req, res) => {
  try {
    const { transaction_uuid } = req.query;
    const fineId = req.params.fineId;
    console.log("Verify Fine Payment - Transaction UUID:", fineId);

    // Find the fine
    const fine = await Fine.findById(fineId);
    if (!fine) {
      return res.status(404).json({
        status: "fail",
        message: "Fine not found",
      });
    }

    // In a real implementation, you would verify the payment with eSewa's API here
    // For this example, we'll assume the payment was successful

    // Update fine status
    fine.status = "paid";
    fine.paidAt = new Date();
    fine.transactionId = transaction_uuid;
    await fine.save();

    // Find the associated loan
    const loan = await Loan.findById(fine.loanId);
    if (loan) {
      // Update loan's pending repayment if this fine was for a late repayment
      if (loan.pendingRepaymentId === transaction_uuid) {
        loan.pendingRepaymentId = undefined;
        loan.pendingRepaymentDetails = undefined;
        await loan.save();
      }
    }

    // Find the borrower
    const borrower = await User.findById(fine.borrowerId);
    if (borrower) {
      // Create notification for the borrower
      const notification = new Notification({
        userId: borrower._id,
        message: `You have successfully paid your late payment fine of Rs. ${fine.fineAmount.toFixed(
          2
        )}`,
        read: false,
      });
      await notification.save();

      // Emit real-time notification (assuming you have socket.io setup)
      if (req.io) {
        req.io.to(borrower._id.toString()).emit("newNotification", {
          message: notification.message,
          timestamp: notification.timestamp,
        });
      }
    }

    res.status(200).json({
      status: "success",
      data: fine,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Admin function to manually mark fine as paid (for testing/administrative purposes)
export const markFineAsPaid = async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.fineId);
    if (!fine) {
      return res.status(404).json({
        status: "fail",
        message: "Fine not found",
      });
    }

    fine.status = "paid";
    fine.paidAt = new Date();
    fine.transactionId = "admin-marked-paid"; // Special identifier for admin actions
    await fine.save();

    res.status(200).json({
      status: "success",
      data: fine,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
