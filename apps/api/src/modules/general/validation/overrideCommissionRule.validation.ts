// overrideCommissionRule.validation.ts

import {
  AgentLevel,
} from "../../../../generated/prisma";

export type OverrideCommissionRulePayload = {
  receiverLevel: AgentLevel;
  sourceLevel: AgentLevel;
  amount: number;
};

export type ValidatedOverrideCommissionRulePayload = {
  receiverLevel: AgentLevel;
  sourceLevel: AgentLevel;
  amount: number;
};

const allowedLevels: readonly AgentLevel[] = [
  AgentLevel.L1,
  AgentLevel.L2,
  AgentLevel.L3,
];

export function validateOverrideRulePayload(
  payload: OverrideCommissionRulePayload
): ValidatedOverrideCommissionRulePayload {
  const {
    receiverLevel,
    sourceLevel,
  } = payload;

  const amount =
    Number(payload.amount);

  if (
    !allowedLevels.includes(
      receiverLevel
    )
  ) {
    throw new Error(
      "A valid receiver level is required."
    );
  }

  if (
    !allowedLevels.includes(
      sourceLevel
    )
  ) {
    throw new Error(
      "A valid source level is required."
    );
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Override amount must be greater than zero."
    );
  }

  if (
    receiverLevel ===
    sourceLevel
  ) {
    throw new Error(
      "Receiver level and source level cannot be the same."
    );
  }

  return {
    receiverLevel,
    sourceLevel,
    amount,
  };
}