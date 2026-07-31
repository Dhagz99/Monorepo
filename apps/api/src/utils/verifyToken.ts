import jwt from "jsonwebtoken";

export const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
        id: number;
        username: string;
        roles: string[];
        positionId?: string | null
        permissions?: string[]
    };
};