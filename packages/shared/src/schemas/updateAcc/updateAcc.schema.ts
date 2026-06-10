import { z } from "zod";

export const updateAccSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .optional(),

    agentTel: z
      .string()
      .min(11, "Phone number must be 11 digits")
      .max(11, "Phone number must be 11 digits"),

    password: z.string().optional(),

    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.password) return true;

      return (
        data.password.length >= 8 &&
        /^(?=.*[A-Z])(?=.*\d).+$/.test(
          data.password
        )
      );
    },
    {
      path: ["password"],
      message:
        "Password must contain at least 8 characters, 1 uppercase letter and 1 number",
    }
  )
  .refine(
    (data) => {
      if (!data.password) return true;

      return (
        data.password ===
        data.confirmPassword
      );
    },
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }
  );

export type UpdateAgentAccSchema =
  z.infer<typeof updateAccSchema>;