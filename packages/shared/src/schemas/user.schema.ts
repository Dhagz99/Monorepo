import z from "zod";

export const createUserSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(8),
  
    roleIds: z
      .array(z.number().int().positive())
      .min(1, "At least one role is required"),

      company_id: z
      .string()
      .optional()
      .transform(v => (v === "" ? null : v))

  })


  export const updateUserSchema1 = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(8).optional(),
  
    roleIds: z
      .array(z.number().int().positive())
      .min(1, "At least one role is required"),
         
      company_id: z
      .string()
      .optional()
      .transform(v => (v === "" ? null : v))
  })
  
  

  export type RegisterSchema= z.infer<typeof createUserSchema >


  export const updateUserSchema = updateUserSchema1.partial().extend({
    roleIds: z.array(z.number().int().positive()).optional()
  })