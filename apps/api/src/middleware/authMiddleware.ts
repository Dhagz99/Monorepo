import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET!
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

export interface AuthPayload {
  id: number
  username: string
  roles:string

  company_id?: string | null
  permissions?: string[]
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No token provided"
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload

    if (!decoded.id) {
      return res.status(401).json({
        message: "Invalid token payload"
      })
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      roles: decoded.roles,

      company_id: decoded.company_id ?? null,   
      permissions: decoded.permissions ?? []   
    }

    next()
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token"
    })
  }
}
