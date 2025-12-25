import express from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controllers/cartController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router(); // ✅ parentheses are required

// All routes protected
router.use(authMiddleware);

// Get user cart
router.get("/", getCart);

// Add item to cart
router.post("/", addToCart);

router.patch("/:id", updateCartItem);  // <-- PATCH route must exist

// Remove item from cart
router.delete("/:id", removeCartItem);

export default router;
