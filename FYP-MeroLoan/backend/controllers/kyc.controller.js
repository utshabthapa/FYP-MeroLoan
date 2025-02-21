import { KYC } from "../models/kyc.model.js";
import { User } from "../models/user.model.js";
import createError from "http-errors";

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

// Approve or Reject KYC (Admin)
export const verifyKYC = async (req, res) => {
  const { kycId, status } = req.body;

  try {
    const kyc = await KYC.findByIdAndUpdate(kycId, { status }, { new: true });
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    const userStatus = status === "approved" ? "approved" : "rejected";
    const user = await User.findById(kyc.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.kycStatus = userStatus; // Update user's KYC status
    await user.save(); // Save the updated user

    res.status(200).json({
      success: true,
      message: `KYC ${status} successfully`,
      data: kyc,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to verify KYC" });
  }
};
