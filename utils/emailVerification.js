import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587, 
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false 
  }
});

const brandHeader = `
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="text-transform: uppercase; letter-spacing: 6px; color: #000; margin: 0; font-size: 28px;">Ikeyà</h1>
    <p style="text-transform: uppercase; font-size: 9px; letter-spacing: 3px; color: #92400e; margin-top: 5px;">Originality is the only luxury</p>
  </div>
`;

// 1. WELCOME EMAIL
export const sendWelcomeEmail = async (email, name) => {
  try {
    const html = `<div style="font-family: serif; max-width: 600px; margin: auto; padding: 50px 20px;">
      ${brandHeader}
      <h2 style="text-align: center;">Welcome, ${name}</h2>
      <p style="text-align: center;">Your journey into the house of Ikeyà has begun.</p>
    </div>`;

    await transporter.sendMail({ 
      from: `"Ikeyà Originals" <${process.env.SMTP_USER}>`, 
      to: email, 
      subject: "Welcome to Ikeyà", 
      html 
    });
  } catch (error) {
    console.error("Welcome email failed:", error);
  }
};

// 2. LOGIN EMAIL (The missing piece causing the crash)
export const sendLoginEmail = async (email, token) => {
  try {
    const loginUrl = `${process.env.FRONTEND_URL}/verify-login?token=${token}`;
    const html = `<div style="font-family: serif; max-width: 600px; margin: auto; padding: 50px 20px;">
      ${brandHeader}
      <h2 style="text-align: center;">Sign In Request</h2>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${loginUrl}" style="background: #92400e; color: #ffffff; padding: 18px 40px; text-decoration: none; text-transform: uppercase; letter-spacing: 3px;">Complete Login</a>
      </div>
    </div>`;

    await transporter.sendMail({ 
      from: `"Ikeyà Support" <${process.env.SMTP_USER}>`, 
      to: email, 
      subject: "Your Ikeyà Login Link", 
      html 
    });
  } catch (error) {
    console.error("Login email failed:", error);
  }
};

// 3. RESET EMAIL
export const sendResetEmail = async (email, token) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`; 
    const mailOptions = {
      from: `"Ikeyà Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your Ikeyà Password",
      html: `<div style="font-family: serif; max-width: 600px; margin: auto; padding: 50px 20px;">
        ${brandHeader}
        <h1>Password Reset Request</h1>
        <a href="${resetLink}">Reset Password</a>
      </div>`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Reset email failed:", error);
  }
};