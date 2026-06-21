import { describe, expect, it } from "vitest";

import { evalExpression } from "../src/features/log/lib/calcExpression";

describe("evalExpression", () => {
  it("evaluates addition chains", () => {
    expect(evalExpression("56 + 45+54+232")).toBe(387);
  });

  it("respects operator precedence", () => {
    expect(evalExpression("232-23*2")).toBe(186);
  });

  it("handles parentheses", () => {
    expect(evalExpression("(56 + 4) * 2")).toBe(120);
  });

  it("handles unary minus and decimals", () => {
    expect(evalExpression("-2.5 + 5")).toBe(2.5);
  });

  it("returns a plain number for a single value", () => {
    expect(evalExpression("240")).toBe(240);
  });

  it("returns null on trailing operators", () => {
    expect(evalExpression("56 +")).toBeNull();
  });

  it("returns null on letters / injection", () => {
    expect(evalExpression("alert(1)")).toBeNull();
    expect(evalExpression("2 ** 3")).toBeNull();
  });

  it("returns null on empty input", () => {
    expect(evalExpression("   ")).toBeNull();
  });

  it("returns null on division by zero (non-finite)", () => {
    expect(evalExpression("5/0")).toBeNull();
  });
});
