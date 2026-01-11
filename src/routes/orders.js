import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// CREATE ORDER
router.post("/", auth, async (req, res) => {
  const { deliveryOptionId, paymentMethodId } = req.body;

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: "Koszyk pusty" });
  }

  const delivery = await prisma.deliveryOption.findUnique({
    where: { id: deliveryOptionId },
  });

  const payment = await prisma.paymentMethod.findUnique({
    where: { id: paymentMethodId },
  });

  if (!delivery || !delivery.active) {
    return res.status(400).json({ error: "Nieprawidłowa dostawa" });
  }

  if (!payment || !payment.active) {
    return res.status(400).json({ error: "Nieprawidłowa płatność" });
  }

  const productsTotal = cart.items.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0
  );

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  const address = `${user.street} ${user.houseNumber}${
    user.apartment ? "/" + user.apartment : ""
  }, ${user.postalCode} ${user.city}`;

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      address,
      deliveryOptionId: delivery.id,
      deliveryPrice: delivery.price,
      paymentMethodId: payment.id,
      total: productsTotal + delivery.price,
      items: {
        create: cart.items.map((i) => ({
          productId: i.productId,
          price: i.product.price,
          quantity: i.quantity,
        })),
      },
    },
  });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  res.json(order);
});

// USER – MY ORDERS
router.get("/my", auth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: {
      items: { include: { product: true } },
      deliveryOption: true,
      paymentMethod: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
});

// ADMIN – ALL
router.get("/", auth, adminOnly, async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true } },
      items: { include: { product: true } },
      deliveryOption: true,
      paymentMethod: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
});

// ADMIN – zmiana statusu zamówienia
router.put("/:id/status", auth, adminOnly, async (req, res) => {
  const { status } = req.body;

  const allowedStatuses = [
    "NOWE",
    "REALIZACJA",
    "WYSLANE",
    "SKONCZONE",
    "ANULOWANE",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Nieprawidłowy status" });
  }

  const order = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: { status },
  });

  res.json(order);
});

// USER – anulowanie zamówienia
router.patch("/:id/cancel", auth, async (req, res) => {
  const orderId = Number(req.params.id);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return res.status(404).json({ error: "Zamówienie nie istnieje" });
  }

  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: "Brak uprawnień" });
  }

  if (order.status !== "NOWE") {
    return res
      .status(400)
      .json({ error: "Nie można anulować tego zamówienia" });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "ANULOWANE" },
  });

  res.json(updated);
});

export default router;
