import { Appeal } from "../models/appeal.model.js";
import { User } from "../models/user.model.js"; // Import User model
import { Notification } from "../models/notification.model.js"; // Import Notification model
import { io } from "../index.js"; // Import socket.io for real-time notifications

// Get all appeals (for admin)
export const getAllAppeals = async (req, res) => {
  try {
    // You can add admin check middleware or logic here if needed
    const appeals = await Appeal.find()
      .populate("userId", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: appeals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a specific appeal by ID
export const getAppealById = async (req, res) => {
  try {
    const { appealId } = req.params;

    const appeal = await Appeal.findById(appealId)
      .populate("userId", "name email")
      .populate("reviewedBy", "name email");

    if (!appeal) {
      return res.status(404).json({
        success: false,
        message: "Appeal not found",
      });
    }

    res.status(200).json({
      success: true,
      data: appeal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all appeals for a specific user
export const getUserAppeals = async (req, res) => {
  try {
    const { userId } = req.params;

    const appeals = await Appeal.find({ userId })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: appeals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new appeal
export const createAppeal = async (req, res) => {
  try {
    // Create a new appeal with the request body
    const newAppeal = new Appeal({
      userId: req.body.userId,
      reason: req.body.reason,
      details: req.body.details,
      status: "pending", // Default status
    });

    // Save the appeal to the database
    const savedAppeal = await newAppeal.save();

    res.status(201).json({
      success: true,
      data: savedAppeal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update an appeal status (for admin)
export const updateAppeal = async (req, res) => {
  try {
    const { appealId } = req.params;
    const { status, adminResponse, reviewedBy } = req.body;

    // Find the appeal
    const appeal = await Appeal.findById(appealId);
    if (!appeal) {
      return res.status(404).json({
        success: false,
        message: "Appeal not found",
      });
    }

    // Update the appeal
    appeal.status = status;
    appeal.adminResponse = adminResponse;
    appeal.reviewedBy = reviewedBy;
    appeal.reviewedAt = new Date();

    // Find the user who submitted the appeal
    const user = await User.findById(appeal.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create notification message based on appeal status
    let notificationMessage = "";

    // If appeal is approved, update user's banStatus
    if (status === "approved") {
      user.banStatus = "notBanned"; // Set user's ban status to notBanned
      await user.save();
      notificationMessage =
        "Your appeal has been approved. Your account has been unbanned.";
    } else if (status === "rejected") {
      notificationMessage = `Your appeal has been rejected. Reason: ${
        adminResponse || "No reason provided"
      }`;
    } else {
      notificationMessage = `Your appeal status has been updated to: ${status}`;
    }

    // Create a notification for the user
    const notification = new Notification({
      userId: appeal.userId,
      message: notificationMessage,
      timestamp: new Date(),
    });
    await notification.save();

    // Emit a real-time notification to the user
    io.to(appeal.userId.toString()).emit("newNotification", {
      message: notification.message,
      timestamp: notification.timestamp,
    });

    // Save the updated appeal
    await appeal.save();

    // Populate the fields for response
    await appeal.populate("userId", "name email");
    await appeal.populate("reviewedBy", "name email");

    res.status(200).json({
      success: true,
      data: appeal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete an appeal
export const deleteAppeal = async (req, res) => {
  try {
    const { appealId } = req.params;

    const deletedAppeal = await Appeal.findByIdAndDelete(appealId);

    if (!deletedAppeal) {
      return res.status(404).json({
        success: false,
        message: "Appeal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appeal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
