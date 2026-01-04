import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import userRoutes from "./routes/user.js";
import orderRoutes from "./routes/orders.js";
import { auth, adminOnly } from "./middleware/auth.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://backend-cikf.onrender.com",
    "https://papiernia.vercel.app/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Backend działa");
});

app.get("/admin-test", auth, adminOnly, (req, res) => {
  res.send("ADMIN OK");
});

app.get("/test-db", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Błąd połączenia z bazą" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server działa na porcie ${PORT}`);
});
