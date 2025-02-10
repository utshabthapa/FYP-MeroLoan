// import { ActiveContract } from "../models/activeContract.model.js";
// import { Loan } from "../models/loan.model.js";
// import { User } from "../models/user.model.js";

// // Create Active Contract
// export const createActiveContract = async (req, res) => {
//   try {
//     const {
//       loan: loanId,
//       lender,
//       borrower,
//       amount: amountStr, // Receive as string to parse
//       insuranceAdded,
//       transactionId,
//       isMilestonePayment,
//       milestoneNumber,
//     } = req.body;

//     // Parse amount to number and validate
//     const amount = Number(amountStr);
//     if (isNaN(amount)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid amount provided",
//       });
//     }

//     // Validate loan exists
//     const loan = await Loan.findById(loanId);
//     if (!loan) {
//       return res.status(404).json({
//         success: false,
//         message: "Loan not found",
//       });
//     }

//     // Determine repayment type
//     const repaymentType = isMilestonePayment ? "MILESTONE" : "ONE_TIME";

//     // Generate repayment schedule based on contract's repayment type
//     const repaymentSchedule =
//       repaymentType === "MILESTONE"
//         ? generateMilestoneSchedule(loan, amount)
//         : generateOneTimeSchedule(loan, amount);

//     // Calculate total repayment amount safely
//     const totalRepaymentAmount = repaymentSchedule.reduce(
//       (total, payment) => total + Number(payment.amount),
//       0
//     );

//     // Ensure total is a valid number
//     if (isNaN(totalRepaymentAmount)) {
//       throw new Error("Invalid repayment schedule amounts detected");
//     }

//     // Create active contract
//     const newActiveContract = await ActiveContract.create({
//       loan: loanId,
//       lender,
//       borrower,
//       amount, // Now a parsed number
//       insuranceAdded,
//       repaymentType,
//       status: "ACTIVE",
//       transactionId,
//       totalRepaymentAmount: Number(totalRepaymentAmount.toFixed(2)),
//       repaymentSchedule,
//     });

//     // Update loan status
//     loan.status = "active";
//     await loan.save();

//     res.status(201).json({
//       success: true,
//       message: "Active contract created successfully",
//       data: newActiveContract,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Get User's Active Contracts
// export const getUserActiveContracts = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Validate user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Find active contracts where user is either lender or borrower
//     const activeContracts = await ActiveContract.find({
//       $or: [{ lender: userId }, { borrower: userId }],
//     }).populate("loan");

//     res.status(200).json({
//       success: true,
//       data: activeContracts,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Update Active Contract
// export const updateActiveContract = async (req, res) => {
//   try {
//     const { contractId } = req.params;
//     const updateData = req.body;

//     const updatedContract = await ActiveContract.findByIdAndUpdate(
//       contractId,
//       updateData,
//       { new: true }
//     );

//     if (!updatedContract) {
//       return res.status(404).json({
//         success: false,
//         message: "Active contract not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: updatedContract,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Helper function to generate milestone repayment schedule
// const generateMilestoneSchedule = (loan, totalAmount) => {
//   const milestones = parseInt(loan.milestones);
//   const amountPerMilestone = totalAmount / milestones;
//   const startDate = new Date(loan.appliedAt);
//   const durationDays = parseInt(loan.duration);
//   const daysPerMilestone = durationDays / milestones;

//   return Array.from({ length: milestones }, (_, index) => ({
//     dueDate: new Date(
//       startDate.getTime() + daysPerMilestone * (index + 1) * 24 * 60 * 60 * 1000
//     ),
//     amountDue: amountPerMilestone,
//     status: "PENDING",
//   }));
// };

// // Helper function to generate one-time repayment schedule
// // const generateOneTimeSchedule = (loan, totalAmount) => {
// //   const endDate = new Date(
// //     new Date(loan.appliedAt).getTime() +
// //       parseInt(loan.duration) * 24 * 60 * 60 * 1000
// //   );

