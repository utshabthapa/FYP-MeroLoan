// controllers/userDashboardController.js

import { User } from "../models/user.model.js";
import { Loan } from "../models/loan.model.js";
import { ActiveContract } from "../models/activeContract.model.js";
import { Transaction } from "../models/transaction.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Fetch basic loan statistics
    const userLoans = await Loan.find({ userId });
    const lentLoans = await ActiveContract.find({ lender: userId });

    // Calculate monthly growth rates
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const previousMonthLoans = await Loan.find({
      userId,
      createdAt: { $gte: lastMonthStart },
    });

    // Calculate dashboard statistics
    const stats = {
      loanBorrowed: userLoans.reduce((sum, loan) => sum + loan.loanAmount, 0),
      loanLended: lentLoans.reduce((sum, loan) => sum + loan.amount, 0),
      interestEarnings: lentLoans.reduce(
        (sum, loan) => sum + loan.interestEarned,
        0
      ),
      loanDue: userLoans
        .filter((loan) => loan.status === "active")
        .reduce((sum, loan) => sum + loan.remainingAmount, 0),
      activeLoans: userLoans.filter((loan) => loan.status === "active").length,
      monthlyGrowth: {
        borrowed: calculateGrowthRate(previousMonthLoans, userLoans),
        lended: calculateGrowthRate(previousMonthLoans, lentLoans),
        earnings: 15.8, // This should be calculated based on your business logic
      },
      newLoansThisMonth: previousMonthLoans.length,
    };

    // Get loan activity data for charts
    const loanActivity = await getLoanActivityData(userId);

    // Get loan status distribution
    const statusDistribution = await getLoanStatusDistribution(userId);

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats,
        loanActivity,
        statusDistribution,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function to calculate growth rate
const calculateGrowthRate = (previousData, currentData) => {
  if (!previousData.length) return 0;
  const prevTotal = previousData.reduce((sum, loan) => sum + loan.amount, 0);
  const currentTotal = currentData.reduce((sum, loan) => sum + loan.amount, 0);
  return ((currentTotal - prevTotal) / prevTotal) * 100;
};

// Helper function to get loan activity data
const getLoanActivityData = async (userId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return await Loan.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);
};

// Helper function to get loan status distribution
const getLoanStatusDistribution = async (userId) => {
  return await Loan.aggregate([
    {
      $match: { userId },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};
