import { ActiveContract } from "../models/activeContract.model.js";
import { Transaction } from "../models/transaction.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Fetch all contracts where user is either lender or borrower
    const contractsAsBorrower = await ActiveContract.find({ borrower: userId });
    const contractsAsLender = await ActiveContract.find({ lender: userId });

    // Calculate monthly growth rates (same as before)
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);
    lastMonthEnd.setHours(23, 59, 59, 999);

    const twoMonthsAgoStart = new Date(lastMonthStart);
    twoMonthsAgoStart.setMonth(twoMonthsAgoStart.getMonth() - 1);

    const twoMonthsAgoEnd = new Date(lastMonthEnd);
    twoMonthsAgoEnd.setMonth(twoMonthsAgoEnd.getMonth() - 1);

    // Get contracts for growth rate calculations (same as before)
    const lastMonthBorrowedContracts = await ActiveContract.find({
      borrower: userId,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    const twoMonthsAgoBorrowedContracts = await ActiveContract.find({
      borrower: userId,
      createdAt: { $gte: twoMonthsAgoStart, $lte: twoMonthsAgoEnd },
    });

    const lastMonthLentContracts = await ActiveContract.find({
      lender: userId,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    const twoMonthsAgoLentContracts = await ActiveContract.find({
      lender: userId,
      createdAt: { $gte: twoMonthsAgoStart, $lte: twoMonthsAgoEnd },
    });

    // Calculate growth rates (same as before)
    const borrowedGrowthRate = calculateGrowthRate(
      twoMonthsAgoBorrowedContracts.reduce(
        (sum, contract) => sum + contract.amount,
        0
      ),
      lastMonthBorrowedContracts.reduce(
        (sum, contract) => sum + contract.amount,
        0
      )
    );

    const lentGrowthRate = calculateGrowthRate(
      twoMonthsAgoLentContracts.reduce(
        (sum, contract) => sum + contract.amount,
        0
      ),
      lastMonthLentContracts.reduce((sum, contract) => sum + contract.amount, 0)
    );

    // Calculate interest earnings (only from completed contracts)
    const interestEarnings = contractsAsLender
      .filter((contract) => contract.status === "completed")
      .reduce(
        (sum, contract) =>
          sum + (contract.totalRepaymentAmount - contract.amount),
        0
      );

    // Calculate last month's interest earnings
    const lastMonthInterestEarnings = lastMonthLentContracts
      .filter((contract) => contract.status === "completed")
      .reduce(
        (sum, contract) =>
          sum + (contract.totalRepaymentAmount - contract.amount),
        0
      );

    // Calculate two months ago interest earnings
    const twoMonthsAgoInterestEarnings = twoMonthsAgoLentContracts
      .filter((contract) => contract.status === "completed")
      .reduce(
        (sum, contract) =>
          sum + (contract.totalRepaymentAmount - contract.amount),
        0
      );

    const earningsGrowthRate = calculateGrowthRate(
      twoMonthsAgoInterestEarnings,
      lastMonthInterestEarnings
    );

    // Calculate loan due (pending repayments where user is borrower)
    const loanDue = contractsAsBorrower.reduce((sum, contract) => {
      const pendingRepayments = contract.repaymentSchedule.filter(
        (repayment) => repayment.status === "pending"
      );
      return (
        sum +
        pendingRepayments.reduce((repSum, rep) => repSum + rep.amountDue, 0)
      );
    }, 0);

    // Calculate active loans (contracts where user is borrower and status is not completed)
    const activeLoans = contractsAsBorrower.filter(
      (contract) => contract.status !== "completed"
    ).length;

    // Calculate dashboard statistics
    const stats = {
      loanBorrowed: contractsAsBorrower.reduce(
        (sum, contract) => sum + contract.amount,
        0
      ),
      loanLended: contractsAsLender.reduce(
        (sum, contract) => sum + contract.amount,
        0
      ),
      interestEarnings,
      loanDue,
      activeLoans,
      monthlyGrowth: {
        borrowed: Number.parseFloat(borrowedGrowthRate.toFixed(1)),
        lended: Number.parseFloat(lentGrowthRate.toFixed(1)),
        earnings: Number.parseFloat(earningsGrowthRate.toFixed(1)),
      },
      newLoansThisMonth: lastMonthBorrowedContracts.length,
    };

    // Simplified loan activity data (total borrowed and lended)
    const loanActivity = [
      {
        borrowed: stats.loanBorrowed,
        lent: stats.loanLended,
      },
    ];

    // Get loan status distribution (active vs non-active)
    const statusDistribution = [
      {
        _id: "active",
        count: contractsAsBorrower.filter(
          (contract) => contract.status !== "completed"
        ).length,
      },
      {
        _id: "completed",
        count: contractsAsBorrower.filter(
          (contract) => contract.status === "completed"
        ).length,
      },
    ];

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

// Helper function to get monthly comparison data (this year vs last year)
const getMonthlyComparisonData = async (userId) => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  // Get current year data (as borrower)
  const currentYearData = await ActiveContract.aggregate([
    {
      $match: {
        borrower: userId,
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { "_id.month": 1 },
    },
  ]);

  // Get last year data (as borrower)
  const lastYearData = await ActiveContract.aggregate([
    {
      $match: {
        borrower: userId,
        createdAt: {
          $gte: new Date(`${lastYear}-01-01`),
          $lte: new Date(`${lastYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalAmount: { $sum: "$amount" },
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
