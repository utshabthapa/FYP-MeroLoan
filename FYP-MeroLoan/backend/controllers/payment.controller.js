// controllers/paymentController.js
import crypto from "crypto";
import axios from "axios";
import { Transaction } from "../models/transaction.model.js";
import { ActiveContract } from "../models/activeContract.model.js";
import { Loan } from "../models/loan.model.js";
import CryptoJS from "crypto-js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js"; // Import the Notification model
import { io } from "../index.js"; // Import the `io` instance for real-time notifications

const generateSignature = (data, secret) => {
  const hashString = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`;
  const hash = CryptoJS.HmacSHA256(hashString, secret);
  const hashedSignature = CryptoJS.enc.Base64.stringify(hash);
  return hashedSignature;
};

// controllers/paymentController.js
export const initiatePayment = async (req, res) => {
  try {
    const { amount, loanId, insuranceAdded, lenderId, borrowerId } = req.body;

    // Calculate total amount based on eSewa requirements
    const taxAmount = 0;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;
    const totalAmount =
      amount + taxAmount + productServiceCharge + productDeliveryCharge;

    // Find the loan and update it with pending payment info
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Create a unique ID for this payment attempt
    const paymentAttemptId = crypto.randomUUID();

    // Update loan with pending payment details
    loan.pendingRepaymentId = paymentAttemptId;
    loan.pendingRepaymentDetails = {
      amount,
      lenderId,
      borrowerId,
      insuranceAdded,
      timestamp: new Date(),
    };
    await loan.save();

    // Prepare eSewa payload
    const payload = {
      amount: amount.toString(),
      tax_amount: taxAmount.toString(),
      product_service_charge: productServiceCharge.toString(),
      product_delivery_charge: productDeliveryCharge.toString(),
      total_amount: totalAmount.toString(),
      transaction_uuid: paymentAttemptId,
      product_code: process.env.MERCHANT_ID,
      success_url: "http://localhost:5173/payment-success",
      failure_url: "http://localhost:5173/payment-failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    // Generate signature
    payload.signature = generateSignature(payload, process.env.ESEWA_SECRET);

    // Return the payment payload for form submission
    console.log("eSewa Payload:", payload);
    res.json({
      paymentPayload: payload,
      loanId: loanId, // Include loanId in response for tracking
    });
  } catch (error) {
    console.error("Error in initiatePayment:", error);
    res
      .status(500)
      .json({ message: "Payment initiation failed", error: error.message });
  }
};

export const paymentSuccess = async (req, res) => {
  try {
    // Get only transaction_uuid from query parameters
    const { transaction_uuid } = req.query;
    console.log("Payment Success - Transaction UUID:", transaction_uuid);

    if (!transaction_uuid) {
      return res.status(400).json({ message: "Missing transaction ID" });
    }

    // Find the loan by pendingPaymentId
    const loan = await Loan.findOne({ pendingRepaymentId: transaction_uuid });

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Create the transaction record since payment was successful
    const transaction = await Transaction.create({
      loan: loan._id,
      amount: loan.pendingRepaymentDetails.amount,
      lender: loan.pendingRepaymentDetails.lenderId,
      borrower: loan.pendingRepaymentDetails.borrowerId,
      insuranceAdded: loan.pendingRepaymentDetails.insuranceAdded,
      status: "PENDING",
      type: "LENDING",
    });

    // Fetch lender and borrower details
    const lender = await User.findById(loan.pendingRepaymentDetails.lenderId);
    const borrower = await User.findById(
      loan.pendingRepaymentDetails.borrowerId
    );

    // Notification for Lender
    const lenderNotification = new Notification({
      userId: loan.pendingRepaymentDetails.lenderId,
      message: `Your transaction has been processed. You will be notified as soon as it gets verified.`,
      timestamp: new Date(),
    });
    await lenderNotification.save();

    // Emit real-time notification to the lender
    io.to(loan.pendingRepaymentDetails.lenderId.toString()).emit(
      "newNotification",
      {
        message: lenderNotification.message,
        timestamp: lenderNotification.timestamp,
      }
    );

    // Notification for Borrower
    const borrowerNotification = new Notification({
      userId: loan.pendingRepaymentDetails.borrowerId,
      message: `${lender.name} just lent you $${loan.pendingRepaymentDetails.amount}. Your loan contract is active now. Repay the loan on time.`,
      timestamp: new Date(),
    });
    await borrowerNotification.save();

    // Emit real-time notification to the borrower
    io.to(loan.pendingRepaymentDetails.borrowerId.toString()).emit(
      "newNotification",
      {
        message: borrowerNotification.message,
        timestamp: borrowerNotification.timestamp,
      }
    );
    // Update user to add transaction ID
    const user = await User.findById(loan.pendingRepaymentDetails.borrowerId);
    if (user) {
      user.transactionIds = user.transactionIds || [];
      user.transactionIds.push(transaction._id);
      await user.save();
    }

    // Update loan status and reference
    loan.status = "active";
    loan.transactionId = transaction._id;

    // Clear the pending payment data
    loan.pendingRepaymentId = undefined;
    loan.pendingRepaymentDetails = undefined;

    await loan.save();

    // Send a JSON response or redirect to frontend success page
    res.json({
      message: "Payment successful. Loan activated.",
      transactionId: transaction._id,
      loanId: loan._id,
    });
  } catch (error) {
    console.error("Error in paymentSuccess:", error);
    res.status(500).json({
      message: "Error processing payment success",
      error: error.message,
    });
  }
};

// Add a payment failure handler
// export const paymentFailure = async (req, res) => {
//   try {
//     const { transaction_uuid, loanId } = req.query;

//     // Find the loan either by ID or by pendingPaymentId
//     let loan;
//     if (loanId) {
//       loan = await Loan.findById(loanId);
//     } else if (transaction_uuid) {
//       loan = await Loan.findOne({ pendingPaymentId: transaction_uuid });
//     }

//     if (loan) {
//       // Clear the pending payment data
//       loan.pendingPaymentId = undefined;
//       loan.pendingPaymentDetails = undefined;
//       await loan.save();
//     }

//     res.json({
//       message: "Payment failed. No transaction was created.",
//       loanId: loan ? loan._id : null,
//     });
//   } catch (error) {
//     console.error("Error in paymentFailure:", error);
//     res.status(500).json({
//       message: "Error processing payment failure",
//       error: error.message,
//     });
//   }
// };

// Add these functions to your paymentController.js

// Initiate repayment for borrowers
export const initiateRepayment = async (req, res) => {
  try {
    const {
      amount,
      loanId,
      isMilestonePayment,
      milestoneNumber,
      borrowerId,
      lenderId,
    } = req.body;

    // Calculate total amount based on eSewa requirements
    const taxAmount = 0;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;
    const totalAmount =
      amount + taxAmount + productServiceCharge + productDeliveryCharge;

    // Find the loan and its active contract
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Find the active contract for this loan
    const activeContract = await ActiveContract.findOne({ loan: loanId });
    if (!activeContract) {
      return res
        .status(404)
        .json({ message: "Active contract not found for this loan" });
    }

    // Create a unique ID for this repayment attempt
    const repaymentAttemptId = crypto.randomUUID();

    // Update loan with pending repayment details
    loan.pendingRepaymentId = repaymentAttemptId;
    loan.pendingRepaymentDetails = {
      amount,
      borrowerId,
      lenderId: lenderId || activeContract.lender,
      isMilestonePayment,
      milestoneNumber,
      timestamp: new Date(),
    };
    await loan.save();

    // Prepare eSewa payload
    const payload = {
      amount: amount.toString(),
      tax_amount: taxAmount.toString(),
      product_service_charge: productServiceCharge.toString(),
      product_delivery_charge: productDeliveryCharge.toString(),
      total_amount: totalAmount.toString(),
      transaction_uuid: repaymentAttemptId,
      product_code: process.env.MERCHANT_ID,
      success_url: "http://localhost:5173/repayment-success",
      failure_url: "http://localhost:5173/payment-failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    // Generate signature
    payload.signature = generateSignature(payload, process.env.ESEWA_SECRET);

    // Return the payment payload for form submission
    console.log("eSewa Repayment Payload:", payload);
    res.json({
      paymentPayload: payload,
      loanId: loanId,
      activeContractId: activeContract._id,
    });
  } catch (error) {
    console.error("Error in initiateRepayment:", error);
    res
      .status(500)
      .json({ message: "Repayment initiation failed", error: error.message });
  }
};

// Process repayment success
// Process repayment success
export const repaymentSuccess = async (req, res) => {
  try {
    // Get only transaction_uuid from query parameters
    const { transaction_uuid } = req.query;
    // console.log("Repayment Success - Transaction UUID:", transaction_uuid);

    if (!transaction_uuid) {
      return res.status(400).json({ message: "Missing transaction ID" });
    }

    // Find the loan by pendingRepaymentId
    const loan = await Loan.findOne({ pendingRepaymentId: transaction_uuid });

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Find the active contract for this loan
    const activeContract = await ActiveContract.findOne({ loan: loan._id });
    if (!activeContract) {
      return res.status(404).json({ message: "Active contract not found" });
    }

    // Create the transaction record for the repayment
    const transaction = await Transaction.create({
      loan: loan._id,
      amount: loan.pendingRepaymentDetails.amount,
      borrower: loan.pendingRepaymentDetails.borrowerId,
      lender: loan.pendingRepaymentDetails.lenderId,
      // type: "repayment",
      status: "PENDING",
      type: "REPAYMENT",
    });

    // Update the repayment schedule in the active contract
    if (loan.pendingRepaymentDetails.isMilestonePayment) {
      const milestoneIndex = loan.pendingRepaymentDetails.milestoneNumber - 1;

      if (
        milestoneIndex >= 0 &&
        milestoneIndex < activeContract.repaymentSchedule.length
      ) {
        activeContract.repaymentSchedule[milestoneIndex].status = "paid";
        activeContract.repaymentSchedule[milestoneIndex].paidAt = new Date();
        activeContract.repaymentSchedule[milestoneIndex].transactionId =
          transaction._id;
      }
    } else {
      // For one-time payments, mark all as paid
      activeContract.repaymentSchedule.forEach((milestone, index) => {
        milestone.status = "paid";
        milestone.paidAt = new Date();
        milestone.transactionId = transaction._id;
      });
    }

    // Check if all milestones are paid
    const allPaid = activeContract.repaymentSchedule.every(
      (milestone) => milestone.status === "paid"
    );

    if (allPaid) {
      activeContract.status = "completed";
      loan.status = "completed";
    }

    // Save the updated active contract
    await activeContract.save();

    // Fetch lender and borrower details
    const lender = await User.findById(loan.pendingRepaymentDetails.lenderId);
    const borrower = await User.findById(
      loan.pendingRepaymentDetails.borrowerId
    );

    // Notification for Borrower
    const borrowerNotification = new Notification({
      userId: loan.pendingRepaymentDetails.borrowerId,
      message: `Your repayment transaction has been processed. You will be notified as soon as it gets verified.`,
      timestamp: new Date(),
    });
    await borrowerNotification.save();

    // Emit real-time notification to the borrower
    io.to(loan.pendingRepaymentDetails.borrowerId.toString()).emit(
      "newNotification",
      {
        message: borrowerNotification.message,
        timestamp: borrowerNotification.timestamp,
      }
    );

    // Notification for Lender
    const lenderNotification = new Notification({
      userId: loan.pendingRepaymentDetails.lenderId,
      message: `You got repaid $${loan.pendingRepaymentDetails.amount} by ${borrower.name}.`,
      timestamp: new Date(),
    });
    await lenderNotification.save();

    // Emit real-time notification to the lender
    io.to(loan.pendingRepaymentDetails.lenderId.toString()).emit(
      "newNotification",
      {
        message: lenderNotification.message,
        timestamp: lenderNotification.timestamp,
      }
    );

    // Update user to add transaction ID
    const user = await User.findById(loan.pendingRepaymentDetails.borrowerId);
    if (user) {
      user.transactionIds = user.transactionIds || [];
      user.transactionIds.push(transaction._id);
      await user.save();
    }

    // Clear the pending repayment data
    loan.pendingRepaymentId = undefined;
    loan.pendingRepaymentDetails = undefined;
    await loan.save();

    // Send a JSON response or redirect to frontend success page
    res.json({
      message: "Repayment successful.",
      transactionId: transaction._id,
      loanId: loan._id,
      activeContractId: activeContract._id,
      allMilestonesPaid: allPaid,
    });
  } catch (error) {
    console.error("Error in repaymentSuccess:", error);
    res.status(500).json({
      message: "Error processing repayment success",
      error: error.message,
    });
  }
};
