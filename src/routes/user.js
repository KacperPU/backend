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
      address: true,
      role: true
    }
  });

  res.json(user);
});

// PUT – aktualizacja adresu
router.put("/me", auth, async (req, res) => {
  const { address } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { address }
  });

  res.json(user);
});

export default router;
