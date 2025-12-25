import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
// Import the email functions you just created
import { sendWelcomeEmail, sendLoginEmail } from "../utils/emailVerification.js";

const prisma = new PrismaClient();


// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Send the Welcome/Verification Email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr);
    }

    // NOTICE: We are NOT sending a token here anymore.
    // We send a success message so the frontend knows to show the "Check Email" screen.
    res.status(201).json({ 
      message: "Registration successful! A confirmation email has been sent to your inbox.",
      requiresEmailVerification: true 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid password" });

    const token = generateToken(user);

    // 2. Send the Magic Login Link via Email
    try {
      await sendLoginEmail(user.email, token);
      
      // Instead of sending the token in the response, we tell the frontend
      // that the email is on its way.
      res.json({ 
        message: "A secure login link has been sent to your email.",
        requiresVerification: true 
      });
    } catch (emailErr) {
      console.error("Login email failed:", emailErr);
      res.status(500).json({ message: "Could not send login email. Please try again." });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PROFILE (Protected)
export const getProfile = async (req, res) => {
  try {
    // Note: ensure your authMiddleware attaches 'userid' to req.user
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userid } 
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};