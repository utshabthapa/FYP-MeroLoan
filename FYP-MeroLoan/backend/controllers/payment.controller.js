// controllers/paymentController.js
import crypto from "crypto";
import axios from "axios";
import { Transaction } from "../models/transaction.model.js";
import { ActiveContract } from "../models/activeContract.model.js";
import { Loan } from "../models/loan.model.js";
import CryptoJS from "crypto-js";

// const generateSignature = (data, secret) => {
//   console.log("Generating signature for data:", data);
//   console.log(secret);
//   const signatureData = `total_amount=${data.total_amount}&transaction_uuid=${data.transaction_uuid}&product_code=EPAYTEST`;
//   // const signatureData = amount=${data.amount},transaction_uuid=${data.transactionId},product_code=${data.productCode};

//   return crypto
//     .createHmac("sha256", secret)
//     .update(signatureData)
//     .digest("base64");
// };

const generateSignature = (data, secret) => {
  const hashString = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`;
  const hash = CryptoJS.HmacSHA256(hashString, secret);
  const hashedSignature = CryptoJS.enc.Base64.stringify(hash);
  return hashedSignature;
};

// Updated verifySignature using CryptoJS and the same string formatting
// const verifySignature = (data, secret, signature) => {
//   // Make sure the hash string is built exactly as in generateSignature
//   console.log("Verify signature for data:", data);
//   const hashString = `total_amount=${data.totalAmount},transaction_uuid=${data.transactionId},product_code=${data.productCode}`;
//   const hash = CryptoJS.HmacSHA256(hashString, secret);
//   const expectedSignature = CryptoJS.enc.Base64.stringify(hash);
//   console.log("Expected Signature:", expectedSignature);
//   console.log("Actual Signature:", signature);
//   return expectedSignature === signature;
// };

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

// export const verifyPayment = async (req, res) => {
//   try {
//     // Destructure the required fields from the incoming request.
//     // Ensure that total_amount is also provided in the request body.
//     const { transactionId, productCode, totalAmount, signature } = req.body;
//     console.log("Verifying transaction  with data:", {
//       transactionId,
//       productCode,
//       totalAmount,
//       signature,
//     });
//     // Verify the signature using the same method and string format as in generateSignature
//     const isValid = verifySignature(
//       { totalAmount, transactionId, productCode },
//       process.env.ESEWA_SECRET,
//       signature
//     );

//     if (!isValid) {
//       return res.status(400).json({ message: "Invalid signature" });
//     }

//     // Check payment status with eSewa
//     const response = await axios.post(process.env.ESEWA_STATUS_CHECK_URL, {
//       merchant_id: process.env.MERCHANT_ID,
//       transactionId,
//     });

//     if (response.data.status === "COMPLETE") {
//       // Update transaction status in your database
//       await Transaction.updateOne(
//         { _id: transactionId },
//         { status: "COMPLETED" }
//       );
//       return res.json({ success: true });
//     }

//     res.status(400).json({ message: "Payment verification failed" });
//   } catch (error) {
//     console.error("Error in verifyPayment:", error);
//     res.status(500).json({ message: "Payment verification error" });
//   }
// };
// controllers/paymentController.js

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
