import { describe, expect, it } from "vitest";
import { sessionPrice } from "@/lib/pricing";

describe("session pricing", () => {
  it("1 hour is £140", () => expect(sessionPrice("1h")).toBe(140));
  it("1.5 hours is £200", () => expect(sessionPrice("1.5h")).toBe(200));
  it("overnight is £600", () => expect(sessionPrice("overnight")).toBe(600));
  it("deposit is 50%", () => expect(sessionPrice("1.5h") / 2).toBe(100));
});
