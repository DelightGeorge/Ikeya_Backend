import express from "express";
import { createOrder, getOrders, getOrderById } from "../controllers/orderController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// All routes protected
router.use(authMiddleware);

// Create a new order
router.post("/", createOrder);

// Get all orders for the logged-in user
router.get("/", getOrders);

// Get a single order by ID
router.get("/:id", getOrderById);

export default router;