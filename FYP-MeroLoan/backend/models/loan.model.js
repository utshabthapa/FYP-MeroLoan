import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
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
    enum: ["active", "not active", "completed"],
    default: "not active",
  }, // Loan status

  // Add reference to ActiveContract
  activeContract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActiveContract",
  },

  // Renamed fields to match with repayment controller
  pendingRepaymentId: { type: String },
  pendingRepaymentDetails: {
    amount: Number,
    lenderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isMilestonePayment: { type: Boolean },
    milestoneNumber: { type: Number },
    timestamp: Date,
  },
});
// const loanSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   transactionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Transaction",
//   },
//   loanAmount: { type: Number, required: true },
//   interestRate: { type: Number, required: true },
//   duration: { type: Number, required: true }, // Duration in days
//   repaymentType: {
//     type: String,
//     enum: ["one-time", "milestone"],
//     required: true,
//   },
//   milestones: { type: Number, enum: [2, 3, 4], default: null }, // Optional for milestone repayment
//   appliedAt: { type: Date, default: Date.now },
//   status: {
//     type: String,
//     enum: ["active", "not active", "completed"],
//     default: "not active",
//   }, // Loan status
//   // Add reference to ActiveContract
//   activeContract: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "ActiveContract",
//   },
//   // Renamed fields to match with repayment controller
//   pendingRepaymentId: { type: String },
//   pendingRepaymentDetails: {
//     amount: Number,
//     lenderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     isMilestonePayment: { type: Boolean },
//     milestoneNumber: { type: Number },
//     timestamp: Date,
//   },
// });

export const Loan = mongoose.model("Loan", loanSchema);
