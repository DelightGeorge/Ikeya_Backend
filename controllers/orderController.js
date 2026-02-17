import { PrismaClient } from "@prisma/client";
import {
  sendOrderReceiptEmail,
  sendAdminOrderAlertEmail,
} from "../utils/emailVerification.js";

const prisma = new PrismaClient();

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────

export const createOrder = async (req, res) => {
  try {
    const {
      address,
      phone,
      paystackReference,
      // ── New fields from updated Checkout ──
      alternatePhone,
      name,
      email,
      companyName,
      deliveryNote,
      deliveryArea,
      deliveryState,
      deliveryFee: clientDeliveryFee,
    } = req.body;

    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // ── Calculate totals ──
    // Use the delivery fee sent from the frontend (location-based).
    // Fall back to 250000 kobo (₦2,500) if somehow missing.
    const deliveryFee = clientDeliveryFee && clientDeliveryFee > 0
      ? clientDeliveryFee
      : 250000;

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const totalAmount = subtotal + deliveryFee;

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        address,
        phone,
        paystackReference: paystackReference || null,
        // ── New fields ──
        alternatePhone:  alternatePhone  || null,
        companyName:     companyName     || null,
        deliveryNote:    deliveryNote    || null,
        deliveryArea:    deliveryArea    || null,
        deliveryState:   deliveryState   || null,
        deliveryFee:     deliveryFee,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            price:     item.product.price,
            quantity:  item.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true } },
      },
    });

    // ── Clear cart ──
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // ── Send emails (non-blocking) ──
    const customerEmail = email || order.user.email;
    const customerName  = name  || order.user.name;

    sendOrderReceiptEmail({
      email: customerEmail,
      name:  customerName,
      order,
    }).catch((err) => console.error("Receipt email failed:", err));

    sendAdminOrderAlertEmail({
      order,
      customerName,
      customerEmail,
    }).catch((err) => console.error("Admin alert email failed:", err));

    res.status(201).json(order);
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET USER ORDERS ──────────────────────────────────────────────────────────

export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where:   { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────

export const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where:   { id: req.params.id },
      include: { items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL ORDERS — Admin only ─────────────────────────────────────────────

export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const orders = await prisma.order.findMany({
      include: {
        user:  { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    console.error("getAllOrders error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── UPDATE ORDER STATUS — Admin only ────────────────────────────────────────

export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await prisma.order.update({
      where:  { id },
      data:   { status },
      include: {
        user:  { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });
    res.json(order);
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};