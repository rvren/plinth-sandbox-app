import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { meridianDesignSystem } from "./tokens";

/**
 * app/globals.css is what Meridian actually ships; tokens.ts is the same design system as a
 * DesignSystemContract, which the guardrails check specs against. Two copies of one truth
 * drift unless something fails when they do.
 */
const css = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");
const declared = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));

describe("Meridian tokens", () => {
  it("declares every contract token in CSS with the same value", () => {
    for (const [name, token] of Object.entries(meridianDesignSystem.tokens)) {
      expect(declared[name.replace(/\./g, "-")], name).toBe(String(token.$value));
    }
  });

  it("declares nothing in CSS that the contract does not know", () => {
    const contract = new Set(Object.keys(meridianDesignSystem.tokens).map((n) => n.replace(/\./g, "-")));
    expect(Object.keys(declared).filter((n) => !contract.has(n))).toEqual([]);
  });
});
