import z from "zod";

export const loginSchema1 = z.object({
  username: z
    .string()
    .min(1, "Username is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginSchema1 = z.infer<typeof loginSchema1>;

export const createUserSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1),
    branchId: z.string().optional(),
    username: z.string().min(3),
    password: z.string().min(8),
  
    roleIds: z
      .array(z.string())
      .min(1, "At least one role is required"),
  })


  export const updateUserSchema1 = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(8).optional(),
  
    roleIds: z
      .array(z.number().int().positive())
      .min(1, "At least one role is required"),
         
  })
  
  

  export type RegisterSchema= z.infer<typeof createUserSchema >


 
export const updateUserSchema = createUserSchema
.omit({ password: true })
.extend({
  password: z.string().min(8).optional()
})

export type UpdateUserSchema = z.infer<typeof updateUserSchema>
  