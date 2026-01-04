import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// PUBLIC – lista kategorii
router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

// ADMIN – dodanie kategorii
router.post("/", auth, adminOnly, async (req, res) => {
  const { name } = req.body;

  const category = await prisma.category.create({
    data: { name }
  });

  res.json(category);
});

// ADMIN – edycja kategorii
router.put("/:id", auth, adminOnly, async (req, res) => {
  const category = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });

  res.json(category);
});

// ADMIN – usunięcie kategorii
router.delete("/:id", auth, adminOnly, async (req, res) => {
  await prisma.category.delete({
    where: { id: Number(req.params.id) }
  });

  res.sendStatus(204);
});

export default router;
