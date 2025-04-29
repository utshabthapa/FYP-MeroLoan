export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

// Add these to your emailTemplate.js file
export const KYC_APPROVED_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>MeroLoan - KYC Verification Approved</h2>
    </div>
    <div class="content">
      <p>Dear {userName},</p>
      <p>Congratulations! Your KYC (Know Your Customer) verification has been <strong>approved</strong>.</p>
      <p>This approval means you now have full access to all MeroLoan services. Your identity has been verified and your account has been upgraded.</p>
      <p>Benefits of your verified status:</p>
      <ul>
        <li>Higher loan limits</li>
        <li>Better interest rates</li>
        <li>Faster loan processing</li>
        <li>Improved credit score</li>
      </ul>
      <p>Thank you for your patience during this process. If you have any questions about your approved status or need any assistance, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The MeroLoan Team</p>
    </div>
    <div class="footer">
      <p>© 2025 MeroLoan. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const KYC_REJECTED_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f44336; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>MeroLoan - KYC Verification Update</h2>
    </div>
    <div class="content">
      <p>Dear {userName},</p>
      <p>We regret to inform you that your KYC (Know Your Customer) verification has been <strong>rejected</strong>.</p>
      <p>Common reasons for rejection include:</p>
      <ul>
        <li>Unclear or incomplete identification documents</li>
        <li>Mismatch between provided information and documents</li>
        <li>Expired identification documents</li>
        <li>Poor image quality of uploaded documents</li>
      </ul>
      <p>You can resubmit your KYC application with updated documents through your account dashboard.</p>
      <p>If you have any questions or need assistance with resubmitting your KYC, please contact our support team.</p>
      <p>Best regards,<br>The MeroLoan Team</p>
    </div>
    <div class="footer">
      <p>© 2025 MeroLoan. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Add this to your emailTemplate.js file
export const REPAYMENT_REMINDER_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4682B4; color: white; padding: 10px 20px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
    .button { background-color: #4682B4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>MeroLoan Payment Reminder</h2>
    </div>
    <div class="content">
      <p>Dear {userName},</p>
      <p>This is a friendly reminder that you have an upcoming loan repayment due on <strong>{dueDate}</strong>.</p>
      <p><strong>Payment Details:</strong></p>
      <ul>
        <li>Amount Due: Rs. {amountDue}</li>
        <li>Due Date: {dueDate}</li>
      </ul>
      <p>Please ensure that your account has sufficient funds for the repayment to avoid any late payment fees.</p>
      <p>Log in to your MeroLoan account to view complete details or make an early payment.</p>
      <p>Thank you for your prompt attention to this matter.</p>
      <p>Best Regards,<br>MeroLoan Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;
