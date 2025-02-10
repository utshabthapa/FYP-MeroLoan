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
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
