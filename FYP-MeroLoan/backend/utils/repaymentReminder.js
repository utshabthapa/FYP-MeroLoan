import { ActiveContract } from "../models/activeContract.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { BadLoan } from "../models/badLoan.model.js";
import { io } from "../index.js";
import { sendRepaymentReminderEmail } from "../mailtrap/emails.js";

const REMINDER_DAYS = 3;
const BAD_LOAN_THRESHOLD = 50; // Days after which a loan is considered bad

export const checkUpcomingRepayments = async (specificUserId = null) => {
  try {
    const now = new Date();
    let remindersSent = 0;
    let overdueRemindersSent = 0;
    let badLoansFlagged = 0;

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
      let hasBadLoan = false;
      let mostOverduePayment = 0;

      for (const payment of contract.repaymentSchedule) {
        if (payment.status === "completed") continue;

        const dueDate = new Date(payment.dueDate);
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Track most overdue payment for bad loan assessment
        if (diffDays < mostOverduePayment) {
          mostOverduePayment = diffDays;
        }

        // Upcoming payment reminder (3 days before due)
        if (diffDays <= REMINDER_DAYS && diffDays > 0) {
          const borrower = contract.borrower;
          if (!borrower) continue;

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
            type: "repayment",
            metadata: {
              reminderType: "upcoming",
              daysRemaining: diffDays,
            },
          });

          await notification.save();
          remindersSent++;

          // Send email reminder
          await sendRepaymentReminderEmail({
            email: borrower.email,
            name: `${borrower.firstName} ${borrower.lastName}`,
            amount: payment.amountDue,
            dueDate: dueDate.toLocaleDateString(),
            daysRemaining: diffDays,
          });

          if (io) {
            io.to(borrower._id.toString()).emit("newNotification", {
              message: notification.message,
              timestamp: notification.createdAt,
              read: false,
              id: notification._id,
            });
          }
        }
        // Overdue payment handling (past due date)
        else if (diffDays <= 0) {
          const daysOverdue = Math.abs(diffDays);
          const borrower = contract.borrower;
          if (!borrower) continue;

          // Calculate fine information
          const baseFinePercent = 5;
          const additionalPercent = Math.min(daysOverdue, 30);
          const finePercent = baseFinePercent + additionalPercent;
          const fineAmount = (payment.amountDue * finePercent) / 100;

          // Check for existing overdue notification
          const existingOverdueNotification = await Notification.findOne({
            userId: borrower._id,
            loanId: contract._id,
            paymentId: payment._id,
            "metadata.reminderType": "overdue",
            "metadata.daysOverdue": daysOverdue,
          });

          if (!existingOverdueNotification) {
            const overdueMessage = `URGENT: You've missed your payment of Rs.${payment.amountDue.toFixed(
              2
            )} by ${daysOverdue} day(s). A fine of Rs.${fineAmount.toFixed(
              2
            )} (${finePercent}%) has been applied.`;

            const overdueNotification = new Notification({
              userId: borrower._id,
              loanId: contract._id,
              paymentId: payment._id,
              message: overdueMessage,
              type: "overdue",
              metadata: {
                reminderType: "overdue",
                daysOverdue: daysOverdue,
                fineAmount: fineAmount,
                finePercent: finePercent,
              },
            });

            await overdueNotification.save();
            overdueRemindersSent++;

            // Update payment with overdue information
            payment.fineAmount = fineAmount;
            payment.daysOverdue = daysOverdue;
            payment.lastReminderSent = new Date();

            // Apply credit score penalty only once
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
            if (!payment.lenderNotified && contract.lender) {
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
                type: "lender_alert",
              });

              await lenderNotification.save();
              payment.lenderNotified = true;

              if (io) {
                io.to(contract.lender._id.toString()).emit("newNotification", {
                  message: lenderNotification.message,
                  timestamp: lenderNotification.createdAt,
                });
              }
            }

            if (io) {
              io.to(borrower._id.toString()).emit("newNotification", {
                message: overdueNotification.message,
                timestamp: overdueNotification.createdAt,
              });
            }
          }
        }
      }

      // Bad loan handling (50+ days overdue)
      if (mostOverduePayment <= -BAD_LOAN_THRESHOLD) {
        const existingBadLoan = await BadLoan.findOne({ loan: contract._id });

        if (!existingBadLoan) {
          // Find the most overdue payment
          const overduePayment = contract.repaymentSchedule
            .filter((p) => p.status === "pending" && new Date(p.dueDate) < now)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

          if (overduePayment) {
            const daysOverdue = Math.ceil(
              (now - new Date(overduePayment.dueDate)) / (1000 * 60 * 60 * 24)
            );

            const badLoan = new BadLoan({
              loan: contract._id,
              borrower: contract.borrower._id,
              lender: contract.lender?._id,
              originalAmount: contract.loanAmount,
              amountDue: overduePayment.amountDue,
              daysOverdue: daysOverdue,
              lastPaymentDate: contract.repaymentSchedule
                .filter((p) => p.status === "completed")
                .sort(
                  (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
                )[0]?.paymentDate,
              status: "ACTIVE",
            });

            await badLoan.save();
            badLoansFlagged++;
            hasBadLoan = true;

            // Notify admin and lender about bad loan
            const badLoanNotification = new Notification({
              userId: contract.lender?._id,
              loanId: contract._id,
              message: `ALERT: Loan ${contract._id} has been overdue for ${daysOverdue} days and has been flagged as a bad loan.`,
              type: "BAD_LOAN",
            });
            await badLoanNotification.save();

            if (io && contract.lender?._id) {
              io.to(contract.lender._id.toString()).emit("newNotification", {
                message: badLoanNotification.message,
                timestamp: badLoanNotification.createdAt,
              });
            }
          }
        }
      }

      // Mark contract as defaulted if any payment is bad
      if (hasBadLoan) {
        contract.status = "defaulted";
        await contract.save();
      }
    }

    console.log(
      `Reminders sent: ${remindersSent}, Overdue reminders: ${overdueRemindersSent}, Bad loans flagged: ${badLoansFlagged}`
    );
    return { remindersSent, overdueRemindersSent, badLoansFlagged };
  } catch (error) {
    console.error("Error in checkUpcomingRepayments:", error);
    throw error;
  }
};

export const startRepaymentReminderScheduler = () => {
  // Initial check when server starts
  checkUpcomingRepayments().catch(console.error);

  // Schedule daily checks at 9 AM
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const now = new Date();
  const next9AM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    9, // 9 AM
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
