import { User } from "../models/user.model.js";
import { Loan } from "../models/loan.model.js";
import { KYC } from "../models/kyc.model.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: "active" });
    const totalVerifiedKycs = await KYC.countDocuments({ status: "approved" });
    const bannedUsers = await User.countDocuments({ banStatus: "banned" });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalLoans,
        activeLoans,
        totalVerifiedKycs,
        bannedUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 }) // Exclude passwords
      .sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.banStatus === "banned") {
      return res
        .status(400)
        .json({ success: false, message: "User is already banned" });
    }

    user.banStatus = "banned";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User banned successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        banStatus: user.banStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.banStatus === "notBanned") {
      return res
        .status(400)
        .json({ success: false, message: "User is not banned" });
    }

    user.banStatus = "notBanned";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User unbanned successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        banStatus: user.banStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
