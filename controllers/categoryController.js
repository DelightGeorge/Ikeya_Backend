// controllers/categoryController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const addCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const category = await prisma.category.create({
      data: { name, type },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};
