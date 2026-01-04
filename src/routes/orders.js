import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// USER – dodanie zamówienia
router.post("/", auth, async (req, res) => {
  const { items, address } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Koszyk jest pusty" });
  }

  const total = items.reduce((sum, p) => sum + p.price, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      address,
      total,
      items: {
        create: items.map(p => ({
          productId: p.id,
          price: p.price
        }))
      }
    }
  });

  res.json(order);
});

// USER – moje zamówienia
router.get("/me", auth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });

  res.json(orders);
});

// ADMIN – wszystkie zamówienia
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Brak dostępu" });
  }

  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(orders);
});

export default router;
