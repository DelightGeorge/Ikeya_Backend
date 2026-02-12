import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,       // ✅ new
  updateOrderStatus, // ✅ new
} from "../controllers/orderController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// Customer routes
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

// Admin routes
router.get("/all", getAllOrders);             // ✅ GET /orders/all
router.patch("/:id/status", updateOrderStatus); // ✅ PATCH /orders/:id/status

export default router;
