import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// PUBLIC – wszystkie produkty
router.get("/", async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true }
  });
  res.json(products);
});

// PUBLIC – produkty wg kategorii
router.get("/category/:categoryId", async (req, res) => {
  const products = await prisma.product.findMany({
    where: { categoryId: Number(req.params.categoryId) },
    include: { category: true }
  });

  res.json(products);
});

// PUBLIC – szczegóły produktu
router.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include: { category: true }
  });

  res.json(product);
});

// ADMIN – dodanie produktu
router.post("/", auth, adminOnly, async (req, res) => {
  const product = await prisma.product.create({
    data: req.body
  });

  res.json(product);
});

// ADMIN – edycja produktu
router.put("/:id", auth, adminOnly, async (req, res) => {
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });

  res.json(product);
});

// ADMIN – usunięcie produktu
router.delete("/:id", auth, adminOnly, async (req, res) => {
  await prisma.product.delete({
    where: { id: Number(req.params.id) }
  });

  res.sendStatus(204);
});

export default router;
