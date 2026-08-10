import express from "express";
import {
  getHeroImages,
  addHeroImage,
  deleteHeroImage,
  reorderHeroImage,
} from "../controllers/heroImageController.js";
import authMiddleware from "../middlewares/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Public - homepage slider reads these
router.get("/", getHeroImages);

// Admin only - auth is checked before the file ever reaches Cloudinary
router.post("/", authMiddleware, upload.single("image"), addHeroImage);
router.delete("/:id", authMiddleware, deleteHeroImage);
router.patch("/:id/reorder", authMiddleware, reorderHeroImage);

export default router;