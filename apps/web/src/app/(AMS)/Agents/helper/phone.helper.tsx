export const normalizePHPhone = (
  value: string
): string | null => {
  const phone = value.trim();

  if (!phone) return null;

  // Remove spaces, dashes, parentheses, etc.
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Already +63
  if (cleaned.startsWith("+63")) {
    return cleaned;
  }

  // Example: 639123456789
  if (cleaned.startsWith("63")) {
    return `+${cleaned}`;
  }

  // Example: 09123456789
  if (cleaned.startsWith("0")) {
    return `+63${cleaned.substring(1)}`;
  }

  // Example: 9123456789
  return `+63${cleaned}`;
};