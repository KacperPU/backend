import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// PUBLIC – tylko aktywne (do checkoutu)
router.get("/", async (req, res) => {
  const options = await prisma.deliveryOption.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  });
  res.json(options);
});

// ADMIN – wszystkie (zarządzanie)
router.get("/admin", auth, adminOnly, async (req, res) => {
  const options = await prisma.deliveryOption.findMany({
    orderBy: { id: "asc" },
  });
  res.json(options);
});

// ADMIN – aktywacja / dezaktywacja
router.patch("/:id/active", auth, adminOnly, async (req, res) => {
  const { active } = req.body;

  const option = await prisma.deliveryOption.update({
    where: { id: Number(req.params.id) },
    data: { active },
  });

  res.json(option);
});

// ADMIN – dodanie
router.post("/", auth, adminOnly, async (req, res) => {
  const { code, name, price } = req.body;

  const option = await prisma.deliveryOption.create({
    data: {
      code,
      name,
      price: Number(price),
    },
  });

  res.json(option);
});

// ADMIN – edycja
router.put("/:id", auth, adminOnly, async (req, res) => {
  const { name, price } = req.body;

  const option = await prisma.deliveryOption.update({
    where: { id: Number(req.params.id) },
    data: { name, price: Number(price) },
  });

  res.json(option);
});

export default router;
