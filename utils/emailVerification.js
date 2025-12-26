import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587, // Changed from 465 to 587
  secure: false, // Must be false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps connection on cloud servers
  }
});

// ... (brandHeader stays the same)

export const sendWelcomeEmail = async (email, name) => {
  try {
    const html = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; padding: 50px 20px; background-color: #ffffff; border: 1px solid #f0f0f0;">
        ${brandHeader}
        <div style="color: #333; line-height: 1.8; text-align: center;">
          <h2 style="font-weight: normal; font-style: italic; color: #1a1a1a;">Welcome, ${name}</h2>
          <p style="font-size: 14px; color: #555;">Your journey into the house of Ikeyà has begun.</p>
        </div>
        <div style="margin-top: 40px; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/shop" style="background: #000; color: #fff; padding: 18px 35px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">Explore the Collection</a>
        </div>
      </div>
    `;

    await transporter.sendMail({ 
      from: `"Ikeyà Originals" <${process.env.SMTP_USER}>`, 
      to: email, 
      subject: "Welcome to Ikeyà", 
      html 
    });
  } catch (error) {
    console.error("Email failed but continuing process:", error);
    // We don't throw the error so the user can still register/login
  }
};

export const sendResetEmail = async (email, token) => {
  // FIXED: Changed localhost to FRONTEND_URL
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`; 
  
  try {
    const mailOptions = {
      from: `"Ikeyà Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your Ikeyà Password",
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; padding: 50px 20px;">
          ${brandHeader}
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="background: #000; color: #fff; padding: 15px 25px; text-decoration: none; display: inline-block;">Reset Password</a>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Reset email failed:", error);
  }
};