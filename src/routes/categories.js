import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// PUBLIC – lista kategorii
router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    where: {
      active: true,
      products: {
        some: {
          active: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  res.json(categories);
});

// ADMIN – lista kategorii
router.get("/admin", auth, adminOnly, async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

// ADMIN – dodanie kategorii
router.post("/", auth, adminOnly, async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({
    data: { name },
  });
  res.json(category);
});

// ADMIN – edycja kategorii
router.put("/:id", auth, adminOnly, async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 3) {
    return res.status(400).json({ error: "Nazwa za krótka" });
  }
  const category = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: { name },
  });

  res.json(category);
});

// ADMIN – usunięcie kategorii
router.patch("/:id/active", auth, adminOnly, async (req, res) => {
  const { active } = req.body;

  const category = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: { active },
  });

  res.json(category);
});

export default router;
