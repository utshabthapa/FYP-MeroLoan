import { KYC } from "../models/kyc.model.js";
import { User } from "../models/user.model.js";
import createError from "http-errors";
import {
  sendKYCApprovedEmail,
  sendKYCRejectedEmail,
} from "../mailtrap/emails.js";

// Submit KYC (with file uploads)
export const submitKYC = async (req, res) => {
  try {
    // console.log("Request body:", req.body);
    const {
      userId,
      fatherName,
      motherName,
      grandfatherName,
      spouseName,
      dob,
      gender,
      occupation,
      district,
      municipality,
      ward,
      identityType,
      identityNumber,
      issuedPlace,
      issuedDate,
      identityCardFront,
      identityCardBack,
    } = req.body;

    // Find user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user already has a KYC record
    if (user.kycId) {
      await KYC.findByIdAndDelete(user.kycId);
    }

    // Create new KYC record
    const newKYC = await KYC.create({
      userId,
      fatherName,
      motherName,
      grandfatherName,
      spouseName,
      dob,
      gender,
      occupation,
      district,
      municipality,
      ward,
      identityType,
      identityNumber,
      issuedPlace,
      issuedDate,
      identityCardFront,
      identityCardBack,
    });

    // Update user record with new KYC details
    user.kycId = newKYC._id;
    user.kycStatus = "pending";
    await user.save();

    res.status(201).json({
      success: true,
      message: "KYC submitted successfully",
      data: newKYC,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch all KYC requests (Admin)
export const fetchKYCRequests = async (req, res) => {
  try {
    const kycRequests = await KYC.find().populate("userId", "email name"); // Populate user details if needed
    res.status(200).json({
      success: true,
      message: "KYC requests fetched successfully",
      data: kycRequests,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch KYC requests" });
  }
};

// Fetch single KYC request (Admin or User)
export const fetchSingleKYCRequest = async (req, res) => {
  const { kycId } = req.params;
  console.log("kyc id from the frontend:", kycId);

  try {
    let kycRequest;
    if (kycId) {
      // Admin fetching by KYC ID
      kycRequest = await KYC.findById(kycId).populate("userId", "email name");
    } else if (req.userId) {
      // User fetching their own KYC (if they are the one making the request)
      kycRequest = await KYC.findOne({ userId: req.userId }).populate(
        "userId",
        "email username"
      );
    }

    if (!kycRequest) {
      return res
        .status(404)
        .json({ success: false, message: "KYC request not found" });
    }

    res.status(200).json({
      success: true,
      message: "KYC request fetched successfully",
      data: kycRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch KYC request" });
  }
};

// Updated verifyKYC function
export const verifyKYC = async (req, res) => {
  const { kycId, status } = req.body;

  try {
    // Update KYC status
    const kyc = await KYC.findByIdAndUpdate(kycId, { status }, { new: true });
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    // Find the user associated with the KYC
    const user = await User.findById(kyc.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update user's KYC status
    const userStatus = status === "approved" ? "approved" : "rejected";
    user.kycStatus = userStatus;

    // Update user's creditScore based on KYC status
    if (status === "approved") {
      user.creditScore = Math.min(user.creditScore + 2, 100); // Increase by 2, but cap at 100

      // Send KYC approval email
      await sendKYCApprovedEmail(user.email, user.name);
    } else if (status === "rejected") {
      user.creditScore = Math.max(user.creditScore - 2, 0); // Decrease by 2, but not below 0

      // Send KYC rejection email
      await sendKYCRejectedEmail(user.email, user.name);
    }

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: `KYC ${status} successfully`,
      data: kyc,
    });
  } catch (error) {
    console.error("Error in verifyKYC:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify KYC",
      error: error.message,
    });
  }
};
