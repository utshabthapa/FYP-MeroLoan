import { User } from "../models/user.model.js";
import { Loan } from "../models/loan.model.js";
import { Transaction } from "../models/transaction.model.js";

export const getLandingStats = async (req, res) => {
  try {
    // Get basic counts for the landing page
    const totalUsers = await User.countDocuments();
    const totalLoans = await Loan.countDocuments();

    // Calculate total money flow
    const totalMoneyFlowResult = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalMoneyFlow = totalMoneyFlowResult[0]?.totalAmount || 0;
    const totalTransactions = totalMoneyFlowResult[0]?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalLoans,
        totalMoneyFlow,
        totalTransactions,
      },
    });
  } catch (error) {
    console.error("Landing stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch landing page statistics",
    });
  }
};
