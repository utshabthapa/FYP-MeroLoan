import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loanAmount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  duration: { type: Number, required: true }, // Duration in days
  repaymentType: {
    type: String,
    enum: ["one-time", "milestone"],
    required: true,
  },
  milestones: { type: Number, enum: [2, 3, 4], default: null }, // Optional for milestone repayment
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["active", "not active"],
    default: "not active",
  }, // Loan status
});

export const Loan = mongoose.model("Loan", loanSchema);
