import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { address, phone, paystackReference } = req.body;
    const userId = req.user.id; // ✅ FIXED: was req.user.userid (lowercase 'd')

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const deliveryFee = 250000; // ₦2,500 in kobo
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const totalAmount = subtotal + deliveryFee;

    const order = await prisma.order.create({
      data: {
        userId,                                       // ✅ FIXED
        totalAmount,
        address,
        phone,
        paystackReference: paystackReference || null, // ✅ store payment ref
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Empty the cart after order is created
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json(order);
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET USER ORDERS
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ FIXED: was req.user.userid

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
