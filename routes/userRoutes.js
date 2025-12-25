import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/userController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected
router.get("/profile", authMiddleware, getProfile);

export default router;
