import z from "zod";
export const createUserSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(8),
    roleIds: z
        .array(z.number().int().positive())
        .min(1, "At least one role is required"),
});
export const updateUserSchema1 = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(8).optional(),
    roleIds: z
        .array(z.number().int().positive())
        .min(1, "At least one role is required"),
});
export const updateUserSchema = updateUserSchema1.partial().extend({
    roleIds: z.array(z.number().int().positive()).optional()
});
export const loginSchema = z.object({
    username: z
        .string()
        .min(1, "Username is required"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});
