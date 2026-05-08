import { Request, Response } from "express";
import  prisma  from "../../lib/prisma";

export async function me(req: Request, res: Response) {
  const userId = (req as any).user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
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
    return res.status(404).json({ message: "User not found" })
  }

  // Flatten permissions
  const permissions = user.roles.flatMap(r =>
    r.role.permissions.map(p => p.permission.code)
  )

  const roles = user.roles.map(r => r.role.name)

  res.json({
    id: user.id,
    name: user.name,
    username: user.username,
    roles,
    permissions
  })
}

export function logout(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.sendStatus(200);
}
