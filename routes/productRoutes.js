import express from "express";
import {
  getProducts,
  getProductById,
  addProduct,
  getRecentProducts,
  getProductsByType,
  deleteProduct,
} from "../controllers/productController.js";
import authMiddleware from "../middlewares/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// GET routes - search will work via query params
router.get("/", getProducts); // This now handles ?search=query
router.get("/recentProducts", getRecentProducts);
router.get("/type/:type", getProductsByType);
router.get("/:id", getProductById);

// POST routes
router.post(
  "/add",
  upload.single("image"),
  authMiddleware,
  addProduct
);

// DELETE routes
router.delete("/:id", authMiddleware, deleteProduct);

export default router;