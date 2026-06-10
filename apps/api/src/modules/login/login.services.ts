
import { CreateUserInput, LoginDTO } from "./login.types";
import  prisma  from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt";
import { RegisterSchema } from "@repo/shared";

export async function loginUser(params: LoginDTO) {
  const { username, password } = params

  const user = await prisma.user.findUnique({
    where: { username },

    include: {

      agent: true,

      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  })


if (!user) {
  throw new Error("INVALID_USER");
}

if (!user.isActive) {

  const latestNotification =
    await prisma.agentNotification.findFirst({
      where: {
        agentId: user.agentId ?? undefined,
        type: {
          in: [
            "MAINTENANCE_DROPPED",
            "MAINTENANCE_SUSPENDED"
          ]
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

  if (
    latestNotification?.type ===
    "MAINTENANCE_DROPPED"
  ) {
    throw new Error("ACCOUNT_DROPPED");
  }

  if (
    latestNotification?.type ===
    "MAINTENANCE_SUSPENDED"
  ) {
    throw new Error("ACCOUNT_SUSPENDED");
  }

  throw new Error("ACCOUNT_INACTIVE");
}
 

  const isPasswordValid = await bcrypt.compare(password, user.password)
  console.log("test: ", isPasswordValid)
  if (!isPasswordValid) {
    throw new Error("INVALID_PASSWORD")
  }

  const roles = user.roles.map(r => r.role.name)

  const permissions = [
    ...new Set(
      user.roles.flatMap(r =>
        r.role.permissions.map(p => p.permission.code)
      )
    )
  ]

  const token = signToken({
    id: user.id,
    username: user.username,
    roles,
    permissions
  })

  return {
    token,

    user: {
      id: user.id,

      username: user.username,

      email: user.email,

      roles,

      permissions,

      agent: user.agent
        ? {
            id: user.agent.id,

            fullName:
              user.agent.fullName,

            agentCode:
              user.agent.agentCode,

            level:
              user.agent.level,

            status:
              user.agent.status,

            accountType:
              user.agent.accountType,

            email:
              user.agent.email,
          }
        : null,
    }
  }
}



export async function createUserService(data: RegisterSchema) {
  const { email, name, username, password, roleIds } = data

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        ...(email ? [{ email }] : [])
      ]
    }
  })

  if (existing) {
    throw new Error("USER_ALREADY_EXISTS")
  }

  //  Validate roles
  const roles = await prisma.role.findMany({
    where: { id: { in: roleIds } }
  })

  if (roles.length !== roleIds.length) {
    throw new Error("INVALID_ROLE")
  }

  //  Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  //  Create user + roles (transaction-safe)
  const user = await prisma.$transaction(async tx => {
    const createdUser = await tx.user.create({
      data: {
        email,
        name,
        username,
        password: hashedPassword,
        isActive: true,
    }
    })

    await tx.userRole.createMany({
      data: roleIds.map(roleId => ({
        userId: createdUser.id,
        roleId
      }))
    })

    return createdUser
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    isActive: user.isActive,
    createdAt: user.createdAt
  }
}


export async function updateUserService(
  userId: number,
  data: {
    email?: string
    name?: string
    username?: string
    password?: string
    roleIds?: number[]
    company_id?: string | null
  }
) {
  return prisma.$transaction(async tx => {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    const user = await tx.user.update({
      where: { id: userId },
      data: {
        email: data.email,
        name: data.name,
        username: data.username,
        password: data.password,
      }
    })

    if (data.roleIds) {
      await tx.userRole.deleteMany({
        where: { userId }
      })

      await tx.userRole.createMany({
        data: data.roleIds.map(roleId => ({
          userId,
          roleId
        }))
      })
    }

    return user
  })
}


export async function getRoleService() {
  return prisma.role.findMany({
    select: {
        id: true,
        name: true,
        description: true,
        permissions: {
            select: {
              roleId: true,
              permissionId: true,
              permission: {
                select: {
                    code: true
                }
              }
            }
        }
    },
    orderBy: {
      name: "asc"
    }
  })
}


export async function getPermissionService() {
  return prisma.permission.findMany({
    orderBy: {
      code: "asc"
    }
  })
}



export async function getUsersService() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,

      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              permissions: {
                select: {
                  permission: {
                    select: {
                      id: true,
                      code: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      username: "asc"
    }
  })
}

export async function updateRolePermissionsService(
  roleId: number,
  permissionIds: number[]
) {
  return prisma.$transaction(async tx => {
    const role = await tx.role.findUnique({ where: { id: roleId } })
    if (!role) throw new Error("ROLE_NOT_FOUND")

    await tx.rolePermission.deleteMany({
      where: { roleId }
    })

    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId,
          permissionId
        }))
      })
    }

    return { success: true }
  })
}




