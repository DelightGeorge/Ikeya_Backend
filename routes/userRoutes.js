import express from "express";
import { registerUser, loginUser, getProfile, forgotPassword, resetPassword } from "../controllers/userController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected
router.get("/profile", authMiddleware, getProfile);
// Add this line
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword); // Added this line

export default router;
