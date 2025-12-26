// utils/emailVerification.js

import dotenv from "dotenv";
dotenv.config(); // Load .env variables first

import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY is missing! Emails will not be sent.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Use Gmail in local development for testing
const getFromEmail = () => {
  if (process.env.NODE_ENV === "production") {
    return "Ikeyà Support <no-reply@ikeya.shop>";
  }
  return "Ikeyà Support <delightgeorge105@gmail.com>"; // your Gmail for testing
};

const brandHeader = `
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="text-transform: uppercase; letter-spacing: 6px; color: #000; margin: 0; font-size: 28px;">Ikeyà</h1>
    <p style="text-transform: uppercase; font-size: 9px; letter-spacing: 3px; color: #92400e; margin-top: 5px;">
      Originality is the only luxury
    </p>
  </div>
`;

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const response = await resend.emails.send({
      from: getFromEmail(),
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
    console.log("Full Resend response:", response);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
};

// 1️⃣ WELCOME EMAIL
export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: serif; max-width: 600px; margin: auto; padding: 50px 20px;">
      ${brandHeader}
      <h2 style="text-align: center;">Welcome, ${name}</h2>
      <p style="text-align: center;">Your journey into the house of Ikeyà has begun.</p>
    </div>
  `;
  await sendEmail({ to: email, subject: "Welcome to Ikeyà", html });
};

// 2️⃣ LOGIN EMAIL
export const sendLoginEmail = async (email, token) => {
  const loginUrl = `${process.env.FRONTEND_URL}/verify-login?token=${token}`;
  const html = `
    <div style="font-family: serif; max-width: 600px; margin: auto; padding: 50px 20px;">
      ${brandHeader}
      <h2 style="text-align: center;">Sign In Request</h2>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${loginUrl}" style="background: #92400e; color: #ffffff; padding: 18px 40px; text-decoration: none; text-transform: uppercase; letter-spacing: 3px;">
          Complete Login
        </a>
      </div>
    </div>
  `;
  await sendEmail({ to: email, subject: "Your Ikeyà Login Link", html });
};

// 3️⃣ RESET EMAIL
export const sendResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: serif; max-width: 600px; margin: auto; padding: 50px 20px;">
      ${brandHeader}
      <h1>Password Reset Request</h1>
      <a href="${resetLink}">Reset Password</a>
    </div>
  `;
  await sendEmail({ to: email, subject: "Reset Your Ikeyà Password", html });
};
