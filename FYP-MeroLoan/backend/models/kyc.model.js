import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    grandfatherName: String,
    spouseName: String,
    dob: { type: Date, required: true }, // Ensure it's a valid date
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    occupation: String,
    district: { type: String, required: true },
    municipality: { type: String, required: true },
    ward: { type: String, required: true },
    identityType: {
      type: String,
      enum: ["citizenship", "license", "passport"],
      required: true,
    },
    identityNumber: { type: String, required: true },
    issuedPlace: { type: String, required: true },
    issuedDate: { type: Date, required: true },
    identityCardFront: { type: String, required: true },
    identityCardBack: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

export const KYC = mongoose.model("KYC", kycSchema);
