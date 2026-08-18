import { Decimal } from "@prisma/client/runtime/library";

export const decimalToNumber = (
  value: Decimal | null | undefined
): number => {
  return value?.toNumber() ?? 0;
};

export const createDateRange = (
  startPeriod?: string,
  endPeriod?: string
) => {
  if (!startPeriod || !endPeriod) {
    return undefined;
  }

  const startDate = new Date(`${startPeriod}T00:00:00.000Z`);
  const exclusiveEndDate = new Date(
    `${endPeriod}T00:00:00.000Z`
  );

  exclusiveEndDate.setUTCDate(
    exclusiveEndDate.getUTCDate() + 1
  );

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(exclusiveEndDate.getTime())
  ) {
    throw new Error("Invalid report date range.");
  }

  if (startDate >= exclusiveEndDate) {
    throw new Error(
      "Start period cannot be later than end period."
    );
  }

  return {
    gte: startDate,
    lt: exclusiveEndDate,
  };
};


