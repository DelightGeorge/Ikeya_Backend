import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Helper function to get user ID from JWT (handles different field names)
const getUserId = (user) => {
  // Try different possible field names
  return user?.userid || user?.userId || user?.id || user?.sub;
};

// GET USER CART
export const getCart = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("📦 [GET CART] User ID:", userId);

    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { 
        items: { include: { product: true } } 
      },
    });

    if (!cart) {
      console.log("📦 [GET CART] No cart found");
      return res.json([]);
    }
    
    console.log("📦 [GET CART] Found", cart.items.length, "items");
    res.json(cart.items); 
  } catch (err) {
    console.error("❌ [GET CART ERROR]:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ADD ITEM TO CART
export const addToCart = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    
    if (!userId) {
      console.error("❌ [ADD TO CART] No user ID found in token");
      console.error("req.user contents:", req.user);
      return res.status(401).json({ 
        message: "User not authenticated",
        debug: "No user ID found in JWT token"
      });
    }

    console.log("🛒 [ADD TO CART] User ID:", userId);
    console.log("🛒 [ADD TO CART] Request:", req.body);

    const { productId, quantity } = req.body;

    // Find or create cart
    let cart = await prisma.cart.findUnique({ 
      where: { userId: userId } 
    });
    
    if (!cart) {
      console.log("🛒 [ADD TO CART] Creating new cart...");
      cart = await prisma.cart.create({ 
        data: { userId: userId } 
      });
      console.log("🛒 [ADD TO CART] Cart created:", cart.id);
    } else {
      console.log("🛒 [ADD TO CART] Cart found:", cart.id);
    }

    // Check for existing item
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      console.log("🛒 [ADD TO CART] Updating existing item");
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
      console.log("✅ [ADD TO CART] Updated successfully");
      return res.json(updated);
    }

    // Create new item
    console.log("🛒 [ADD TO CART] Creating new cart item");
    const item = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
      include: { product: true },
    });

    console.log("✅ [ADD TO CART] Created successfully");
    res.status(201).json(item);
    
  } catch (err) {
    console.error("❌ [ADD TO CART ERROR]:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ 
      message: err.message,
      error: "Failed to add item to cart"
    });
  }
};

// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    console.log("📝 [UPDATE CART] Item ID:", id, "Quantity:", quantity);

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });

    console.log("✅ [UPDATE CART] Updated successfully");
    res.json(updatedItem);
  } catch (err) {
    console.error("❌ [UPDATE CART ERROR]:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// REMOVE ITEM FROM CART
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ [REMOVE CART] Item ID:", id);

    await prisma.cartItem.delete({ where: { id } });
    
    console.log("✅ [REMOVE CART] Removed successfully");
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("❌ [REMOVE CART ERROR]:", err.message);
    res.status(500).json({ message: err.message });
  }
};
