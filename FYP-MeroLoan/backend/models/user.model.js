import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    public_id: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate phone numbers
      match: /^\d{10}$/, // Ensures the phone number is exactly 10 digits
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    kycStatus: {
      type: String,
      enum: ["notApplied", "pending", "approved", "rejected"],
      default: "notApplied",
    },
    kycId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KYC",
    },
    loanIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan", // Reference to the Loan model
      },
    ],
    transactionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction", // Reference to the Loan model
      },
    ],
    activeContractIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ActiveContract", // Reference to the Loan model
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
