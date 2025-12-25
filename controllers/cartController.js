import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET USER CART
export const getCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userid }, // Ensure this matches your JWT payload key
      include: { 
        items: { include: { product: true } } 
      },
    });

    // CRITICAL: Return the ITEMS array, or an empty array if no cart exists
    if (!cart) return res.json([]);
    res.json(cart.items); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD ITEM TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.userid } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.userid } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      return res.json(updated);
    }

    const item = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
      include: { product: true },
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REMOVE ITEM FROM CART
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.cartItem.delete({ where: { id } });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
