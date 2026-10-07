const nodemailer = require('nodemailer');

/**
 * Create Nodemailer Transporter based on Environment Variables
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return null;
};

/**
 * Send 6-Digit OTP Email to User Inbox
 * Matching exact structure:
 * Subject: Your InfluenceAI OTP
 * Content:
 * Dear User, don't share your One Time Password to others.
 * Your One Time Password is:
 * [OTP]
 */
const sendOTPEmail = async (toEmail, otpCode) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'InfluenceAI Authentication'}" <${process.env.EMAIL_USER || 'noreply@influenceai.com'}>`,
    to: toEmail,
    subject: 'Your InfluenceAI OTP',
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background-color: #FFFFFF;">
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px 0;">Your InfluenceAI OTP</h2>
        </div>
        <p style="font-size: 14px; color: #374151; margin-bottom: 12px; line-height: 1.5;">
          Dear User, don't share your One Time Password to others.
        </p>
        <p style="font-size: 14px; color: #374151; margin-bottom: 16px; line-height: 1.5;">
          Your One Time Password is:
        </p>
        <div style="margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #111827; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 24px 0 16px 0;" />
        <p style="font-size: 12px; color: #6B7280; margin: 0;">
          This 6-digit verification code will expire in 10 minutes. If you did not request this code, please ignore this email.
        </p>
      </div>
    `,
    text: `Your InfluenceAI OTP\n\nDear User, don't share your One Time Password to others.\n\nYour One Time Password is:\n${otpCode}\n\nThis code will expire in 10 minutes.`
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SERVICE] OTP Email sent successfully to ${toEmail}. MessageID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL SERVICE ERROR] Failed to send email via SMTP:`, err.message);
      // Fallback return error info
      return { success: false, error: err.message };
    }
  } else {
    console.log(`\n==================================================`);
    console.log(`[EMAIL SERVICE NOTICE] SMTP credentials not set in backend/.env`);
    console.log(`[GENERATED OTP CODE] Email: ${toEmail} | Code: ${otpCode}`);
    console.log(`To send real emails directly to Gmail inboxes:`);
    console.log(`Add EMAIL_USER=yourgmail@gmail.com and EMAIL_PASS=your-16-digit-app-password to backend/.env`);
    console.log(`==================================================\n`);
    return { success: true, simulated: true, otpCode };
  }
};

module.exports = {
  sendOTPEmail
};
