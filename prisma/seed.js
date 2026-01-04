import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

  // ADMIN
  const adminEmail = "admin@test.pl";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash("admin", 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminPassword,
        role: "ADMIN"
      }
    });

    console.log("Admin created");
  } else {
    console.log("Admin already exists");
  }

  // USER
  const userEmail = "user@test.pl";

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (!existingUser) {
    const userPassword = await bcrypt.hash("user", 10);

    await prisma.user.create({
      data: {
        email: userEmail,
        password: userPassword,
        role: "USER"
      }
    });

    console.log("User created");
  } else {
    console.log("User already exists");
  }
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
