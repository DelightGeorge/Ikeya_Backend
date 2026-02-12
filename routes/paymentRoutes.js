import express from "express";
import { initializePayment, verifyPayment } from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// Only logged-in users can pay
router.use(authMiddleware);

router.post("/initialize", initializePayment);
router.get("/verify/:reference", verifyPayment);

export default router;
