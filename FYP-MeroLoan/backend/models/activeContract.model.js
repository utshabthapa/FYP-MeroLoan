// models/ActiveContract.js
import mongoose from "mongoose";

const activeContractSchema = new mongoose.Schema(
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
      enum: ["ACTIVE", "COMPLETED", "DEFAULTED"],
      default: "ACTIVE",
    },
    repaymentSchedule: [
      {
        dueDate: Date,
        amountDue: Number,
        status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
      },
    ],
  },
  { timestamps: true }
);

export const ActiveContract = mongoose.model(
  "ActiveContract",
  activeContractSchema
);
