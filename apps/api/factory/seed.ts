import prisma from "../src/lib/prisma";

async function main() {
  const permissions = [
 
    { code: "USER_MANAGE", name: "Manage Users" },
    { code: "ADMIN_MANAGE", name: "Manage Admin" },
    { code: "DEV_ADMIN", name:"Super Admin"},
    { code: "BOD_ADMIN", name: "Reports, Analytics and Agents"},
    { code: "BRANCH_MANAGE", name: "Branch Manager"},
    { code: "OPERATION_ADMIN", name: "Operation Manager"},
    { code: "REGULAR_USER", name: "Regular User"},

  ]

  

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p
    })
  }

  

  const adminPermissions = permissions
  .filter(p => p.code !== "REGULAR_USER")
  .map(p => p.code)

  const roles = [
    { name: "ADMIN", permissions: adminPermissions },

    { name: "DEV", permissions: adminPermissions },
    { name: "BOD_ADMIN", permissions: ["BOD_ADMIN"]},
    { name: "AGENT_ACC", permissions: ["REGULAR_USER"]},
    { name: "OPERATIONS", permissions: ["OPERATION_ADMIN"]},
    { name: "BRANCH_ACC", permissions: ["BRANCH_MANAGE"]}

  ]

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name }
    })

    for (const code of role.permissions) {
      const permission = await prisma.permission.findUnique({ where: { code } })

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: createdRole.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: createdRole.id,
            permissionId: permission.id
          }
        })
      }
    }
  }

  console.log("Roles & permissions seeded")
}

main()
