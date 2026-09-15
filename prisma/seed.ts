import { PrismaClient } from "@prisma/client";
import { runSeed } from "../src/lib/seedData";

const prisma = new PrismaClient();

runSeed(prisma)
  .then(({ coordinatorEmails }) => {
    console.log("Seed complete.");
    console.log("Login: admin@maavarim.org.il / manager@maavarim.org.il / " + coordinatorEmails.join(", "));
    console.log("Password for all: Maavarim2026!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
