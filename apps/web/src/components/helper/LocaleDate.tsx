export const formatDate = (date?: string | null) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};