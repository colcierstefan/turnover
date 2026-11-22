import { describe, expect, it } from "vitest";

import { phoneNumberSchema } from "@turnover/core/handyman/schemas/handyman.schema";

describe("phoneNumberSchema", () => {
  it.each(["0712 345 678", "0712-345-678", "+40 712 345 678", "0040712345678"])(
    "normalizes the Romanian number %s to international form",
    (typed) => {
      expect(phoneNumberSchema.parse(typed)).toBe("+40712345678");
    },
  );

  it("keeps a foreign number typed with its country code", () => {
    expect(phoneNumberSchema.parse("+49 151 23456789")).toBe("+4915123456789");
  });

  it("rejects a number that is too short", () => {
    expect(phoneNumberSchema.safeParse("0712 345").success).toBe(false);
  });
});
