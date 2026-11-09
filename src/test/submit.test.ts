import { describe, expect, it } from "vitest";
import { sanitizeDetails } from "@/lib/submission-validation";

describe("sanitizeDetails", () => {
  it("strips payment credential fields before storage", () => {
    const clean = sanitizeDetails({ name: "A", code: "GIFT-1234", cardImage: "blob:xyz", wallet: "seed", password: "x" });
    expect(clean).toEqual({ name: "A" });
  });

  it("keeps ordinary form fields", () => {
    const clean = sanitizeDetails({ name: "A", email: "a@b.co", pay: "bitcoin", activities: ["Role play"] });
    expect(clean).toEqual({ name: "A", email: "a@b.co", pay: "bitcoin", activities: ["Role play"] });
  });
});
