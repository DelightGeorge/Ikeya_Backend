import express from "express";
import { 
  getProductById, 
  getProducts, 
  addProduct, 
  getRecentProducts, 
  deleteProduct
} from "../controllers/productController.js";
import authMiddleware from "../middlewares/auth.js";
import { upload } from "../config/cloudinary.js";


const router = express.Router();

// MUST be in this order
router.get("/", getProducts);
router.get("/recentProducts", getRecentProducts); // This must be ABOVE /:id
router.get("/:id", getProductById);

// --- 2. ADMIN ROUTES ---
// Try this order in productRoutes.js
router.post("/add", upload.single("image"), authMiddleware, addProduct);

// Add this near your other routes
router.delete("/:id", authMiddleware, deleteProduct);
export default router;