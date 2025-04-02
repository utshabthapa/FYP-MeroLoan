import nodemailer from "nodemailer";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  KYC_APPROVED_TEMPLATE,
  KYC_REJECTED_TEMPLATE,
} from "./emailTemplate.js";
import dotenv from "dotenv";
dotenv.config();

// Configure Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail as the service
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail email address
    pass: process.env.GMAIL_PASS, // Your Gmail app password (not your regular Gmail password)
  },
});

const sender = '"MeroLoan" <your-email@gmail.com>'; // Replace with your Gmail address

// Send Verification Email
export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    await transporter.sendMail({
      from: sender,
      to: email,
      subject: "MeroLoan - Verify your email address",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
    });
  } catch (error) {
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: sender,
      to: email,
      subject: "Welcome to MeroLoan!",
      html: `<p>Dear ${name},</p><p>Welcome to MeroLoan! We're excited to have you on board.</p>`,
    });
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    await transporter.sendMail({
      from: sender,
      to: email,
      subject: "MeroLoan - Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });
  } catch (error) {
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
};

// Send Password Reset Success Email
export const sendPasswordResetSuccessEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: sender,
      to: email,
      subject: "MeroLoan - Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
  } catch (error) {
    throw new Error(
      `Error sending password reset success email: ${error.message}`
    );
  }
};

// Add these functions to your emails.js file
export const sendKYCApprovedEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: sender,
      to: email,
      subject: "MeroLoan - Your KYC has been approved",
      html: KYC_APPROVED_TEMPLATE.replace("{userName}", name),
    });
  } catch (error) {
    throw new Error(`Error sending KYC approval email: ${error.message}`);
  }
};

export const sendKYCRejectedEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: sender,
      to: email,
      subject: "MeroLoan - Your KYC needs attention",
      html: KYC_REJECTED_TEMPLATE.replace("{userName}", name),
    });
  } catch (error) {
    throw new Error(`Error sending KYC rejection email: ${error.message}`);
  }
};
