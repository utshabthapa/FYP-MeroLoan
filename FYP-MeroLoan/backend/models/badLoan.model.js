// models/badLoan.model.js
import mongoose from "mongoose";

const badLoanSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveContract",
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    originalAmount: { type: Number, required: true },
    amountDue: { type: Number, required: true },
    daysOverdue: { type: Number, required: true },
    lastPaymentDate: { type: Date },
    status: {
      type: String,
      enum: ["ACTIVE", "RECOVERED", "WRITTEN_OFF"],
      default: "ACTIVE",
    },
    recoveryAttempts: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const BadLoan = mongoose.model("BadLoan", badLoanSchema);
