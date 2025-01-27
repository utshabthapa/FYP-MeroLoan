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
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    profilePicture: {
      // Add the profile picture field
      type: String,
      default: "", // Default is an empty string
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
