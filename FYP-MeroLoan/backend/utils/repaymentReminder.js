// Create a new file called repaymentReminders.js in your utils folder
import { ActiveContract } from "../models/activeContract.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { io } from "../index.js";
import { sendRepaymentReminderEmail } from "../mailtrap/emails.js"; // Adjust the import path as necessary

// Number of days before due date to send reminder
const REMINDER_DAYS = 3;

// export const checkUpcomingRepayments = async () => {
//   try {
//     // Get current date
//     const now = new Date();

//     // Calculate the date range for identifying upcoming payments
//     // (current date + REMINDER_DAYS)
//     const reminderDate = new Date(now);
//     reminderDate.setDate(reminderDate.getDate() + REMINDER_DAYS);

//     // Find active contracts with pending repayments that are due within the next REMINDER_DAYS days
//     const activeContracts = await ActiveContract.find({
//       status: "active",
//       "repaymentSchedule.status": "pending",
//     });

//     let remindersSent = 0;

//     // Process each contract
//     for (const contract of activeContracts) {
//       // Get the borrower details
//       const borrower = await User.findById(contract.borrower);
//       if (!borrower) continue;

//       // Check if any repayments are due soon
//       for (const payment of contract.repaymentSchedule) {
//         if (payment.status !== "pending") continue;

//         const dueDate = new Date(payment.dueDate);

//         // Check if the payment is due within the reminder period
//         const diffTime = dueDate - now;
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//         // If payment is due in REMINDER_DAYS days and hasn't been reminded yet
//         if (diffDays <= REMINDER_DAYS && diffDays > 0) {
//           // Check if we've already sent a notification for this payment recently
//           // You could store this info in a separate collection if needed

//           // Create in-app notification
//           const notificationMessage = `You have a payment of Rs.${payment.amountDue.toLocaleString()} due on ${dueDate.toLocaleDateString()}. Please ensure timely repayment.`;

//           const notification = new Notification({
//             userId: borrower._id,
//             message: notificationMessage,
//             timestamp: new Date(),
//             type: "payment_reminder",
//             relatedId: contract._id,
//           });

//           await notification.save();

//           // Send real-time notification
//           io.to(borrower._id.toString()).emit("newNotification", {
//             message: notificationMessage,
//             timestamp: notification.timestamp,
//             type: "payment_reminder",
//           });

//           // Send email notification
//           await sendRepaymentReminderEmail(
//             borrower.email,
//             borrower.name,
//             dueDate,
//             payment.amountDue
//           );

//           remindersSent++;

//           console.log(
//             `Reminder sent to ${
//               borrower.name
//             } for payment due on ${dueDate.toLocaleDateString()}`
//           );
//         }
//       }
//     }

//     console.log(
//       `Completed repayment reminder check. Sent ${remindersSent} reminders.`
//     );
//     return remindersSent;
//   } catch (error) {
//     console.error("Error checking upcoming repayments:", error);
//     return 0;
//   }
// };

// Add the scheduler function to run daily

export const checkUpcomingRepayments = async (specificUserId = null) => {
  try {
    const now = new Date();
    const REMINDER_DAYS = 3; // Reminders for payments due in 3 days or less
    let remindersSent = 0;

    // Build the query - if specificUserId is provided, only check that user's contracts
    const query = {
      status: "active",
      "repaymentSchedule.status": "pending",
    };

    if (specificUserId) {
      query.borrower = specificUserId;
    }

    const activeContracts = await ActiveContract.find(query)
      .populate("borrower", "email firstName lastName")
      .populate("lender", "email firstName lastName");

    for (const contract of activeContracts) {
      for (const payment of contract.repaymentSchedule) {
        if (payment.status !== "pending") continue;

        const dueDate = new Date(payment.dueDate);
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= REMINDER_DAYS && diffDays > 0) {
          // This payment is coming up soon - send a reminder
          const user = await User.findById(contract.borrower._id);

          if (user) {
            await sendRepaymentReminderEmail(
              user.email,
              user.firstName,
              contract.loanAmount,
              payment.amount,
              dueDate,
              diffDays
            );
            remindersSent++;
          }
        }
      }
    }

    return remindersSent;
  } catch (error) {
    console.error("Error checking upcoming repayments:", error);
    throw error;
  }
};

export const startRepaymentReminderScheduler = () => {
  // Check once when server starts
  checkUpcomingRepayments();

  // Then schedule to run daily
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(checkUpcomingRepayments, TWENTY_FOUR_HOURS);

  console.log("Repayment reminder scheduler started");
};
