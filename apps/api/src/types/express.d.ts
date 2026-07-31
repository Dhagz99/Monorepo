import "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                username: string;
                roles: string[];
                positionId?: string | null
                permissions?: string[]
            };
        }
    }
}
