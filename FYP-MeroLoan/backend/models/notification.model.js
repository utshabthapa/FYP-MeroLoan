// import mongoose from "mongoose";

// const notificationSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   message: { type: String, required: true },
//   read: { type: Boolean, default: false },
//   timestamp: { type: Date, default: Date.now },
//   reminderStatus: {
//     type: String,
//     enum: ["notSent", "sent"],
//     default: "notSent",
//   },
// });

// export const Notification = mongoose.model("Notification", notificationSchema);

// notification.model.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    reminderStatus: {
      type: String,
      enum: ["notSent", "sent"],
      default: "notSent",
    },
    // Optional fields for loan/payment tracking
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: "ActiveContract" },
    paymentId: { type: mongoose.Schema.Types.ObjectId },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    // Ensure these optional fields don't get included in queries unless explicitly requested
    toJSON: {
      transform: function (doc, ret) {
        delete ret.metadata;
        delete ret.loanId;
        delete ret.paymentId;
        return ret;
      },
    },
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
