import prisma from "../../lib/prisma";

export const getPermissionManagementService = async () => {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      orderBy: { name: "asc" },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    }),

    prisma.permission.findMany({
      orderBy: { id: "asc" },
    }),
  ]);

  return {
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map((rp) => rp.permission),
    })),
    permissions,
  };
};

export const updateRolePermissionsSettingService = async (
  roleId: number,
  permissionIds: number[]
) => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error("Role not found.");
  }

  const uniquePermissionIds = [
    ...new Set(permissionIds.map(Number)),
  ];

  const existingPermissions =
    await prisma.permission.findMany({
      where: {
        id: {
          in: uniquePermissionIds,
        },
      },
      select: {
        id: true,
      },
    });

  const existingPermissionIds =
    existingPermissions.map((p) => p.id);

  if (
    existingPermissionIds.length !==
    uniquePermissionIds.length
  ) {
    throw new Error("Some permissions do not exist.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: {
        roleId,
      },
    });

    if (uniquePermissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: uniquePermissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
  });

  return {
    roleId,
    permissionIds: uniquePermissionIds,
  };
};