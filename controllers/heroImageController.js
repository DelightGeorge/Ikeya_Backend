import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// PUBLIC: get all hero images, in slider order
export const getHeroImages = async (req, res) => {
  try {
    const images = await prisma.heroImage.findMany({
      orderBy: { order: "asc" },
    });
    res.json(images);
  } catch (err) {
    console.error("Get Hero Images Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: upload a new hero image, added to the end of the slider
export const addHeroImage = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const last = await prisma.heroImage.findFirst({
      orderBy: { order: "desc" },
    });
    const nextOrder = last ? last.order + 1 : 0;

    const image = await prisma.heroImage.create({
      data: { imageUrl: req.file.path, order: nextOrder },
    });

    res.status(201).json(image);
  } catch (err) {
    console.error("Add Hero Image Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: remove a hero image from the slider
export const deleteHeroImage = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params;
    const image = await prisma.heroImage.findUnique({ where: { id } });
    if (!image) {
      return res.status(404).json({ message: "Hero image not found" });
    }

    await prisma.heroImage.delete({ where: { id } });
    res.json({ success: true, message: "Hero image deleted" });
  } catch (err) {
    console.error("Delete Hero Image Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: move an image one position up or down in the slider order
export const reorderHeroImage = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params;
    const { direction } = req.body; // "up" | "down"

    const current = await prisma.heroImage.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ message: "Hero image not found" });
    }

    const neighbor = await prisma.heroImage.findFirst({
      where:
        direction === "up"
          ? { order: { lt: current.order } }
          : { order: { gt: current.order } },
      orderBy: { order: direction === "up" ? "desc" : "asc" },
    });

    if (!neighbor) {
      return res.json({ success: true, message: "Already at the edge" });
    }

    await prisma.$transaction([
      prisma.heroImage.update({ where: { id: current.id }, data: { order: neighbor.order } }),
      prisma.heroImage.update({ where: { id: neighbor.id }, data: { order: current.order } }),
    ]);

    res.json({ success: true, message: "Reordered" });
  } catch (err) {
    console.error("Reorder Hero Image Error:", err);
    res.status(500).json({ message: err.message });
  }
};