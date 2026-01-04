import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET – moje dane
router.get("/me", auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      email: true,
      role: true,
      street: true,
      houseNumber: true,
      apartment: true,
      postalCode: true,
      city: true
    }
  });

  res.json(user);
});

// PUT – aktualizacja adresu
router.put("/me", auth, async (req, res) => {
  const {
    street,
    houseNumber,
    apartment,
    postalCode,
    city
  } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      street,
      houseNumber,
      apartment,
      postalCode,
      city
    }
  });

  res.json(user);
});

// DELETE – usuń konto
router.delete("/me", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie istnieje" });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({
        error: "Nie można usunąć konta administratora"
      });
    }
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      select: { id: true }
    });

    const orderIds = orders.map(o => o.id);
    if (orderIds.length > 0) {
      await prisma.orderItem.deleteMany({
        where: {
          orderId: { in: orderIds }
        }
      });
      await prisma.order.deleteMany({
        where: {
          id: { in: orderIds }
        }
      });
    }
    await prisma.user.delete({
      where: { id: user.id }
    });

    res.json({ message: "Konto zostało usunięte" });
  } catch (err) {
    console.error("DELETE /user/me error:", err);
    res.status(500).json({
      error: "Błąd podczas usuwania konta"
    });
  }
});


export default router;
