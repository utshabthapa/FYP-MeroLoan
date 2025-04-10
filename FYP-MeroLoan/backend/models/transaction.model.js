// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    loan: { type: mongoose.Schema.Types.ObjectId, ref: "Loan", required: true },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    insuranceAdded: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    type: {
      type: String,
      enum: ["LENDING", "REPAYMENT", "FINE"], // Two possible values
    },
    adminTransfer: { type: Boolean, default: false }, // New field added
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
