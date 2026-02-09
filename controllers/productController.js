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
    const { name, description, price, category } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // 1. Manually find the category by name
    let categoryRecord = await prisma.category.findFirst({
      where: { name: category },
    });

    // 2. If it doesn't exist, create it WITH the required type
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          type: category, // Providing the 'type' that Prisma is asking for
        },
      });
    }

    // 3. Now create the product
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: Math.round(Number(price) * 100),
        imageUrl: req.file.path,
        type: category,
        category: {
          connect: { id: categoryRecord.id },
        },
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: error.message });
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
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: id },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
