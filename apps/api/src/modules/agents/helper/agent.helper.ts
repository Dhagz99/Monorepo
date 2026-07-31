import { AgentGender } from "@repo/shared";

export const normalizeNullableString = (
  value: string | null | undefined
) => {
  const normalized =
    value?.trim();

  return normalized
    ? normalized
    : null;
};

export const formatDateForResponse = (
  date: Date | null
) => {
  if (!date) {
    return null;
  }

  return date
    .toISOString()
    .slice(0, 10);
};

export const parseNullableDate = (
  value: string | null
) => {
  if (!value) {
    return null;
  }

  const parsedDate =
    new Date(`${value}T00:00:00`);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid birth date."
    );
  }

  return parsedDate;
};

export const allowedGenders: readonly AgentGender[] = [
  "MALE",
  "FEMALE",
];

export function parseAgentGender(
  value: string | null | undefined
): AgentGender | null {
  if (!value) {
    return null;
  }

  const normalized =
    value.trim().toUpperCase();

  if (
    !allowedGenders.includes(
      normalized as AgentGender
    )
  ) {
    throw new Error(
      "Invalid gender."
    );
  }

  return normalized as AgentGender;
}