import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

// GET ALL PRODUCTS BY TYPE (FASHION or BEAUTY)
export const getProductsByType = async (req, res) => {
  try {
    const { type } = req.params; // expects "FASHION" or "BEAUTY"

    const products = await prisma.product.findMany({
      where: { type },
      include: { category: true },
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products with optional search
export const getProducts = async (req, res) => {
  try {
    const { search } = req.query;

    // Build filter conditions
    const whereCondition = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
              category: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where: whereCondition,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// Admin: Add a product
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, type } = req.body;

    // Only admins
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    // Image check
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    // ✅ Parse price and validate
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ message: "Invalid price" });
    }

    // Check or create category
    let categoryRecord = await prisma.category.findFirst({
      where: { name: category },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          type: type,
        },
      });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Math.round(parsedPrice * 100), // store in kobo if NGN
        imageUrl: req.file.path, // multer/cloudinary path
        type,
        categoryId: categoryRecord.id,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get recent products
export const getRecentProducts = async (req, res) => {
  try {
    const recentProducts = await prisma.product.findMany({
      take: 5, // Get the latest 5 products
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
    });

    res.status(200).json({
      success: true,
      data: recentProducts,
    });
  } catch (error) {
    console.error("Error fetching recent products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete in the correct order to avoid foreign key constraints
    // 1. Delete all order items that reference this product
    await prisma.orderItem.deleteMany({
      where: { productId: id },
    });

    // 2. Delete all cart items that reference this product
    await prisma.cartItem.deleteMany({
      where: { productId: id },
    });

    // 3. Finally, delete the product itself
    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({ 
      message: "Product deleted successfully",
      success: true 
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ 
      message: error.message || "Failed to delete product",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};