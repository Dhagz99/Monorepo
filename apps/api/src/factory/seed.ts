import "dotenv/config";
import { prisma } from "../config/prismaClient";
import bcrypt from "bcryptjs";

async function main() {
  console.log("DB:", process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL missing");
  }

  const permissions = [
    { code: "USER_MANAGE", name: "Manage Users" },
    { code: "ADMIN_MANAGE", name: "Manage Admin" },
    { code: "PAYROLL_RUN", name: "Run Payroll" },
    { code: "BONUS_APPROVE", name: "Approve Bonus" },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  const roles = [
    { name: "ADMIN", permissions: permissions.map(p => p.code) },
    { name: "APPROVER", permissions: ["BONUS_APPROVE"] },
  ];

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name },
    });

    for (const code of role.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { code },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: createdRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: createdRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "System Admin",
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
    },
  });

  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    });
  }

  console.log("✅ Seed completed");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });