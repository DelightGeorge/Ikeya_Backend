import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// ✅ IMPORTANT: Specific routes MUST come before wildcard /:id routes
// otherwise Express matches "all" as an id parameter and returns 404

router.post("/", createOrder);               // POST   /orders
router.get("/", getOrders);                  // GET    /orders          (user's own orders)
router.get("/all", getAllOrders);             // GET    /orders/all      ✅ must be before /:id
router.patch("/:id/status", updateOrderStatus); // PATCH  /orders/:id/status
router.get("/:id", getOrderById);            // GET    /orders/:id      ✅ must be last

export default router;