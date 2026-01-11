import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("admin", 10);
  const userPass = await bcrypt.hash("user", 10);

  // ADMIN
  await prisma.user.upsert({
    where: { email: "admin@test.pl" },
    update: {},
    create: {
      email: "admin@test.pl",
      password: adminPass,
      role: "ADMIN",
      street: "Admin",
      houseNumber: "1",
      postalCode: "00-000",
      city: "Warszawa",
    },
  });

  // USER
  await prisma.user.upsert({
    where: { email: "user@test.pl" },
    update: {},
    create: {
      email: "user@test.pl",
      password: userPass,
      role: "USER",
      street: "Testowa",
      houseNumber: "10",
      postalCode: "00-001",
      city: "Warszawa",
    },
  });

  // CATEGORIES
  await prisma.category.createMany({
    data: [
      { name: "Zaproszenia ślubne", active: true },
      { name: "Winietki", active: true },
      { name: "Podziękowania", active: true },
    ],
    skipDuplicates: true,
  });

  // DELIVERY
  await prisma.deliveryOption.createMany({
    data: [
      {
        code: "KURIER_COD",
        name: "Kurier – dostawa do domu (płatność przy odbiorze)",
        price: 30,
        active: true,
      },
    ],
    skipDuplicates: true,
  });

  // PAYMENT
  await prisma.paymentMethod.createMany({
    data: [
      {
        code: "COD",
        name: "Płatność przy odbiorze",
        active: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ SEED OK");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
