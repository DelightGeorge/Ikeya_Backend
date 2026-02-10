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

router.get("/", getProducts);
router.get("/recentProducts", getRecentProducts);
router.get("/type/:type", getProductsByType);
router.get("/:id", getProductById);

// 🔥 FIXED ORDER (multer FIRST, auth SECOND)
router.post(
  "/add",
  upload.single("image"),
  authMiddleware,
  addProduct
);

router.delete("/:id", authMiddleware, deleteProduct);

export default router;
