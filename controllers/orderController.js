import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { address, phone } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userid },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: req.user.userid,
        totalAmount,
        address,
        phone,
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

    // Empty the cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET USER ORDERS
export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userid },
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
