import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@test.pl" }
  });

  if (existing) {
    console.log("Admin already exists");
    return;
  }

  const password = await bcrypt.hash("admin", 10);

  await prisma.user.create({
    data: {
      email: "admin@test.pl",
      password,
      role: "ADMIN"
    }
  });

  console.log("Admin created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
