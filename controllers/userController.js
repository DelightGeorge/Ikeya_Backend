import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/generateToken.js";
import { 
  sendWelcomeEmail, 
  sendLoginEmail, 
  sendResetEmail 
} from "../utils/emailVerification.js";

const prisma = new PrismaClient();

// --- REGISTER USER ---
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Validate Password Match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr);
    }

    res.status(201).json({ 
      message: "Registration successful! Please check your email to verify your account.",
      requiresEmailVerification: true 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- LOGIN USER ---
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid password" });

    const token = generateToken(user);

    try {
      await sendLoginEmail(user.email, token);
      res.json({ 
        message: "A secure login link has been sent to your email.",
        requiresVerification: true 
      });
    } catch (emailErr) {
      console.error("Login email failed:", emailErr);
      res.status(500).json({ message: "Could not send login email." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- FORGOT PASSWORD ---
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Security: Don't reveal if user exists or not
    if (!user) {
      return res.json({ message: "If an account exists with that email, a reset link has been sent." });
    }

    // Generate a token (ensure your generateToken uses a secret that expires)
    const resetToken = generateToken(user); 

    try {
      await sendResetEmail(user.email, resetToken);
      res.json({ message: "Reset link sent to your email." });
    } catch (emailErr) {
      console.error("Reset email failed:", emailErr);
      res.status(500).json({ message: "Error sending reset email." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- RESET PASSWORD (The actual update) ---
export const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.query; // Usually passed as ?token=XYZ

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // 1. Verify token & get user (using your specific middleware/jwt logic)
    // For now, assuming you've decoded the token to get the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    res.json({ message: "Password updated successfully. You can now login." });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired reset token." });
  }
};

// --- GET PROFILE ---
export const getProfile = async (req, res) => {
  try {
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

// ========== ADMIN USER MANAGEMENT FUNCTIONS ==========

// --- GET ALL USERS (Admin Only) ---
export const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// --- GET USER BY ID (Admin Only) ---
export const getUserById = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// --- DELETE USER (Admin Only) ---
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.userid) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};