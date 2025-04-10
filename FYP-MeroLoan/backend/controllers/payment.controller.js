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
import { Fine } from "../models/fine.model.js";

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

    // Update lender's credit score based on lending amount
    const lendingAmount = loan.pendingRepaymentDetails.amount;
    let creditScoreIncrease = 0;

    // Determine credit score increase based on lending amount
    if (lendingAmount >= 500 && lendingAmount < 1000) {
      creditScoreIncrease = 1;
    } else if (lendingAmount >= 1000 && lendingAmount < 5000) {
      creditScoreIncrease = 2;
    } else if (lendingAmount >= 5000 && lendingAmount < 10000) {
      creditScoreIncrease = 3;
    } else if (lendingAmount >= 10000 && lendingAmount < 50000) {
      creditScoreIncrease = 5;
    } else if (lendingAmount >= 50000 && lendingAmount < 100000) {
      creditScoreIncrease = 8;
    } else if (lendingAmount >= 100000 && lendingAmount <= 500000) {
      creditScoreIncrease = 15;
    } else if (lendingAmount < 500) {
      creditScoreIncrease = 0; // No increase for amounts less than 500
    }

    // Apply credit score increase to lender
    if (lender && creditScoreIncrease > 0) {
      lender.creditScore = Math.min(
        lender.creditScore + creditScoreIncrease,
        100
      ); // Cap at 100
      await lender.save();
    }

    // Notification for Lender
    const lenderNotification = new Notification({
      userId: loan.pendingRepaymentDetails.lenderId,
      message: `Your transaction has been processed. You will be notified as soon as it gets verified.${
        creditScoreIncrease > 0
          ? ` Your credit score has increased by ${creditScoreIncrease} points.`
          : ""
      }`,
      timestamp: new Date(),
    });
    await lenderNotification.save();

    // Emit real-time notification to the lender
    io.to(loan.pendingRepaymentDetails.lenderId).emit("newNotification", {
      message: lenderNotification.message,
      timestamp: lenderNotification.timestamp,
    });

    // Notification for Borrower
    const borrowerNotification = new Notification({
      userId: loan.pendingRepaymentDetails.borrowerId,
      message: `${lender.name} just lent you $${loan.pendingRepaymentDetails.amount}. Your loan contract is active now. Repay the loan on time.`,
      timestamp: new Date(),
    });
    await borrowerNotification.save();

    // Emit real-time notification to the borrower
    io.to(loan.pendingRepaymentDetails.borrowerId).emit("newNotification", {
      message: borrowerNotification.message,
      timestamp: borrowerNotification.timestamp,
    });

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
      lenderCreditScoreIncrease: creditScoreIncrease,
    });
  } catch (error) {
    console.error("Error in paymentSuccess:", error);
    res.status(500).json({
      message: "Error processing payment success",
      error: error.message,
    });
  }
};

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

    let isOnTime = true;
    let daysLate = 0;
    let milestoneIndex = -1;
    let fineAmount = 0;
    let finePercent = 0;

    // Check if payment is late and calculate fine
    if (loan.pendingRepaymentDetails.isMilestonePayment) {
      milestoneIndex = loan.pendingRepaymentDetails.milestoneNumber - 1;

      if (
        milestoneIndex >= 0 &&
        milestoneIndex < activeContract.repaymentSchedule.length
      ) {
        const milestone = activeContract.repaymentSchedule[milestoneIndex];
        const dueDate = new Date(milestone.dueDate);
        const currentDate = new Date();

        isOnTime = currentDate <= dueDate;

        if (!isOnTime) {
          const timeDiff = currentDate.getTime() - dueDate.getTime();
          daysLate = Math.floor(timeDiff / (1000 * 3600 * 24));

          // Calculate fine based on days late
          if (daysLate <= 7) {
            finePercent = 5; // Minor delay: 5%
          } else if (daysLate <= 14) {
            finePercent = 10; // Moderate delay: 10%
          } else if (daysLate <= 30) {
            finePercent = 18; // Serious delay: 18%
          } else {
            finePercent = 25; // Very late: 25%
          }

          fineAmount =
            (loan.pendingRepaymentDetails.amount * finePercent) / 100;

          // Create fine record
          const fine = new Fine({
            loanId: loan._id,
            borrowerId: loan.pendingRepaymentDetails.borrowerId,
            originalAmount: loan.pendingRepaymentDetails.amount,
            finePercent: finePercent,
            fineAmount: fineAmount,
            daysLate: daysLate,
            status: "pending",
          });
          await fine.save();

          // Add fine to the milestone record
          milestone.fine = fine._id;
        }
      }
    }

    // Update the repayment schedule in the active contract
    if (loan.pendingRepaymentDetails.isMilestonePayment) {
      if (
        milestoneIndex >= 0 &&
        milestoneIndex < activeContract.repaymentSchedule.length
      ) {
        activeContract.repaymentSchedule[milestoneIndex].status = "paid";
        activeContract.repaymentSchedule[milestoneIndex].paidAt = new Date();
        activeContract.repaymentSchedule[milestoneIndex].transactionId =
          transaction._id;

        // Record if it was paid late
        if (!isOnTime) {
          activeContract.repaymentSchedule[milestoneIndex].paidLate = true;
          activeContract.repaymentSchedule[milestoneIndex].daysLate = daysLate;
        }
      }
    } else {
      // For one-time payments, mark all as paid
      activeContract.repaymentSchedule.forEach((milestone, index) => {
        milestone.status = "paid";
        milestone.paidAt = new Date();
        milestone.transactionId = transaction._id;

        // Check if this payment is late
        const dueDate = new Date(milestone.dueDate);
        const currentDate = new Date();
        const isMilestoneLate = currentDate > dueDate;

        if (isMilestoneLate) {
          const timeDiff = currentDate.getTime() - dueDate.getTime();
          const milestoneDaysLate = Math.floor(timeDiff / (1000 * 3600 * 24));

          milestone.paidLate = true;
          milestone.daysLate = milestoneDaysLate;

          // Update overall late status
          isOnTime = false;
          daysLate = Math.max(daysLate, milestoneDaysLate);
        }
      });
    }

    // Check if all milestones are paid
    const allPaid = activeContract.repaymentSchedule.every(
      (milestone) => milestone.status === "paid"
    );

    // Fetch lender and borrower details
    // Inside the repaymentSuccess function, after checking if all milestones are paid
    if (allPaid) {
      const lender = await User.findById(loan.pendingRepaymentDetails.lenderId);
      const borrower = await User.findById(
        loan.pendingRepaymentDetails.borrowerId
      );
      activeContract.status = "completed";
      loan.status = "completed";

      // Fetch full borrower and lender details if needed
      const borrowerFull = await User.findById(
        loan.pendingRepaymentDetails.borrowerId
      );
      const lenderFull = await User.findById(
        loan.pendingRepaymentDetails.lenderId
      );

      // Create notification for borrower about contract completion
      const borrowerCompletionNotification = new Notification({
        userId: loan.pendingRepaymentDetails.borrowerId,
        message: `Your loan contract with ${lender.name} has been completed. Thank you for repaying on time.`,
        timestamp: new Date(),
      });
      await borrowerCompletionNotification.save();

      // Create notification for lender about contract completion
      const lenderCompletionNotification = new Notification({
        userId: loan.pendingRepaymentDetails.lenderId,
        message: `Your loan contract with ${borrower.name} has been completed. The loan has been fully repaid.`,
        timestamp: new Date(),
      });
      await lenderCompletionNotification.save();

      // Emit real-time notification to the borrower
      io.to(loan.pendingRepaymentDetails.borrowerId).emit("newNotification", {
        message: borrowerCompletionNotification.message,
        timestamp: borrowerCompletionNotification.timestamp,
      });

      // Emit real-time notification to the lender
      io.to(loan.pendingRepaymentDetails.lenderId).emit("newNotification", {
        message: lenderCompletionNotification.message,
        timestamp: lenderCompletionNotification.timestamp,
      });
    }

    // Save the updated active contract
    await activeContract.save();
    const lender = await User.findById(loan.pendingRepaymentDetails.lenderId);
    const borrower = await User.findById(
      loan.pendingRepaymentDetails.borrowerId
    );

    // Update borrower's credit score based on payment amount and timeliness
    const repaymentAmount = loan.pendingRepaymentDetails.amount;
    let creditScoreChange = 0;

    if (isOnTime) {
      if (repaymentAmount >= 500 && repaymentAmount < 1000) {
        creditScoreChange = 1; // Small boost
      } else if (repaymentAmount >= 1000 && repaymentAmount < 5000) {
        creditScoreChange = 2;
      } else if (repaymentAmount >= 5000 && repaymentAmount < 10000) {
        creditScoreChange = 3;
      } else if (repaymentAmount >= 10000 && repaymentAmount < 50000) {
        creditScoreChange = 5;
      } else if (repaymentAmount >= 50000 && repaymentAmount < 100000) {
        creditScoreChange = 8;
      } else if (repaymentAmount >= 100000 && repaymentAmount <= 500000) {
        creditScoreChange = 12; // Max increase for big repayments
      } else if (repaymentAmount < 500) {
        creditScoreChange = 0; // No change for tiny repayments
      }
    } else {
      if (daysLate <= 7) {
        creditScoreChange = -10; // Minor delay: -10
      } else if (daysLate <= 14) {
        creditScoreChange = -20; // Moderate delay: -20
      } else if (daysLate <= 30) {
        creditScoreChange = -30; // Serious delay: -30
      } else {
        creditScoreChange = -50; // Very late: Harsh penalty (-50)
      }
    }

    // Apply credit score change
    if (borrower && creditScoreChange !== 0) {
      if (creditScoreChange > 0) {
        borrower.creditScore = Math.min(
          borrower.creditScore + creditScoreChange,
          100
        ); // Cap at 100
      } else {
        borrower.creditScore = Math.max(
          borrower.creditScore + creditScoreChange,
          0
        ); // Floor at 0
      }
      await borrower.save();
    }

    // Notification message based on credit score change
    let creditScoreMessage = "";
    if (creditScoreChange > 0) {
      creditScoreMessage = ` Your credit score has increased by ${creditScoreChange} points.`;
    } else if (creditScoreChange < 0) {
      creditScoreMessage = ` Your credit score has decreased by ${Math.abs(
        creditScoreChange
      )} points due to late payment.`;
    }

    // Update the notification messages to include fine information if applicable
    if (!isOnTime) {
      // Notification for Borrower - updated to include fine
      const borrowerNotification = new Notification({
        userId: loan.pendingRepaymentDetails.borrowerId,
        message: `Your repayment was processed but was ${daysLate} days late. A fine of ${finePercent}% ($${fineAmount.toFixed(
          2
        )}) has been applied.${creditScoreMessage}`,
        timestamp: new Date(),
      });
      await borrowerNotification.save();

      // Emit real-time notification
      io.to(loan.pendingRepaymentDetails.borrowerId).emit("newNotification", {
        message: borrowerNotification.message,
        timestamp: borrowerNotification.timestamp,
      });

      // Notification for Lender - updated to include fine
      const lenderNotification = new Notification({
        userId: loan.pendingRepaymentDetails.lenderId,
        message: `You got repaid $${loan.pendingRepaymentDetails.amount} by ${
          borrower.name
        } (${daysLate} days late). A fine of ${finePercent}% ($${fineAmount.toFixed(
          2
        )}) will be collected.`,
        timestamp: new Date(),
      });
      await lenderNotification.save();

      // Emit real-time notification
      io.to(loan.pendingRepaymentDetails.lenderId).emit("newNotification", {
        message: lenderNotification.message,
        timestamp: lenderNotification.timestamp,
      });
    } else {
      // Notification for Borrower
      const borrowerNotification = new Notification({
        userId: loan.pendingRepaymentDetails.borrowerId,
        message: `Your repayment transaction has been processed. You will be notified as soon as it gets verified.${creditScoreMessage}`,
        timestamp: new Date(),
      });
      await borrowerNotification.save();

      // Emit real-time notification to the borrower
      io.to(loan.pendingRepaymentDetails.borrowerId).emit("newNotification", {
        message: borrowerNotification.message,
        timestamp: borrowerNotification.timestamp,
      });

      // Notification for Lender
      const lenderNotification = new Notification({
        userId: loan.pendingRepaymentDetails.lenderId,
        message: `You got repaid $${loan.pendingRepaymentDetails.amount} by ${
          borrower.name
        }${!isOnTime ? ` (${daysLate} days late)` : ""}.`,
        timestamp: new Date(),
      });
      await lenderNotification.save();

      // Emit real-time notification to the lender
      io.to(loan.pendingRepaymentDetails.lenderId).emit("newNotification", {
        message: lenderNotification.message,
        timestamp: lenderNotification.timestamp,
      });
    }
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

    // Update the response to include fine information
    res.json({
      message: "Repayment successful.",
      transactionId: transaction._id,
      loanId: loan._id,
      activeContractId: activeContract._id,
      allMilestonesPaid: allPaid,
      creditScoreChange: creditScoreChange,
      isLate: !isOnTime,
      daysLate: isOnTime ? 0 : daysLate,
      fineApplied: !isOnTime,
      finePercent: !isOnTime ? finePercent : 0,
      fineAmount: !isOnTime ? fineAmount : 0,
    });
  } catch (error) {
    console.error("Error in repaymentSuccess:", error);
    res.status(500).json({
      message: "Error processing repayment success",
      error: error.message,
    });
  }
};
