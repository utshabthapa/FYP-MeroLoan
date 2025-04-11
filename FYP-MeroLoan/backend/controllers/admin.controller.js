import { User } from "../models/user.model.js";
import { Loan } from "../models/loan.model.js";
import { KYC } from "../models/kyc.model.js";
import { Transaction } from "../models/transaction.model.js";
import { ActiveContract } from "../models/activeContract.model.js";
import { Fine } from "../models/fine.model.js";

export const getAdminStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: "active" });
    const totalVerifiedKycs = await KYC.countDocuments({ status: "approved" });
    const bannedUsers = await User.countDocuments({ banStatus: "banned" });

    // Transaction statistics - Total money flow
    const transactionStats = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate total money flow
    const totalMoneyFlow = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // User growth stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Loan status distribution
    const loanStatusDistribution = await Loan.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Transaction volume by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactionVolume = await Transaction.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Transaction types distribution
    const transactionTypeDistribution = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Monthly transaction trends (last 6 months)
    const monthlyCashFlow = await Transaction.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            type: "$type",
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Calculate month-over-month growth rates
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousMonthYear =
      currentMonth === 1 ? currentYear - 1 : currentYear;

    // Calculate current month's total transactions
    const currentMonthTransactions = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $month: "$createdAt" }, currentMonth] },
              { $eq: [{ $year: "$createdAt" }, currentYear] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate previous month's total transactions
    const previousMonthTransactions = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $month: "$createdAt" }, previousMonth] },
              { $eq: [{ $year: "$createdAt" }, previousMonthYear] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate growth rates
    const currentMonthTotal = currentMonthTransactions[0]?.total || 0;
    const previousMonthTotal = previousMonthTransactions[0]?.total || 1; // Avoid division by zero
    const transactionGrowthRate =
      ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;

    // Current month's new users
    const currentMonthUsers = await User.countDocuments({
      $expr: {
        $and: [
          { $eq: [{ $month: "$createdAt" }, currentMonth] },
          { $eq: [{ $year: "$createdAt" }, currentYear] },
        ],
      },
    });

    // Previous month's new users
    const previousMonthUsers = await User.countDocuments({
      $expr: {
        $and: [
          { $eq: [{ $month: "$createdAt" }, previousMonth] },
          { $eq: [{ $year: "$createdAt" }, previousMonthYear] },
        ],
      },
    });

    // Calculate user growth rate
    const userGrowthRate = previousMonthUsers
      ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100
      : 100;

    res.status(200).json({
      success: true,
      data: {
        // Basic stats
        totalUsers,
        totalLoans,
        activeLoans,
        totalVerifiedKycs,
        bannedUsers,

        // Growth and distribution stats
        userGrowth,
        loanStatusDistribution,
        transactionVolume,

        // Financial stats
        totalMoneyFlow: totalMoneyFlow[0] || { totalAmount: 0, count: 0 },
        transactionStats,
        transactionTypeDistribution,
        monthlyCashFlow,

        // Growth rates
        userGrowthRate: userGrowthRate.toFixed(2),
        transactionGrowthRate: transactionGrowthRate.toFixed(2),

        // Current month stats
        currentMonthTransactions: currentMonthTransactions[0] || {
          total: 0,
          count: 0,
        },
        currentMonthUsers,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
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

export const getAllFines = async (req, res, next) => {
  try {
    // Find all loans with fines (status can be pending or paid)
    const fines = await Fine.find(
      {
        fineAmount: { $gt: 0 }, // Only get loans with fines
      },
      {
        _id: 1,
        loanId: 1,
        borrowerId: 1,
        originalAmount: 1,
        finePercent: 1,
        fineAmount: 1,
        daysLate: 1,
        status: 1,
        createdAt: 1,
        paidAt: 1,
        transactionId: 1,
      }
    ).sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      data: fines,
    });
  } catch (error) {
    console.error("Get all fines error:", error);
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
