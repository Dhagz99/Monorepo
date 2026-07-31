import prisma from "../src/lib/prisma";

async function main() {
  const permissions = [
    // Dashboard / system
    { code: "DASHBOARD_ACCESS", name: "Access Dashboard" },

    // Agents
    { code: "AGENT_VIEW", name: "View Agents" },
    { code: "AGENT_CREATE", name: "Create Agents" },
    { code: "AGENT_UPDATE", name: "Update Agents" },

    // Reactivation
    { code: "REACTIVATION_VIEW", name: "View Reactivation Requests" },
    { code: "REACTIVATION_APPROVE", name: "Approve Reactivation Requests" },

    // Reassignment
    { code: "REASSIGNMENT_VIEW", name: "View Agent Reassignment" },
    { code: "REASSIGNMENT_MANAGE", name: "Manage Agent Reassignment" },

    // Transactions
    { code: "TRANSACTION_VIEW", name: "View E-wallet Transactions" },
    { code: "WITHDRAWAL_APPROVE", name: "Approve Withdrawals" },
    { code: "WITHDRAWAL_RETRY", name: "Retry Withdrawals" },
    { code: "WITHDRAWAL_REJECT", name: "Reject Withdrawals" },

    // Reports
    { code: "REPORT_VIEW", name: "View Reports and Analytics" },

    // Branch
    { code: "BRANCH_VIEW", name: "View Branches" },
    { code: "BRANCH_MANAGE", name: "Manage Branches" },

    // Admin / users
    { code: "USER_MANAGE", name: "Manage Users" },
    { code: "ADMIN_MANAGE", name: "Manage Admins" },

    // Agent profile only
    { code: "PROFILE_ACCESS", name: "Access Agent Profile" },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        name: permission.name,
      },
      create: permission,
    });
  }

  const adminPermissions = permissions
    .filter((permission) => permission.code !== "PROFILE_ACCESS")
    .map((permission) => permission.code);

  const roles = [
    {
      name: "ADMIN",
      permissions: adminPermissions,
    },
    {
      name: "DEV",
      permissions: permissions.map((permission) => permission.code),
    },
    {
      name: "BOD_ADMIN",
      permissions: [
        "DASHBOARD_ACCESS",
        "REPORT_VIEW",
        "AGENT_VIEW",
        "TRANSACTION_VIEW",
      ],
    },
    {
      name: "OPERATIONS",
      permissions: [
        "ADMIN_MANAGE",
        "DASHBOARD_ACCESS",
        "AGENT_VIEW",
        "REACTIVATION_VIEW",
        "REACTIVATION_APPROVE",
        "REASSIGNMENT_VIEW",
        "REASSIGNMENT_MANAGE",
        "TRANSACTION_VIEW",
        "WITHDRAWAL_APPROVE",
        "WITHDRAWAL_RETRY",
        "WITHDRAWAL_REJECT",
        "REPORT_VIEW",
      ],
    },
    {
      name: "BRANCH_ACC",
      permissions: [
        "DASHBOARD_ACCESS",
        "AGENT_VIEW",
        "AGENT_CREATE",
        "AGENT_UPDATE",
        "TRANSACTION_VIEW",
        "BRANCH_VIEW",
      ],
    },
    {
      name: "AGENT_ACC",
      permissions: ["PROFILE_ACCESS"],
    },
  ];

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {},
      create: {
        name: role.name,
      },
    });

    for (const code of role.permissions) {
      const permission = await prisma.permission.findUnique({
        where: {
          code,
        },
      });

      if (!permission) continue;

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

  console.log("Roles and permissions seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });