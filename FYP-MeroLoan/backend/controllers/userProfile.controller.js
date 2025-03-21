import { User } from "../models/user.model.js";
import { ActiveContract } from "../models/activeContract.model.js";

// Get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find user by ID and exclude sensitive info
    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active contracts for a specific user
export const getUserActiveContracts = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all active contracts where the user is either a lender or a borrower
    const activeContracts = await ActiveContract.find({
      $or: [{ lender: userId }, { borrower: userId }],
    })
      .populate("lender", "name image")
      .populate("borrower", "name image");

    res.status(200).json({
      success: true,
      data: activeContracts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
