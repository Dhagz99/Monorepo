import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const signToken = (payload: any) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET);
