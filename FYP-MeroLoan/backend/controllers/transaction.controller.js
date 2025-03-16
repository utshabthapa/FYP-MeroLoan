import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";

// Fetch Transactions for a Specific User
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch transactions where the user is either a lender or borrower
    const transactions = await Transaction.find({
      $or: [{ lender: userId }, { borrower: userId }],
    }).populate("loan lender borrower", "loanAmount name email");

    if (!transactions.length) {
      return res
        .status(404)
        .json({ success: false, message: "No transactions found" });
    }

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
