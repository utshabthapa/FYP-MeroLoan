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
    let overdueRemindersSent = 0;

    // Only use "pending" since "overdue" may not be a valid enum value
    const query = {
      status: "active",
      "repaymentSchedule.status": "pending",
    };

    if (specificUserId) {
      query.borrower = specificUserId;
    }

    const activeContracts = await ActiveContract.find(query)
      .populate("borrower", "email firstName lastName creditScore")
      .populate("lender", "email firstName lastName");

    for (const contract of activeContracts) {
      for (const payment of contract.repaymentSchedule) {
        if (payment.status === "completed") continue;

        const dueDate = new Date(payment.dueDate);
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Updated upcoming payment reminder section
        if (diffDays <= REMINDER_DAYS && diffDays > 0) {
          const borrower = contract.borrower;
          if (!borrower) continue;

          // More specific check for existing notifications
          const existingNotification = await Notification.findOne({
            userId: borrower._id,
            loanId: contract._id,
            paymentId: payment._id,
            "metadata.reminderType": "upcoming",
            "metadata.daysRemaining": diffDays,
          });

          if (existingNotification) {
            console.log(
              `Reminder already sent for payment ${payment._id} to user ${borrower._id}`
            );
            continue;
          }

          const notificationMessage = `Reminder: Payment of Rs.${payment.amountDue.toFixed(
            2
          )} for your loan is due in ${diffDays} day(s) on ${dueDate.toLocaleDateString()}.`;

          const notification = new Notification({
            userId: borrower._id,
            loanId: contract._id,
            paymentId: payment._id,
            message: notificationMessage,
            reminderStatus: "sent",
            metadata: {
              reminderType: "upcoming",
              daysRemaining: diffDays,
            },
          });

          await notification.save();
          remindersSent++;

          if (io) {
            io.to(borrower._id.toString()).emit("newNotification", {
              message: notification.message,
              timestamp: notification.timestamp,
              read: notification.read,
              id: notification._id,
            });
          }
        }
        // Updated overdue payment handling section
        else if (diffDays <= 0) {
          const daysOverdue = Math.abs(diffDays);
          const borrower = contract.borrower;
          if (!borrower) continue;

          // Calculate fine information first
          const baseFinePercent = 5;
          const additionalPercent = Math.min(daysOverdue, 30); // Cap at 30% additional
          const finePercent = baseFinePercent + additionalPercent;
          const fineAmount = (payment.amountDue * finePercent) / 100;

          // Now check existing overdue notification
          // Updated overdue notification check
          const existingOverdueNotification = await Notification.findOne({
            userId: borrower._id,
            loanId: contract._id,
            paymentId: payment._id,
            "metadata.reminderType": "overdue",
            "metadata.daysOverdue": daysOverdue,
          });

          if (existingOverdueNotification) continue;

          const overdueMessage = `URGENT: You've missed your payment of Rs.${payment.amountDue.toFixed(
            2
          )} by ${daysOverdue} day(s). A fine of Rs.${fineAmount.toFixed(
            2
          )} (${finePercent}%) has been applied. Pay immediately to avoid further penalties and credit score impact.`;

          const overdueNotification = new Notification({
            userId: borrower._id,
            loanId: contract._id,
            paymentId: payment._id,
            message: overdueMessage,
            reminderStatus: "sent",
            metadata: {
              reminderType: "overdue",
              daysOverdue: daysOverdue,
              fineAmount: fineAmount,
              finePercent: finePercent,
            },
          });

          await overdueNotification.save();

          // Update payment with overdue information
          payment.fineAmount = fineAmount;
          payment.daysOverdue = daysOverdue;
          payment.lastReminderSent = new Date();

          // Apply credit score penalty only if we haven't already done so
          if (!payment.penaltyApplied) {
            const creditScorePenalty = Math.min(daysOverdue, 30);
            borrower.creditScore = Math.max(
              borrower.creditScore - creditScorePenalty,
              0
            );
            await borrower.save();
            payment.penaltyApplied = true;
          }

          // Notify lender about overdue payment (only once)
          if (!payment.lenderNotified) {
            const lenderFullName =
              `${contract.borrower.firstName || ""} ${
                contract.borrower.lastName || ""
              }`.trim() || "the borrower";

            const lenderNotification = new Notification({
              userId: contract.lender._id,
              loanId: contract._id,
              paymentId: payment._id,
              message: `Alert: ${lenderFullName} has missed a payment of Rs.${payment.amountDue.toFixed(
                2
              )} by ${daysOverdue} day(s). A fine of Rs.${fineAmount.toFixed(
                2
              )} has been applied.`,
              reminderStatus: "sent",
            });

            await lenderNotification.save();
            payment.lenderNotified = true;

            if (io) {
              io.to(contract.lender._id.toString()).emit("newNotification", {
                message: lenderNotification.message,
                timestamp: lenderNotification.timestamp,
              });
            }
          }

          if (io) {
            io.to(borrower._id.toString()).emit("newNotification", {
              message: overdueNotification.message,
              timestamp: overdueNotification.timestamp,
            });
          }
        }
      }
      await contract.save();
    }

    // ... (rest of the function remains the same)
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
