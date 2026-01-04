import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middleware/auth.js";
import { adminOnly } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", auth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Koszyk jest pusty"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const addressString =
      `${user.street} ${user.houseNumber}` +
      `${user.apartment ? "/" + user.apartment : ""}, ` +
      `${user.postalCode} ${user.city}`;

    if (
      !user.street ||
      !user.houseNumber ||
      !user.postalCode ||
      !user.city
    ) {
      return res.status(400).json({
        error: "Uzupełnij pełny adres w profilu przed złożeniem zamówienia"
      });
    }

    const total = items.reduce((sum, i) => sum + i.price, 0);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        address: addressString,
        total,
        status: "NOWE",
        items: {
          create: items.map(i => ({
            productId: i.productId,
            price: i.price
          }))
        }
      }
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Nie udało się utworzyć zamówienia"
    });
  }
});

router.put("/:id/status", auth, adminOnly, async (req, res) => {
  const { status } = req.body;

  const allowed = [
    "NOWE",
    "REALIZACJA",
    "WYSLANE",
    "SKONCZONE",
    "ANULOWANE"
  ];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Nieprawidłowy status" });
  }

  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) }
  });

  if (!order) {
    return res.status(404).json({
      error: "Zamówienie nie istnieje"
    });
  }

  const updated = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: { status }
  });

  res.json(updated);
});

router.get("/", auth, adminOnly, async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true } },
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(orders);
});


router.get("/my", auth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      error: "Nie udało się pobrać zamówień"
    });
  }
});

export default router;
