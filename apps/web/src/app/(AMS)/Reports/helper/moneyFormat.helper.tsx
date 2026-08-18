export const formatMoney = (
  value: number | null | undefined
): string => {
  if (value === null) {
    return "-";
  }

  const safeValue = Number(value ?? 0);

  if (!Number.isFinite(safeValue)) {
    return "₱0.00";
  }

  return safeValue.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};