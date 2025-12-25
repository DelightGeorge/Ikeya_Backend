import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true, // MUST be true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// Helper for the Brand Header to avoid repeating code
const brandHeader = `
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="text-transform: uppercase; letter-spacing: 6px; color: #000; margin: 0; font-size: 28px;">Ikeyà</h1>
    <p style="text-transform: uppercase; font-size: 9px; letter-spacing: 3px; color: #92400e; margin-top: 5px;">Originality is the only luxury</p>
  </div>
`;

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; padding: 50px 20px; background-color: #ffffff; border: 1px solid #f0f0f0;">
      ${brandHeader}
      <div style="color: #333; line-height: 1.8; text-align: center;">
        <h2 style="font-weight: normal; font-style: italic; color: #1a1a1a;">Welcome, ${name}</h2>
        <p style="font-size: 14px; color: #555;">Your journey into the house of Ikeyà has begun. Your account is now active and your digital wardrobe awaits.</p>
        <p style="font-size: 14px; color: #555;">We are delighted to have you join our community of curators.</p>
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
};

export const sendLoginEmail = async (email, token) => {
  const loginUrl = `${process.env.FRONTEND_URL}/verify-login?token=${token}`;
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; padding: 50px 20px; background-color: #fafaf9; border: 1px solid #eeeeee;">
      ${brandHeader}
      <div style="text-align: center;">
        <h2 style="text-transform: uppercase; letter-spacing: 2px; font-size: 18px; color: #1a1a1a;">Sign In Request</h2>
        <p style="color: #666; font-size: 14px; margin: 20px auto; max-width: 350px;">Please click the button below to securely access your Ikeyà account.</p>
        
        <div style="margin: 40px 0;">
          <a href="${loginUrl}" style="background: #92400e; color: #ffffff; padding: 18px 40px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; display: inline-block; box-shadow: 0 4px 12px rgba(146, 64, 14, 0.2);">Complete Login</a>
        </div>

        <p style="font-size: 10px; color: #999; margin-top: 30px; font-style: italic;">This link is valid for 60 minutes. If you did not request this, please ignore this message.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({ 
    from: `"Ikeyà Support" <${process.env.SMTP_USER}>`, 
    to: email, 
    subject: "Your Ikeyà Login Link", 
    html 
  });
};