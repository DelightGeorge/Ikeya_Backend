import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// --- CONFIGURATION ---
// IMPORTANT: This domain MUST be verified in the Resend dashboard first.
const FROM_EMAIL = "Ikeyà <hello@ikeyaoriginnals.site>"; 
const ADMIN_EMAIL = "ikeyaoriginals@gmail.com";

const brandHeader = `
  <div style="text-align:center; margin-bottom:30px;">
    <h1 style="text-transform:uppercase; letter-spacing:6px; color:#000; margin:0; font-size:28px;">Ikeyà</h1>
    <p style="text-transform:uppercase; font-size:9px; letter-spacing:3px; color:#92400e; margin-top:5px;">
      Originality is the only luxury
    </p>
  </div>
`;

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ Missing RESEND_API_KEY in environment variables.");
    return;
  }

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: `
        <div style="font-family:serif; max-width:600px; margin:auto; padding:50px 20px;">
          ${brandHeader}
          ${html}
          <p style="margin-top:40px; font-size:12px; color:#666; text-align:center;">
            © ${new Date().getFullYear()} Ikeyà Naturals
          </p>
        </div>
      `,
      text: text || "Open this email in a browser that supports HTML to view the content.",
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
        // This ensures if a customer hits 'Reply', it goes to your Gmail, not the 'no-reply' domain
        "Reply-To": ADMIN_EMAIL, 
      },
    });

    if (response.error) {
      console.error(`❌ Resend Error:`, response.error);
      return;
    }

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
};

// --- EMAIL TEMPLATES ---

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <h2 style="text-align:center;">Welcome, ${name}</h2>
    <p style="text-align:center;">Your journey into the house of Ikeyà has begun.</p>
  `;
  await sendEmail({
    to: email, // Fixed: Sending to the actual user now, not the admin
    subject: "Welcome to Ikeyà",
    html,
  });
};

export const sendLoginEmail = async (email, token) => {
  const encodedToken = encodeURIComponent(token);
  const loginUrl = `${process.env.FRONTEND_URL}/verify-login?token=${encodedToken}`;

  const html = `
    <h2 style="text-align:center;">Sign In Request</h2>
    <div style="text-align:center; margin:40px 0;">
      <a href="${loginUrl}" style="background:#92400e; color:#fff; padding:18px 40px; text-decoration:none; text-transform:uppercase; letter-spacing:3px;">
        Complete Login
      </a>
    </div>
  `;
  await sendEmail({
    to: email,
    subject: "Your Ikeyà Login Link",
    html,
    text: `Sign in using this link: ${loginUrl}`,
  });
};

export const sendResetEmail = async (email, token) => {
  const encodedToken = encodeURIComponent(token);
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${encodedToken}`;

  const html = `
    <h2 style="text-align:center;">Password Reset Request</h2>
    <p style="text-align:center;">Click the button below to reset your password:</p>
    <div style="text-align:center; margin:20px 0;">
      <a href="${resetLink}" style="background:#92400e; color:#fff; padding:12px 30px; text-decoration:none; text-transform:uppercase; letter-spacing:2px;">
        Reset Password
      </a>
    </div>
  `;
  await sendEmail({
    to: email,
    subject: "Reset Your Ikeyà Password",
    html,
    text: `Reset your password using this link: ${resetLink}`,
  });
};

export const sendPaymentSuccessEmail = async ({ email, amount, ref }) => {
  const html = `
    <h2 style="text-align:center;">Payment Confirmed</h2>
    <p>Your payment of <strong>₦${amount}</strong> was successful.</p>
    <p><strong>Reference:</strong> ${ref}</p>
    <p>We are preparing your order.</p>
  `;
  await sendEmail({
    to: email,
    subject: "Payment Successful — Ikeyà",
    html,
    text: `Your payment of ₦${amount} was successful. Reference: ${ref}`,
  });
};

export const sendAdminAlertEmail = async ({ customerEmail, amount, ref }) => {
  const html = `
    <h3 style="text-align:center;">New Paid Order</h3>
    <p><strong>Customer:</strong> ${customerEmail}</p>
    <p><strong>Amount:</strong> ₦${amount}</p>
    <p><strong>Reference:</strong> ${ref}</p>
  `;
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: "🚨 New Paid Order",
    html,
    text: `New Paid Order - Customer: ${customerEmail}, Amount: ₦${amount}, Reference: ${ref}`,
  });
};