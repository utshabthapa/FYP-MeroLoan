import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplate.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "MeroLoan - Verify your email address",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
  } catch (error) {
    throw new Error(`error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "2871932b-eb0f-4e9b-a380-2522b6d80cb1",
      template_variables: {
        company_info_name: "MeroLoan",
        name: name,
      },
    });
  } catch (error) {
    throw new Error(`error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "MeroLoan - Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });
  } catch (error) {
    throw new Error(`error sending password reset email: ${error}`);
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "MeroLoan - Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
  } catch (error) {
    throw new Error(`error sending password reset success email: ${error}`);
  }
};
