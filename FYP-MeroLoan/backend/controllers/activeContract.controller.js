import { ActiveContract } from "../models/activeContract.model.js";
import { Loan } from "../models/loan.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js"; // Import Notification model
import { io } from "../index.js"; // Import socket.io instance

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

    const user = await User.findById(borrower);
    const lenderUser = await User.findById(lender);

    // Get loan details
    const principal = amount;
    const durationDays = Number.parseInt(loan.duration);

    // Get base interest rate from loan
    const baseInterestRate = Number.parseFloat(loan.interestRate);

    // Apply insurance discount if insurance is added (15% discount on interest rate)
    const effectiveInterestRate = insuranceAdded
      ? baseInterestRate - baseInterestRate * 0.15
      : baseInterestRate;

    // Calculate interest amount based on annual rate
    const interestAmount =
      (principal * effectiveInterestRate * durationDays) / (100 * 365);

    // Calculate total repayment amount with interest
    const totalWithInterest = principal + interestAmount;

    // Determine repayment type
    const repaymentType = isMilestonePayment ? "milestone" : "one_time";

    // Generate repayment schedule based on contract's repayment type
    const repaymentSchedule =
      repaymentType === "milestone"
        ? generateMilestoneSchedule(loan, totalWithInterest)
        : generateOneTimeSchedule(loan, totalWithInterest);

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
      amount, // Principal amount
      insuranceAdded,
      repaymentType,
      status: "active",
      transactionId,
      interestRate: effectiveInterestRate, // Store the effective interest rate
      durationDays, // Store the duration in days
      interestAmount: Number(interestAmount.toFixed(2)), // Store the calculated interest
      totalRepaymentAmount: Number(totalRepaymentAmount.toFixed(2)),
      repaymentSchedule,
    });

    // Update the loan with the new active contract ID
    loan.activeContract = newActiveContract._id;
    loan.status = "active";

    // Update the user's activeContractIds
    user.activeContractIds.push(newActiveContract._id);

    // Save the updated loan and user records
    await loan.save();
    await user.save();

    // Create notification for borrower
    const borrowerNotification = new Notification({
      userId: borrower,
      message: `A new loan contract has been created with ${
        lenderUser.name
      }. You've received Rs.${amount.toLocaleString()} with ${effectiveInterestRate.toFixed(
        2
      )}% interest rate.`,
      timestamp: new Date(),
    });
    await borrowerNotification.save();

    // Create notification for lender
    const lenderNotification = new Notification({
      userId: lender,
      message: `A new loan contract has been created with ${
        user.name
      }. You've lent Rs.${amount.toLocaleString()} with ${effectiveInterestRate.toFixed(
        2
      )}% interest rate.`,
      timestamp: new Date(),
    });
    await lenderNotification.save();

    // Send real-time notifications via socket.io
    io.to(borrower.toString()).emit("newNotification", {
      message: borrowerNotification.message,
      timestamp: borrowerNotification.timestamp,
    });

    io.to(lender.toString()).emit("newNotification", {
      message: lenderNotification.message,
      timestamp: lenderNotification.timestamp,
    });

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

    // Check if the contract status is being updated to "completed"
    if (updateData.status === "completed") {
      // Fetch borrower and lender details
      const borrower = await User.findById(updatedContract.borrower);
      const lender = await User.findById(updatedContract.lender);

      // Create notification for borrower
      const borrowerNotification = new Notification({
        userId: updatedContract.borrower,
        message: `Your loan contract with ${lender.name} has been completed. Thank you for repaying on time.`,
        timestamp: new Date(),
      });
      await borrowerNotification.save();

      // Create notification for lender
      const lenderNotification = new Notification({
        userId: updatedContract.lender,
        message: `Your loan contract with ${borrower.name} has been completed. The loan has been fully repaid.`,
        timestamp: new Date(),
      });
      await lenderNotification.save();

      // Send real-time notifications via socket.io
      io.to(updatedContract.borrower.toString()).emit("newNotification", {
        message: borrowerNotification.message,
        timestamp: borrowerNotification.timestamp,
      });

      io.to(updatedContract.lender.toString()).emit("newNotification", {
        message: lenderNotification.message,
        timestamp: lenderNotification.timestamp,
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
  const milestones = Number.parseInt(loan.milestones);
  const amountPerMilestone = totalAmount / milestones;
  const startDate = new Date(loan.appliedAt);
  const durationDays = Number.parseInt(loan.duration);
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
      Number.parseInt(loan.duration) * 24 * 60 * 60 * 1000
  );

  return [
    {
      dueDate: endDate,
      amountDue: Number(totalAmount.toFixed(2)), // Ensure amount is a number
      status: "pending",
    },
  ];
};

// New function to handle contract completion
export const completeActiveContract = async (req, res) => {
  try {
    const { contractId } = req.params;

    const activeContract = await ActiveContract.findById(contractId);
    if (!activeContract) {
      return res.status(404).json({
        success: false,
        message: "Active contract not found",
      });
    }

    // Update contract status
    activeContract.status = "completed";
    await activeContract.save();

    // Update associated loan status
    const loan = await Loan.findById(activeContract.loan);
    if (loan) {
      loan.status = "completed";
      await loan.save();
    }

    // Fetch borrower and lender details
    const borrower = await User.findById(activeContract.borrower);
    const lender = await User.findById(activeContract.lender);

    // Create notification for borrower
    const borrowerNotification = new Notification({
      userId: activeContract.borrower,
      message: `Your loan contract with ${lender.name} has been completed. Thank you for repaying on time.`,
      timestamp: new Date(),
    });
    await borrowerNotification.save();

    // Create notification for lender
    const lenderNotification = new Notification({
      userId: activeContract.lender,
      message: `Your loan contract with ${borrower.name} has been completed. The loan has been fully repaid.`,
      timestamp: new Date(),
    });
    await lenderNotification.save();

    // Send real-time notifications via socket.io
    io.to(activeContract.borrower.toString()).emit("newNotification", {
      message: borrowerNotification.message,
      timestamp: borrowerNotification.timestamp,
    });

    io.to(activeContract.lender.toString()).emit("newNotification", {
      message: lenderNotification.message,
      timestamp: lenderNotification.timestamp,
    });

    res.status(200).json({
      success: true,
      message: "Contract completed successfully",
      data: activeContract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
