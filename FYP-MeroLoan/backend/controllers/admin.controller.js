// controllers/adminController.js

import { User } from "../models/user.model.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    // const totalLoans = await Loan.countDocuments();
    // const totalInsuranceSubscriptions = await InsuranceSubscription.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        // totalLoans,
        // totalInsuranceSubscriptions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Get all loans (for admin)
// export const getLoans = async (req, res, next) => {
//     try {
//       const loans = await Loan.find().populate("userId", "name email"); // Populate user details
//       res.status(200).json({
//         success: true,
//         data: loans,
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

// export const getInsuranceSubscriptions = async (req, res, next) => {
//     try {
//       const subscriptions = await InsuranceSubscription.find().populate(
//         "userId",
//         "name email"
//       ); // Populate user details
//       res.status(200).json({
//         success: true,
//         data: subscriptions,
//       });
//     } catch (error) {
//       next(error);
//     }
//   };
