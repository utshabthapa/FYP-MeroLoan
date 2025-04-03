import { ActiveContract } from "../models/activeContract.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { io } from "../index.js";
import { sendRepaymentReminderEmail } from "../mailtrap/emails.js";

const REMINDER_DAYS = 3;

export const checkUpcomingRepayments = async (specificUserId = null) => {
  try {
    const now = new Date();
    let remindersSent = 0;

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
          const borrower = contract.borrower;
          if (!borrower) continue;

          // Check if notification already exists and was sent
          const existingNotification = await Notification.findOne({
            userId: borrower._id,
            message: {
              $regex: `Payment of Rs.${payment.amountDue.toFixed(
                2
              )}.*due in ${diffDays} day(s)`,
            },
            reminderStatus: "sent",
          });

          if (existingNotification) continue;

          const notificationMessage = `Reminder: Payment of Rs.${payment.amountDue.toFixed(
            2
          )} for your loan is due in ${diffDays} day(s) on ${dueDate.toLocaleDateString()}.`;

          const notification = new Notification({
            userId: borrower._id,
            message: notificationMessage,
            reminderStatus: "sent",
          });

          await notification.save();

          if (io) {
            io.to(borrower._id.toString()).emit("newNotification", {
              message: notification.message,
              timestamp: notification.timestamp,
              read: notification.read,
              id: notification._id,
            });
          }

          try {
            await sendRepaymentReminderEmail(
              borrower.email,
              borrower.firstName,
              contract.loanAmount,
              payment.amountDue,
              dueDate,
              diffDays
            );
            remindersSent++;
            console.log(`Sent reminder to ${borrower.email}`);
          } catch (emailError) {
            console.error(`Email failed for ${borrower.email}:`, emailError);
          }
        }
      }
    }

    console.log(`Sent ${remindersSent} new repayment reminders`);
    return remindersSent;
  } catch (error) {
    console.error("Error in checkUpcomingRepayments:", error);
    throw error;
  }
};

// Rest of your scheduler code remains the same
export const startRepaymentReminderScheduler = () => {
  // Check once when server starts
  checkUpcomingRepayments().catch(console.error);

  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const now = new Date();
  const next9AM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    9,
    0,
    0
  );

  if (now > next9AM) {
    next9AM.setDate(next9AM.getDate() + 1);
  }

  const initialDelay = next9AM - now;

  setTimeout(() => {
    checkUpcomingRepayments().catch(console.error);
    setInterval(
      () => checkUpcomingRepayments().catch(console.error),
      TWENTY_FOUR_HOURS
    );
  }, initialDelay);

  console.log(`Scheduler started. Next check at ${next9AM}`);
};
