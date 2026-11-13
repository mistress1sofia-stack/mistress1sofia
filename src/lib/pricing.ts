export const CUSTOM_HOURLY = 140;
export type Duration = "1h" | "1.5h" | "overnight" | "custom";

export function sessionPrice(d: Duration, customHours = 0): number {
  if (d === "1h") return 140;
  if (d === "1.5h") return 200;
  if (d === "overnight") return 600;
  return Math.max(0, customHours) * CUSTOM_HOURLY;
}

// Display currencies. The amounts are identical in every currency (140 / 200 / 600), only the symbol changes.
export type Currency = "GBP" | "USD" | "EUR";
export const CURRENCIES: Currency[] = ["GBP", "USD", "EUR"];
export const CURRENCY_SYMBOL: Record<Currency, string> = { GBP: "£", USD: "$", EUR: "€" };
export const TRIBUTE_MIN = 100;
