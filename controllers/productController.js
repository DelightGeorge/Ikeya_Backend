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

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// Admin: Add a product
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, type } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

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

    // 🔹 validate price
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parsedPrice, // ✅ store price as-is (₦)
        imageUrl: req.file.path,
        type,
        categoryId: categoryRecord.id,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Add this to your productController.js
export const getRecentProducts = async (req, res) => {
  try {
    const recentProducts = await prisma.product.findMany({
      take: 5, // Get the latest 5 products
      orderBy: {
        createdAt: "desc", // Uses the creatAt field from your schema
      },
      include: {
        category: true, // Include category details if needed
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

export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
