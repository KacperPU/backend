import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", auth, async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  res.json(cart || { items: [] });
});

router.post("/add", auth, async (req, res) => {
  const { productId } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return res.status(404).json({ error: "Produkt nie istnieje" });
  }

  const cart = await prisma.cart.upsert({
    where: { userId: req.user.id },
    update: {},
    create: { userId: req.user.id },
  });

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    update: {
      quantity: { increment: 1 },
    },
    create: {
      cartId: cart.id,
      productId,
      quantity: 1,
    },
  });

  res.json({ success: true });
});

router.delete("/remove/:productId", auth, async (req, res) => {
  await prisma.cartItem.deleteMany({
    where: {
      cart: { userId: req.user.id },
      productId: Number(req.params.productId),
    },
  });

  res.sendStatus(204);
});

export default router;
