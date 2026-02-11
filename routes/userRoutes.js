import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// ========== PUBLIC ROUTES ==========
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ========== PROTECTED ROUTES ==========
router.get("/profile", authMiddleware, getProfile);

// ========== ADMIN ROUTES ==========
router.get("/users", authMiddleware, getAllUsers);
router.get("/users/:id", authMiddleware, getUserById);
router.put("/users/:id/role", authMiddleware, updateUserRole);
router.delete("/users/:id", authMiddleware, deleteUser);

export default router;