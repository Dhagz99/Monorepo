import { z } from "zod";

export const registrationAgentSchema =

  z.object({
    agentQrCode: z.string().optional(),
    email: z
      .string()
      .optional(),

    agentName: z
      .string()
      .min(
        1,
        "Agent name is required"
      ),

    agentGender: z
      .string()
      .min(
        1,
        "Gender is required"
      ),

    dateBirth: z.coerce.date({
      required_error:
        "Birth date is required",
    }),

    agentTel: z
      .string()
      .min(
        11,
        "Phone number must be 11 digits"
      )
      .max(
        11,
        "Phone number must be 11 digits"
      ),

    agentSecTel: z
      .string()
      .max(
        11,
        "Phone number must be 11 digits"
      )
      .optional(),
    agentAdd: z
      .string()
      .min(
        1,
        "Address is required"
      )
      .max(500),

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
      // .regex(
      //   /[^A-Za-z0-9]/,
      //   "Username must contain at least 1 special character"
      // ),
      branches: z.array(
        z.object({
          branchCode: z.string().optional(),
          companyName: z.string().optional(),
        })
      ),
      selectedAgentLevel: z.string(),
      
      parentAgentName: z.string().optional(),

      parentAgentId: z
        .string()
        .optional(),

      uplineLevel: z
        .string()
        .optional(),

    
  });

export type RegisterAgentSchema =
  z.infer<
    typeof registrationAgentSchema
  >;