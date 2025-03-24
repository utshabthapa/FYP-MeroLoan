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
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0); // Last day of previous month
    lastMonthEnd.setHours(23, 59, 59, 999);

    const twoMonthsAgoStart = new Date(lastMonthStart);
    twoMonthsAgoStart.setMonth(twoMonthsAgoStart.getMonth() - 1);

    const twoMonthsAgoEnd = new Date(lastMonthEnd);
    twoMonthsAgoEnd.setMonth(twoMonthsAgoEnd.getMonth() - 1);

    // Get loans from last month
    const lastMonthLoans = await Loan.find({
      userId,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    // Get loans from two months ago for comparison
    const twoMonthsAgoLoans = await Loan.find({
      userId,
      createdAt: { $gte: twoMonthsAgoStart, $lte: twoMonthsAgoEnd },
    });

    // Get lent loans from last month
    const lastMonthLentLoans = await ActiveContract.find({
      lender: userId,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    // Get lent loans from two months ago
    const twoMonthsAgoLentLoans = await ActiveContract.find({
      lender: userId,
      createdAt: { $gte: twoMonthsAgoStart, $lte: twoMonthsAgoEnd },
    });

    // Calculate growth rates
    const borrowedGrowthRate = calculateGrowthRate(
      twoMonthsAgoLoans.reduce((sum, loan) => sum + loan.loanAmount, 0),
      lastMonthLoans.reduce((sum, loan) => sum + loan.loanAmount, 0)
    );

    const lentGrowthRate = calculateGrowthRate(
      twoMonthsAgoLentLoans.reduce((sum, loan) => sum + loan.amount, 0),
      lastMonthLentLoans.reduce((sum, loan) => sum + loan.amount, 0)
    );

    // Calculate earnings growth rate
    const lastMonthEarnings = lastMonthLentLoans.reduce(
      (sum, loan) => sum + loan.interestEarned,
      0
    );

    const twoMonthsAgoEarnings = twoMonthsAgoLentLoans.reduce(
      (sum, loan) => sum + loan.interestEarned,
      0
    );

    const earningsGrowthRate = calculateGrowthRate(
      twoMonthsAgoEarnings,
      lastMonthEarnings
    );

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
        borrowed: Number.parseFloat(borrowedGrowthRate.toFixed(1)),
        lended: Number.parseFloat(lentGrowthRate.toFixed(1)),
        earnings: Number.parseFloat(earningsGrowthRate.toFixed(1)),
      },
      newLoansThisMonth: lastMonthLoans.length,
    };

    // Get loan activity data for charts (last 6 months)
    const loanActivity = await getLoanActivityData(userId);

    // Get loan status distribution
    const statusDistribution = await getLoanStatusDistribution(userId);

    // Get monthly comparison data (this year vs last year)
    const monthlyComparison = await getMonthlyComparisonData(userId);

    // Get recent transactions with more details
    const recentTransactions = await getDetailedTransactions(userId);

    res.status(200).json({
      success: true,
      data: {
        stats,
        loanActivity,
        statusDistribution,
        monthlyComparison,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function to calculate growth rate
const calculateGrowthRate = (previousValue, currentValue) => {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};

// Helper function to get loan activity data (last 6 months)
const getLoanActivityData = async (userId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // Get borrowed loans activity
  const borrowedActivity = await Loan.aggregate([
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
        borrowed: { $sum: "$loanAmount" },
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

  // Get lent loans activity
  const lentActivity = await ActiveContract.aggregate([
    {
      $match: {
        lender: userId,
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        lent: { $sum: "$amount" },
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

  // Merge borrowed and lent data
  const mergedActivity = [];
  const monthsMap = new Map();

  // Process borrowed activity
  borrowedActivity.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    monthsMap.set(key, {
      _id: item._id,
      borrowed: item.borrowed,
      lent: 0,
    });
  });

  // Process lent activity
  lentActivity.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    if (monthsMap.has(key)) {
      const existing = monthsMap.get(key);
      existing.lent = item.lent;
    } else {
      monthsMap.set(key, {
        _id: item._id,
        borrowed: 0,
        lent: item.lent,
      });
    }
  });

  // Convert map to array
  monthsMap.forEach((value) => {
    mergedActivity.push(value);
  });

  // Sort by year and month
  mergedActivity.sort((a, b) => {
    if (a._id.year !== b._id.year) {
      return a._id.year - b._id.year;
    }
    return a._id.month - b._id.month;
  });

  return mergedActivity;
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

// Helper function to get monthly comparison data (this year vs last year)
const getMonthlyComparisonData = async (userId) => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  // Get current year data
  const currentYearData = await Loan.aggregate([
    {
      $match: {
        userId,
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalAmount: { $sum: "$loanAmount" },
      },
    },
    {
      $sort: { "_id.month": 1 },
    },
  ]);

  // Get last year data
  const lastYearData = await Loan.aggregate([
    {
      $match: {
        userId,
        createdAt: {
          $gte: new Date(`${lastYear}-01-01`),
          $lte: new Date(`${lastYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalAmount: { $sum: "$loanAmount" },
      },
    },
    {
      $sort: { "_id.month": 1 },
    },
  ]);

  // Create month names array
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Merge the data
  const comparisonData = [];

  for (let i = 0; i < 12; i++) {
    const month = i + 1;
    const monthName = monthNames[i];

    const thisYearEntry = currentYearData.find(
      (item) => item._id.month === month
    );
    const lastYearEntry = lastYearData.find((item) => item._id.month === month);

    comparisonData.push({
      month: monthName,
      thisYear: thisYearEntry ? thisYearEntry.totalAmount : 0,
      lastYear: lastYearEntry ? lastYearEntry.totalAmount : 0,
    });
  }

  return comparisonData;
};

// Helper function to get detailed transactions
const getDetailedTransactions = async (userId) => {
  const transactions = await Transaction.find({
    $or: [{ lender: userId }, { borrower: userId }],
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("lender", "name")
    .populate("borrower", "name");

  // Format transactions for the frontend
  return transactions.map((transaction) => {
    const isLender =
      transaction.lender && transaction.lender._id.toString() === userId;

    return {
      id: transaction._id,
      date: transaction.createdAt,
      amount: transaction.amount,
      status: transaction.status,
      type: isLender ? "lent" : "borrowed",
      description: isLender
        ? `Lent to ${
            transaction.borrower ? transaction.borrower.name : "Unknown"
          }`
        : `Borrowed from ${
            transaction.lender ? transaction.lender.name : "Unknown"
          }`,
      counterparty: isLender
        ? transaction.borrower
          ? transaction.borrower.name
          : "Unknown"
        : transaction.lender
        ? transaction.lender.name
        : "Unknown",
    };
  });
};
