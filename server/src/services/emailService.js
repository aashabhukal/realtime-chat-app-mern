// src/services/emailService.js
import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter = null;

if (env.SMTP_HOST && env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

/* ------------------------- GENERIC EMAIL ------------------------- */
export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.warn('⚠️  SMTP not configured, skipping email');
    console.log('📧 Would send email to:', to);
    console.log('📧 Subject:', subject);
    return;
  }
  await transporter.sendMail({
    from: `"Chat App" <${env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

/* ------------------------- OTP EMAIL ------------------------- */
export const sendOTPEmail = async (to, name, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Verify Your Account 🎉</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your OTP for account verification is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; color: #4f46e5;">
        ${otp}
      </div>
      <p style="margin-top: 20px; color: #6b7280;">
        This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
      </p>
      <p style="color: #6b7280; font-size: 13px;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    to,
    subject: 'Verify Your Account - OTP',
    html,
  });
};