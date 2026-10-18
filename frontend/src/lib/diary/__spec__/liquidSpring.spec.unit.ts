import { describe, expect, it } from "vitest";

import {
  isSpringSettled,
  springBlur,
  springWobble,
  stepSpring,
  type SpringState,
} from "../liquidSpring";

describe("liquidSpring", () => {
  it("settles exactly on the target", () => {
    const spring: SpringState = { p: 0, v: 0 };
    let frames = 0;
    while (!isSpringSettled(spring, 1) && frames < 1000) {
      stepSpring(spring, 1, 1 / 60);
      frames += 1;
    }

    expect(frames).toBeLessThan(1000);
    expect(spring.p).toBeCloseTo(1, 2);
  });

  it("clamps long frame gaps to one short step", () => {
    const afterGap: SpringState = { p: 0, v: 0 };
    const afterStep: SpringState = { p: 0, v: 0 };
    stepSpring(afterGap, 1, 5);
    stepSpring(afterStep, 1, 0.032);

    expect(afterGap).toEqual(afterStep);
  });

  it("blurs only mid-morph", () => {
    expect(springBlur({ p: 0, v: 0 })).toBeCloseTo(0);
    expect(springBlur({ p: 0.5, v: 0 })).toBeCloseTo(6);
    expect(springBlur({ p: 1, v: 0 })).toBeCloseTo(0);
    expect(springBlur({ p: 1.2, v: 0 })).toBeCloseTo(0);
  });

  it("stops wobbling once at rest on the target", () => {
    expect(springWobble({ p: 1, v: 0 }, 1, 400)).toBeCloseTo(0);
  });
});
