import { AgentGender } from "@repo/shared";
import { AgentLevel } from "../../../../generated/prisma";

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
  value: string | null | undefined
): Date | null => {
  if (!value) {
    return null;
  }

  const dateOnly =
    value.includes("T")
      ? value.split("T")[0]
      : value;

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      dateOnly
    );

  if (!match) {
    throw new Error(
      "Invalid birth date format. Expected YYYY-MM-DD."
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const parsedDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  const isValidDate =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() ===
      month - 1 &&
    parsedDate.getUTCDate() === day;

  if (!isValidDate) {
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


export function validateAgentLevelChange(
  currentLevel: AgentLevel,
  requestedLevel: AgentLevel
): void {
  if (currentLevel === requestedLevel) {
    return;
  }

  const validPromotion =
    (
      currentLevel === AgentLevel.L2 &&
      requestedLevel === AgentLevel.L1
    ) ||
    (
      currentLevel === AgentLevel.L3 &&
      requestedLevel === AgentLevel.L2
    );

  if (!validPromotion) {
    throw new Error(
      `Invalid level change from ${currentLevel} to ${requestedLevel}. Agents can only be promoted one level at a time.`
    );
  }
}