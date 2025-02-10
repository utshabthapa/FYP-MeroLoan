import mongoose from "mongoose";

const activeContractSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
    },
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
    amount: {
      type: Number,
      required: true,
    },
    insuranceAdded: {
      type: Boolean,
      default: false,
    },
    repaymentType: {
      type: String,
      enum: ["one_time", "milestone"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "defaulted"],
      default: "active",
    },
    repaymentSchedule: [
      {
        dueDate: Date,
        amountDue: Number,
        status: {
          type: String,
          enum: ["pending", "paid"],
          default: "pending",
        },
        milestoneNumber: Number, // This field will be set by the controller when applicable
      },
    ],
    totalRepaymentAmount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const ActiveContract = mongoose.model(
  "ActiveContract",
  activeContractSchema
);
