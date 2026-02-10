import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET USER CART
export const getCart = async (req, res) => {
  try {
    console.log("📦 [GET CART] User ID:", req.user?.userid);
    
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userid },
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
    console.error("❌ [GET CART ERROR]:", err);
    res.status(500).json({ message: err.message });
  }
};

// ADD ITEM TO CART
export const addToCart = async (req, res) => {
  try {
    console.log("🛒 [ADD TO CART] Starting...");
    console.log("🛒 [ADD TO CART] req.body:", req.body);
    console.log("🛒 [ADD TO CART] req.user:", req.user);
    
    const { productId, quantity } = req.body;

    // Log what we received
    console.log("🛒 [ADD TO CART] Parsed - productId:", productId, "quantity:", quantity);

    // Find or create cart
    console.log("🛒 [ADD TO CART] Looking for cart with userId:", req.user.userid);
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.userid } });
    
    if (!cart) {
      console.log("🛒 [ADD TO CART] No cart found, creating new cart...");
      cart = await prisma.cart.create({ data: { userId: req.user.userid } });
      console.log("🛒 [ADD TO CART] Cart created with ID:", cart.id);
    } else {
      console.log("🛒 [ADD TO CART] Cart found with ID:", cart.id);
    }

    // Check for existing item
    console.log("🛒 [ADD TO CART] Checking for existing cart item...");
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      console.log("🛒 [ADD TO CART] Item exists, updating quantity...");
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
      console.log("✅ [ADD TO CART] Updated successfully");
      return res.json(updated);
    }

    // Create new item
    console.log("🛒 [ADD TO CART] Creating new cart item...");
    console.log("🛒 [ADD TO CART] Data:", { cartId: cart.id, productId, quantity });
    
    const item = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
      include: { product: true },
    });

    console.log("✅ [ADD TO CART] Created successfully:", item);
    res.status(201).json(item);
    
  } catch (err) {
    console.error("❌ [ADD TO CART ERROR]:");
    console.error("Error message:", err.message);
    console.error("Error name:", err.name);
    console.error("Full error:", err);
    console.error("Stack trace:", err.stack);
    
    res.status(500).json({ 
      message: err.message,
      name: err.name,
      details: String(err)
    });
  }
};

// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    console.log("📝 [UPDATE CART] Item ID:", id, "New quantity:", quantity);

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });

    console.log("✅ [UPDATE CART] Updated successfully");
    res.json(updatedItem);
  } catch (err) {
    console.error("❌ [UPDATE CART ERROR]:", err);
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
    console.error("❌ [REMOVE CART ERROR]:", err);
    res.status(500).json({ message: err.message });
  }
};
