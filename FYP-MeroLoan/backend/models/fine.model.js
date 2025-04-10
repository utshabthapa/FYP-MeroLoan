import mongoose from "mongoose";

const fineSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: "Loan", required: true },
  borrowerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalAmount: { type: Number, required: true }, // The repayment amount that was late
  finePercent: { type: Number, required: true }, // The percentage applied (5, 10, 18, 25)
  fineAmount: { type: Number, required: true }, // The calculated fine amount
  daysLate: { type: Number, required: true }, // How many days late the payment was
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }, // Reference to payment transaction if paid
});

export const Fine = mongoose.model("Fine", fineSchema);
