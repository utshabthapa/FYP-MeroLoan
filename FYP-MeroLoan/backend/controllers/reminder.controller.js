// controllers/reminderController.js
import { checkUpcomingRepayments } from "../utils/repaymentReminder.js";
import { User } from "../models/user.model.js";
import { ActiveContract } from "../models/activeContract.model.js";

// Controller function to check reminders for a specific user
export const checkUserReminders = async (req, res) => {
  try {
    const userId = req.params.userId; // Get user ID from URL params
    console.log("checking the user id", userId);

    // Find active contracts where this user is the borrower
    const activeContracts = await ActiveContract.find({
      borrower: userId,
      status: "active",
      "repaymentSchedule.status": "pending",
    });

    if (!activeContracts || activeContracts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No active contracts with pending payments found",
        reminders: 0,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let remindersSent = 0;
    const now = new Date();
    const REMINDER_DAYS = 3; // Same as in the util function

    // Check each contract for upcoming payments
    for (const contract of activeContracts) {
      for (const payment of contract.repaymentSchedule) {
        if (payment.status !== "pending") continue;

        const dueDate = new Date(payment.dueDate);
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= REMINDER_DAYS && diffDays > 0) {
          // This payment needs a reminder - delegate to the utility function
          // Here we can pass the specific userId to only check that user's contracts
          await checkUpcomingRepayments(userId);

          remindersSent = 1; // We just need to call the function once
          break;
        }
      }

      if (remindersSent > 0) break;
    }

    return res.status(200).json({
      success: true,
      message:
        remindersSent > 0
          ? "Reminders have been sent"
          : "No reminders needed at this time",
      reminders: remindersSent,
    });
  } catch (error) {
    console.error("Error in checkUserReminders:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add a route for the admin to trigger reminders for all users
export const triggerAllReminders = async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const remindersSent = await checkUpcomingRepayments();

    return res.status(200).json({
      success: true,
      message: `Successfully triggered reminders for all users`,
      reminders: remindersSent,
    });
  } catch (error) {
    console.error("Error in triggerAllReminders:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