// //   return [
// //     {
// //       dueDate: endDate,
// //       amountDue: totalAmount,
// //       status: "PENDING",
// //     },
// //   ];
// // };
// // Example generator function
// const generateOneTimeSchedule = (loan, amount) => {
//   const interestRate = Number(loan.interestRate); // Ensure numeric
//   const interest = amount * (interestRate / 100);
//   return [
//     {
//       dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
//       amount: amount + interest,
//     },
//   ];
// };

import { ActiveContract } from "../models/activeContract.model.js";
import { Loan } from "../models/loan.model.js";
import { User } from "../models/user.model.js";

// Create Active Contract
export const createActiveContract = async (req, res) => {
  try {
    const {
      loan: loanId,
      lender,
      borrower,
      amount: amountStr, // Receive as string to parse
      insuranceAdded,
      transactionId,
      isMilestonePayment,
    } = req.body;

    // Parse amount to number and validate
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount provided. Amount must be a positive number.",
      });
    }

    // Validate loan exists
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    // Determine repayment type
    const repaymentType = isMilestonePayment ? "milestone" : "one_time";

    // Generate repayment schedule based on contract's repayment type
    const repaymentSchedule =
      repaymentType === "milestone"
        ? generateMilestoneSchedule(loan, amount)
        : generateOneTimeSchedule(loan, amount);

    // Calculate total repayment amount safely
    const totalRepaymentAmount = repaymentSchedule.reduce(
      (total, payment) => total + Number(payment.amountDue),
      0
    );

    // Ensure total is a valid number
    if (isNaN(totalRepaymentAmount)) {
      throw new Error("Invalid repayment schedule amounts detected");
    }

    // Create active contract
    const newActiveContract = await ActiveContract.create({
      loan: loanId,
      lender,
      borrower,
      amount, // Now a parsed number
      insuranceAdded,
      repaymentType,
      status: "active",
      transactionId,
      totalRepaymentAmount: Number(totalRepaymentAmount.toFixed(2)),
      repaymentSchedule,
    });

    // Update loan status
    loan.status = "active";
    await loan.save();

    res.status(201).json({
      success: true,
      message: "Active contract created successfully",
      data: newActiveContract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get User's Active Contracts
export const getUserActiveContracts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find active contracts where user is either lender or borrower
    const activeContracts = await ActiveContract.find({
      $or: [{ lender: userId }, { borrower: userId }],
    }).populate("loan");

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

// Update Active Contract
export const updateActiveContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const updateData = req.body;

    const updatedContract = await ActiveContract.findByIdAndUpdate(
      contractId,
      updateData,
      { new: true }
    );

    if (!updatedContract) {
      return res.status(404).json({
        success: false,
        message: "Active contract not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedContract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to generate milestone repayment schedule
const generateMilestoneSchedule = (loan, totalAmount) => {
  const milestones = parseInt(loan.milestones);
  const amountPerMilestone = totalAmount / milestones;
  const startDate = new Date(loan.appliedAt);
  const durationDays = parseInt(loan.duration);
  const daysPerMilestone = durationDays / milestones;

  return Array.from({ length: milestones }, (_, index) => ({
    dueDate: new Date(
      startDate.getTime() + daysPerMilestone * (index + 1) * 24 * 60 * 60 * 1000
    ),
    amountDue: Number(amountPerMilestone.toFixed(2)), // Ensure amount is a number
    status: "pending",
  }));
};

// Helper function to generate one-time repayment schedule
const generateOneTimeSchedule = (loan, totalAmount) => {
  const endDate = new Date(
    new Date(loan.appliedAt).getTime() +
      parseInt(loan.duration) * 24 * 60 * 60 * 1000
  );

  return [
    {
      dueDate: endDate,
      amountDue: Number(totalAmount.toFixed(2)), // Ensure amount is a number
      status: "pending",
    },
  ];
};
