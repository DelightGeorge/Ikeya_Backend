import express from "express";
import { subscribe } from "../controllers/newsletterController.js";

const router = express.Router();

// POST /newsletter/subscribe — no auth required, anyone can subscribe
router.post("/subscribe", subscribe);

export default router;
