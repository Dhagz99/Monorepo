import { z } from "zod";

export const registrationAgentSchema =
  z.object({
    agentQrCode:
      z.string().optional(),

    email:
      z
        .string()
        .optional(),

    agentName:
      z
        .string()
        .min(
          1,
          "Agent name is required"
        ),

    agentGender:
      z
        .string()
        .min(
          1,
          "Gender is required"
        ),

    /*
     * React Hook Form already converts
     * this to Date using valueAsDate.
     */
    dateBirth: z.coerce.date({
      required_error:
        "Birth date is required",
    }),

   agentTel: z
    .string()
    .trim()
    .regex(
      /^9\d{9}$/,
      "Enter a valid Philippine mobile number."
    ),

  agentSecTel: z
    .string()
    .trim()
    .refine(
      value =>
        value === "" ||
        /^9\d{9}$/.test(value),
      {
        message:
          "Enter a valid Philippine mobile number.",
      }
    )
    .optional(),


    agentAdd:
      z
        .string()
        .min(
          1,
          "Address is required"
        )
        .max(
          500,
          "Address is too long"
        ),

    username:
      z
        .string()
        .min(
          8,
          "Username must be at least 8 characters"
        )
        .regex(
          /[A-Z]/,
          "Username must contain at least 1 uppercase letter"
        )
        .regex(
          /[a-z]/,
          "Username must contain at least 1 lowercase letter"
        )
        .regex(
          /[0-9]/,
          "Username must contain at least 1 number"
        ),

    branchCode:
      z.string().optional(),

    /*
     * IMPORTANT:
     * Don't use .default([]) here.
     *
     * React Hook Form already supplies [] through
     * defaultValues.
     */
    branches:
      z.array(
        z.object({
          branchCode:
            z.string().optional(),

          companyName:
            z.string().optional(),
        })
      ),

    selectedAgentLevel:
      z.string(),

    parentAgentName:
      z.string().optional(),

    parentAgentId:
      z.string().optional(),

    uplineLevel:
      z.string().optional(),
  });

export type RegisterAgentSchema =
  z.infer<
    typeof registrationAgentSchema
  >;

  

export const registerAgentApiSchema = z.object({
  agentQrCode: z.string().optional(),

  email: z.string().optional(),

  agentName: z
    .string()
    .min(1, "Agent name is required"),

  agentGender: z
    .string()
    .min(1, "Gender is required"),

  dateBirth: z.coerce.date({
    required_error:
      "Birth date is required",
  }),

  agentTel: z
    .string()
    .trim()
    .regex(
      /^\+639\d{9}$/,
      "Enter a valid Philippine mobile number."
    ),

  agentSecTel: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^\+639\d{9}$/.test(value),
      {
        message:
          "Enter a valid Philippine mobile number.",
      }
    )
    .optional(),

  agentAdd: z
    .string()
    .min(1, "Address is required")
    .max(
      500,
      "Address is too long"
    ),

  username: z
    .string()
    .min(
      8,
      "Username must be at least 8 characters"
    )
    .regex(
      /[A-Z]/,
      "Username must contain at least 1 uppercase letter"
    )
    .regex(
      /[a-z]/,
      "Username must contain at least 1 lowercase letter"
    )
    .regex(
      /[0-9]/,
      "Username must contain at least 1 number"
    ),

  branchCode: z
    .string()
    .min(
      1,
      "Branch is required"
    ),

  selectedAgentLevel: z
    .string()
    .min(
      1,
      "Agent level is required"
    ),

  parentAgentName:
    z.string().optional(),

  parentAgentId:
    z.string().optional(),

  uplineLevel:
    z.string().optional(),
});

export type RegisterAgentApiPayload =
  z.infer<
    typeof registerAgentApiSchema
  >;