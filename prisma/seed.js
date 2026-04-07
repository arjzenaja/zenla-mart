const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@zenlamart.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@zenlamart.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    },
  });

  console.log("Admin user seeded:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
