import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

//  PUBLIC – tylko aktywne (checkout)
router.get("/", async (req, res) => {
  const methods = await prisma.paymentMethod.findMany({
    where: { active: true },
    orderBy: { id: "asc" },
  });
  res.json(methods);
});

// ADMIN – wszystkie
router.get("/admin", auth, adminOnly, async (req, res) => {
  const methods = await prisma.paymentMethod.findMany({
    orderBy: { id: "asc" },
  });
  res.json(methods);
});

// ADMIN – aktywacja / dezaktywacja
router.patch("/:id/active", auth, adminOnly, async (req, res) => {
  const { active } = req.body;

  const method = await prisma.paymentMethod.update({
    where: { id: Number(req.params.id) },
    data: { active },
  });

  res.json(method);
});

// ADMIN – dodanie
router.post("/", auth, adminOnly, async (req, res) => {
  const { code, name } = req.body;

  const method = await prisma.paymentMethod.create({
    data: { code, name },
  });

  res.json(method);
});

// ADMIN – edycja
router.put("/:id", auth, adminOnly, async (req, res) => {
  const { name } = req.body;

  const method = await prisma.paymentMethod.update({
    where: { id: Number(req.params.id) },
    data: { name },
  });

  res.json(method);
});

export default router;
