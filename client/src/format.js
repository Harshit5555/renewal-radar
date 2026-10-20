export const usd = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));

// Dates are stored as midnight UTC, so format them in UTC to show the right day.
export const day = (value) =>
  new Date(value).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });

export const toInputDate = (value) => new Date(value).toISOString().slice(0, 10);

export function healthLevel(score) {
  const n = Number(score);
  if (n < 40) return "low";
  if (n < 70) return "medium";
  return "high";
}
