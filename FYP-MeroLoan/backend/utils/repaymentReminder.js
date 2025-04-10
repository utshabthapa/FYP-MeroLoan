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
        // Skip if payment is already completed
        if (payment.status === "completed") continue;

        const dueDate = new Date(payment.dueDate);
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Upcoming payment reminder (only if not already sent for this payment)
        if (diffDays <= REMINDER_DAYS && diffDays > 0) {
          const borrower = contract.borrower;
          if (!borrower) continue;

          // Check if we've already sent a notification for this specific payment
          const existingNotification = await Notification.findOne({
            userId: borrower._id,
            "metadata.paymentId": payment._id.toString(),
            reminderStatus: "sent",
            "metadata.reminderType": "upcoming",
          });

          // Skip if reminder already sent
          if (existingNotification) continue;

          const notificationMessage = `Reminder: Payment of Rs.${payment.amountDue.toFixed(
            2
          )} for your loan is due in ${diffDays} day(s) on ${dueDate.toLocaleDateString()}.`;

          const notification = new Notification({
            userId: borrower._id,
            message: notificationMessage,
            reminderStatus: "sent",
            metadata: {
              paymentId: payment._id.toString(),
              reminderType: "upcoming",
              daysRemaining: diffDays,
            },
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

          // try {
          //   await sendRepaymentReminderEmail(
          //     borrower.email,
          //     borrower.firstName,
          //     contract.loanAmount,
          //     payment.amountDue,
          //     dueDate,
          //     diffDays
          //   );
          //   remindersSent++;
          //   console.log(`Sent reminder to ${borrower.email}`);
          // } catch (emailError) {
          //   console.error(`Email failed for ${borrower.email}:`, emailError);
          // }
        }
        // Overdue payment handling
        else if (diffDays <= 0) {
          const daysOverdue = Math.abs(diffDays);
          const borrower = contract.borrower;
          if (!borrower) continue;

          // Check if we already sent an overdue notification for the CURRENT number of days
          const existingOverdueNotification = await Notification.findOne({
            userId: borrower._id,
            "metadata.paymentId": payment._id.toString(),
            reminderStatus: "sent",
            "metadata.reminderType": "overdue",
            "metadata.daysOverdue": daysOverdue,
          });

          // Skip if we already sent a notification for this specific number of days overdue
          if (existingOverdueNotification) continue;

          // Calculate fine information (but don't create the fine record)
          const baseFinePercent = 5;
          const additionalPercent = Math.min(daysOverdue, 30); // Cap at 30% additional
          const finePercent = baseFinePercent + additionalPercent;
          const fineAmount = (payment.amountDue * finePercent) / 100;

          // Create overdue notification with details
          const overdueMessage = `URGENT: You've missed your payment of Rs.${payment.amountDue.toFixed(
            2
          )} by ${daysOverdue} day(s). A fine of Rs.${fineAmount.toFixed(
            2
          )} (${finePercent}%) has been applied. Pay immediately to avoid further penalties and credit score impact.`;

          const overdueNotification = new Notification({
            userId: borrower._id,
            message: overdueMessage,
            reminderStatus: "sent",
            metadata: {
              paymentId: payment._id.toString(),
              reminderType: "overdue",
              daysOverdue: daysOverdue,
              fineAmount: fineAmount,
              finePercent: finePercent,
            },
          });

          await overdueNotification.save();

          // Update payment with overdue information, but keeping status as "pending"
          // Don't use "overdue" status since it's not in the enum
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

            // Mark that we've applied the penalty
            payment.penaltyApplied = true;
          }

          // Notify lender about overdue payment (only once)
          if (!payment.lenderNotified) {
            const lenderNotification = new Notification({
              userId: contract.lender._id,
              message: `Alert: ${borrower.firstName} ${
                borrower.lastName
              } has missed a payment of Rs.${payment.amountDue.toFixed(
                2
              )} by ${daysOverdue} day(s). A fine of Rs.${fineAmount.toFixed(
                2
              )} has been applied.`,
              reminderStatus: "sent",
              metadata: {
                paymentId: payment._id.toString(),
                borrowerId: borrower._id.toString(),
              },
            });
            await lenderNotification.save();

            // Mark that we've notified the lender
            payment.lenderNotified = true;

            if (io) {
              io.to(contract.lender._id.toString()).emit("newNotification", {
                message: lenderNotification.message,
                timestamp: lenderNotification.timestamp,
              });
            }
          }

          // Emit real-time notifications to borrower
          if (io) {
            io.to(borrower._id.toString()).emit("newNotification", {
              message: overdueNotification.message,
              timestamp: overdueNotification.timestamp,
            });
          }

          // try {
          //   // Send overdue email to borrower
          //   await sendRepaymentReminderEmail(
          //     borrower.email,
          //     borrower.firstName,
          //     contract.loanAmount,
          //     payment.amountDue,
          //     dueDate,
          //     -daysOverdue, // Negative value indicates overdue
          //     fineAmount
          //   );

          //   overdueRemindersSent++;
          //   console.log(
          //     `Sent overdue notice to ${borrower.email} with ${daysOverdue} days late`
          //   );
          // } catch (emailError) {
          //   console.error(
          //     `Overdue email failed for ${borrower.email}:`,
          //     emailError
          //   );
          // }
        }
      }
      await contract.save(); // Save any changes made to the contract
    }

    console.log(`Results:
      - Sent ${remindersSent} upcoming payment reminders
      - Sent ${overdueRemindersSent} overdue notices
      - Processed ${activeContracts.length} active contracts`);

    return {
      upcomingReminders: remindersSent,
      overdueReminders: overdueRemindersSent,
    };
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
