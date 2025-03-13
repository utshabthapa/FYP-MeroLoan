import { User } from "../models/user.model.js";
import { Loan } from "../models/loan.model.js";
import { ActiveContract } from "../models/activeContract.model.js"; // Import the ActiveContract model

// Submit Loan Request
export const submitLoanRequest = async (req, res) => {
  try {
    const {
      userId,
      loanAmount,
      interestRate,
      duration,
      repaymentType,
      milestones,
    } = req.body;

    // Validate repaymentType and milestones
    if (repaymentType === "milestone" && !milestones) {
      return res.status(400).json({
        success: false,
        message: "Milestones must be specified for milestone repayment type",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create the loan request
    const newLoan = await Loan.create({
      userId,
      loanAmount,
      interestRate,
      duration,
      repaymentType,
      milestones: repaymentType === "milestone" ? milestones : null,
    });

    // Add the loan ID to the user's loanIds array
    user.loanIds = user.loanIds || [];
    user.loanIds.push(newLoan._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Loan request submitted successfully",
      data: newLoan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch All Loan Requests
export const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate("userId", "name email").populate({
      path: "activeContract",
      select:
        "amount repaymentType status repaymentSchedule totalRepaymentAmount transactionId", // Include all fields you need
    }); // Populate activeContract;

    if (!loans.length) {
      return res.status(404).json({
        success: false,
        message: "No loan requests found",
      });
    }

    res.status(200).json({
      success: true,
      data: loans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Loan By ID
// Get Loan By ID
export const getLoanById = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId)
      .populate("userId", "name email") // Populate userId with name and email
      .populate("activeContract", "amount repaymentType"); // Populate activeContract

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// export const getLoanById = async (req, res) => {
//   try {
//     const { loanId } = req.params;

//     const loan = await Loan.findById(loanId).populate("userId", "name email");

//     if (!loan) {
//       return res.status(404).json({
//         success: false,
//         message: "Loan not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: loan,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Update Loan Status
// Update Loan Status
export const updateLoanStatus = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { status } = req.body;

    if (!["active", "not active", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    // If the status is being updated to "active", create an ActiveContract
    if (status === "active" && !loan.activeContract) {
      const activeContract = await ActiveContract.create({
        loan: loanId,
        lender: loan.userId, // Assuming the lender is the same as the user who created the loan
        borrower: loan.userId, // Update this if you have a separate borrower field
        amount: loan.loanAmount,
        repaymentType: loan.repaymentType,
        status: "active",
        repaymentSchedule: [], // Add repayment schedule logic here
        totalRepaymentAmount:
          loan.loanAmount + (loan.loanAmount * loan.interestRate) / 100,
      });

      // Associate the ActiveContract with the Loan
      loan.activeContract = activeContract._id;
    }

    // Update the loan status
    loan.status = status;
    await loan.save();

    res.status(200).json({
      success: true,
      message: "Loan status updated successfully",
      data: loan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Loan Request
// Delete Loan Request
export const deleteLoanRequest = async (req, res) => {
  try {
    const { loanId } = req.params;

    // Check if the loan exists
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });
    }

    // Delete the associated ActiveContract (if it exists)
    if (loan.activeContract) {
      await ActiveContract.findByIdAndDelete(loan.activeContract);
    }

    // Delete the loan
    await loan.deleteOne();

    res.status(200).json({
      success: true,
      message: "Loan request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// export const updateLoanStatus = async (req, res) => {
//   try {
//     const { loanId } = req.params;
//     const { status } = req.body;

//     if (!["active", "not active", "completed"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value",
//       });
//     }

//     const loan = await Loan.findByIdAndUpdate(
//       loanId,
//       { status },
//       { new: true }
//     );

//     if (!loan) {
//       return res.status(404).json({
//         success: false,
//         message: "Loan not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Loan status updated successfully",
//       data: loan,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Delete Loan Request
// export const deleteLoanRequest = async (req, res) => {
//   try {
//     const { loanId } = req.params;

//     // Check if the loan exists
//     const loan = await Loan.findById(loanId);
//     if (!loan) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Loan not found" });
//     }

//     // Delete the loan
//     await loan.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: "Loan request deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
