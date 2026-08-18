const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const now = new Date();

export const defaultStartPeriod = formatDateInput(
  new Date(now.getFullYear(), now.getMonth(), 1)
);

export const defaultEndPeriod = formatDateInput(
  new Date(now.getFullYear(), now.getMonth() + 1, 0)
);