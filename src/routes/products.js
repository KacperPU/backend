import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, adminOnly } from "../middleware/auth.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// PUBLIC – wszystkie produkty
router.get("/", async (req, res) => {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
  });
  res.json(products);
});

// ADMIN – wszystkie produkty (aktywne + nieaktywne)
router.get("/admin", auth, adminOnly, async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { id: "desc" },
  });

  res.json(products);
});

// PUBLIC – bestseller
router.get("/bestsellers", async (req, res) => {
  const stats = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 6,
  });

  const products = await prisma.product.findMany({
    where: {
      id: { in: stats.map((s) => s.productId) },
      active: true,
    },
  });

  const mapped = products.map((p) => {
    const stat = stats.find((s) => s.productId === p.id);
    return {
      ...p,
      sold: stat?._sum.quantity || 0,
    };
  });

  res.json(mapped);
});

router.get("/new", async (req, res) => {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  res.json(products);
});

// PUBLIC – produkty wg kategorii
router.get("/category/:categoryId", async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      categoryId: Number(req.params.categoryId),
      active: true,
    },
    include: { category: true },
  });

  res.json(products);
});

// PUBLIC – szczegóły produktu
router.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: {
      id: Number(req.params.id),
      active: true,
    },
    include: { category: true },
  });

  res.json(product);
});

// ADMIN – dodanie produktu
router.post("/", auth, adminOnly, upload.single("image"), async (req, res) => {
  const { name, description, price, categoryId } = req.body;
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: Number(price),
      categoryId: Number(categoryId),
      image: req.file ? `/uploads/${req.file.filename}` : null,
    },
  });
  res.json(product);
});

// ADMIN – edycja produktu
router.put(
  "/:id",
  auth,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    const { name, description, price, categoryId } = req.body;
    const existing = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Produkt nie istnieje" });
    }
    const data = {
      name,
      description,
      price: Number(price),
      categoryId: Number(categoryId),
    };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
      if (existing.image) {
        const oldPath = path.join(process.cwd(), existing.image);
        fs.unlink(oldPath, (err) => {
          if (err) {
            console.warn("Nie udało się usunąć starego zdjęcia:", oldPath);
          }
        });
      }
    }
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data,
    });

    res.json(product);
  }
);

// ADMIN – aktywacja / dezaktywacja produktu
router.patch("/:id/active", auth, adminOnly, async (req, res) => {
  const { active } = req.body;

  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: { active },
  });

  res.json(product);
});

export default router;
