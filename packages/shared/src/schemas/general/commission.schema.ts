import { z } from "zod";

export const updateExpiredRules = z.object({

  id: z.string(),
  piraRate: z
    .number({
      required_error: "PIRA Rate is required",
    })
    .int("PIRA Rate must be a whole number")
    .min(0, "PIRA Rate cannot be negative")
    .max(100, "PIRA Rate cannot exceed 100%"),
});

export type ExpiredSchema =
  z.infer<typeof updateExpiredRules>;


export const updateCodedRules = z.object({

  id: z.string(),

  sspAmount: z
    .number({
      required_error: "SSP Amount is required",
    })
    .min(0, "SSP Amount cannot be negative"),

  piraRate: z
    .number({
      required_error: "PIRA Rate is required",
    })
    .int("PIRA Rate must be a whole number")
    .min(0, "PIRA Rate cannot be negative")
    .max(100, "PIRA Rate cannot exceed 100%"),
});

export type CodedSchema =
  z.infer<typeof updateCodedRules>;