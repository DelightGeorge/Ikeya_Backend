import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

// GET ALL PRODUCTS BY TYPE (FASHION or BEAUTY)
export const getProductsByType = async (req, res) => {
  try {
    const { type } = req.params;
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
    const whereCondition = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { category: { name: { contains: search, mode: "insensitive" } } },
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

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ message: "Invalid price" });
    }

    let categoryRecord = await prisma.category.findFirst({
      where: { name: category },
    });
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { name: category, type: type },
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Math.round(parsedPrice * 100),
        imageUrl: req.file.path,
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

// ✅ FIXED: Removed `take: 5` — now returns ALL products
export const getRecentProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    res.status(200).json({ message: "Product deleted successfully", success: true });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      message: error.message || "Failed to delete product",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Update product stock
export const updateStock = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({ message: "Stock value is required", received: stock });
    }

    const stockNum = Number(stock);
    if (isNaN(stockNum)) {
      return res.status(400).json({ message: "Stock must be a number", received: stock });
    }
    if (stockNum < 0) {
      return res.status(400).json({ message: "Stock cannot be negative", received: stockNum });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { stock: stockNum },
    });

    res.json({ success: true, message: "Stock updated", product });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({ message: error.message });
  }
};
