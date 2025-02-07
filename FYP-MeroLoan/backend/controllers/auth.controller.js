import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { set } from "mongoose";
import multer from "multer";
import path from "path";

import cloudinary from "../utils/cloudinary.js";

export const signup = async (req, res) => {
  const {
    email,
    password,
    name,
    address,
    phone,
    image,
    kycStatus,
    kycId,
    public_id,
  } = req.body;
  try {
    if (!email || !password || !name || !address || !phone) {
      throw new Error("All input is required");
    }

    const useralreadyexists = await User.findOne({ email });
    const phonealreadyexists = await User.findOne({ phone });
    if (useralreadyexists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    if (phonealreadyexists) {
      return res
        .status(400)
        .json({ success: false, message: "phone number already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      address,
      phone,
      image,
      kycStatus, // Include kycStatus here
      kycId, // Include kycId here if available
      public_id,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    await user.save();

    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const { image, publicId } = req.body;
    const { id } = req.params;

    if (!id || !image) {
      return res.status(400).json({ error: "User ID and image are required" });
    }

    const user = await User.findById(id);
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    if (image) {
      // Delete the old image using Cloudinary public ID if it exists
      if (user.public_id) {
        console.log("Deleting old image:", user.public_id);
        try {
          const result = await cloudinary.uploader.destroy(user.public_id);
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }
    }
    // Update image URL and public ID in the database
    user.image = image; // Update with the new image URL
    user.public_id = publicId;

    await user.save();

    user.password = undefined; // Omit password from response
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error in updateProfilePicture:", err.message);
    res.status(500).json({ error: err.message });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { userData } = req.body;
    const { name, phone, address } = userData;

    // Validate required fields
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User found:dfsdfdsfdsf", name, phone, address);
    // Update user fields if they are provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // Save the updated user
    await user.save();

    // Remove password from response
    user.password = undefined;

    // Send response
    res.status(200).json({
      user,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Error in updateProfile:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = Date.now();
    await user.save();
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hours

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    res
      .status(200)
      .json({ success: true, message: "Reset password link sent" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    await sendPasswordResetSuccessEmail(user.email);
    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      console.error("User not found in checkAuth");
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: {
        ...user,
        password: undefined, // Explicitly remove sensitive data
      },
    });
  } catch (error) {
    console.error("Error in checkAuth:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
