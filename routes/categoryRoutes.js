// routes/categoryRoutes.js
import express from "express";

import authMiddleware from "../middlewares/auth.js";
import { addCategory, getCategories } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", authMiddleware, addCategory); // optional: only admin

export default router;
