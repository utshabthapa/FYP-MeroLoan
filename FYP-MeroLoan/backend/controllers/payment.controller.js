// controllers/paymentController.js
import crypto from "crypto";
import axios from "axios";
import { Transaction } from "../models/transaction.model.js";
import { ActiveContract } from "../models/activeContract.model.js";
import { Loan } from "../models/loan.model.js";
import CryptoJS from "crypto-js";

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
    const taxAmount = 10;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;
    const totalAmount =
      amount + taxAmount + productServiceCharge + productDeliveryCharge;

    // Create transaction record
    const transaction = await Transaction.create({
      loan: loanId,
      amount,
      lender: lenderId,
      borrower: borrowerId,
      insuranceAdded,
      status: "PENDING",
    });

    const loan = await Loan.findById(loanId);

    loan.transactionId = transaction._id;
    await loan.save();

    // Prepare eSewa payload
    const payload = {
      amount: amount.toString(),
      tax_amount: taxAmount.toString(),
      product_service_charge: productServiceCharge.toString(),
      product_delivery_charge: productDeliveryCharge.toString(),
      total_amount: totalAmount.toString(),
      transaction_uuid: transaction._id.toString(),
      product_code: process.env.MERCHANT_ID,
      // success_url: `${process.env.CLIENT_URL}/payment-success`,
      // failure_url: `${process.env.CLIENT_URL}/payment-failure`,
      success_url: "http://localhost:5173/payment-success",
      failure_url: "http://localhost:5173/payment-failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    // Generate signature
    payload.signature = generateSignature(payload, process.env.ESEWA_SECRET);

    // Return the payment payload for form submission
    console.log("eSewa Payload:", payload);
    res.json({ paymentPayload: payload });
  } catch (error) {
    console.error("Error in initiatePayment:", error);
    res
      .status(500)
      .json({ message: "Payment initiation failed", error: error.message });
  }
};

export const paymentSuccess = async (req, res) => {
  try {
    // eSewa should pass back the transaction id.
    // Depending on eSewa’s implementation, this might be in req.query or req.body.
    const { transaction_uuid } = req.query;
    if (!transaction_uuid) {
      return res.status(400).json({ message: "Missing transaction id" });
    }

    // Find the corresponding transaction
    const transaction = await Transaction.findById(transaction_uuid);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update the transaction status to SUCCESS
    transaction.status = "COMPLETED";
    await transaction.save();

    // Update the associated loan status to active
    const loan = await Loan.findById(transaction.loan);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    loan.status = "active";
    await loan.save();

    // Optionally, you can redirect to your client’s payment success page:
    // res.redirect(`${process.env.CLIENT_URL}/payment-success`);

    // Or send a JSON response:
    res.json({ message: "Payment successful. Loan activated." });
  } catch (error) {
    console.error("Error in paymentSuccess:", error);
    res.status(500).json({
      message: "Error processing payment success",
      error: error.message,
    });
  }
};
