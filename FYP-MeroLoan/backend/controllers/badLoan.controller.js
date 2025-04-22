import { BadLoan } from "../models/badLoan.model.js";
import { User } from "../models/user.model.js";
import { ActiveContract } from "../models/activeContract.model.js";

/**
 * @desc    Get all bad loans (50+ days overdue)
 * @route   GET /api/admin/bad-loans
 * @access  Private/Admin
 */
export const getBadLoans = async (req, res) => {
  try {
    // Get optional query parameters for filtering
    const {
      sortBy = "daysOverdue",
      sortOrder = "desc",
      search = "",
    } = req.query;

    // Build the base query
    let query = {};

    // If search term is provided, search across borrower names, email, or loan ID
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const loans = await ActiveContract.find({
        _id: { $regex: search, $options: "i" },
      }).select("_id");

      query.$or = [
        { borrower: { $in: users.map((u) => u._id) } },
        { loan: { $in: loans.map((l) => l._id) } },
      ];
    }

    // Determine sort order
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get bad loans with populated data
    const badLoans = await BadLoan.find(query)
      .populate({
        path: "borrower",
        select: "firstName lastName email creditScore",
      })
      .populate({
        path: "lender",
        select: "firstName lastName email",
      })
      .populate({
        path: "loan",
        select: "loanAmount interestRate startDate endDate",
      })
      .sort(sortOptions);

    // Format the response data
    const formattedLoans = badLoans.map((loan) => ({
      id: loan._id,
      borrower: {
        id: loan.borrower?._id,
        name: `${loan.borrower?.firstName || ""} ${
          loan.borrower?.lastName || ""
        }`.trim(),
        email: loan.borrower?.email,
        creditScore: loan.borrower?.creditScore,
      },
      lender: loan.lender
        ? {
            id: loan.lender._id,
            name: `${loan.lender.firstName || ""} ${
              loan.lender.lastName || ""
            }`.trim(),
            email: loan.lender.email,
          }
        : null,
      loanDetails: {
        id: loan.loan?._id,
        amount: loan.loan?.loanAmount,
        interestRate: loan.loan?.interestRate,
        startDate: loan.loan?.startDate,
        endDate: loan.loan?.endDate,
      },
      amountDue: loan.amountDue,
      daysOverdue: loan.daysOverdue,
      lastPaymentDate: loan.lastPaymentDate,
      createdAt: loan.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedLoans.length,
      data: formattedLoans,
    });
  } catch (error) {
    console.error("Error fetching bad loans:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bad loans",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
