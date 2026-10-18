import { useEffect, useRef } from "react";

import {
  isSpringSettled,
  springBlur,
  springWobble,
  stepSpring,
  type SpringState,
} from "../../lib/diary/liquidSpring";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Spring the container's --p and --wob toward `target` (0 or 1) and drive the
 * goo filter blur, so its blobs morph like a liquid between the two shapes.
 */
export function useLiquidMorph(target: number) {
  const fieldsRef = useRef<HTMLDivElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const springRef = useRef<SpringState | null>(null);
  const targetRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  const reduceMotion = prefersReducedMotion();

  // Initialize --p once so the first paint matches the current target.
  useEffect(() => {
    const el = fieldsRef.current;
    if (!el) {
      return;
    }
    springRef.current = { p: target, v: 0 };
    el.style.setProperty("--p", String(target));
    el.style.setProperty("--wob", "0");
    blurRef.current?.setAttribute("stdDeviation", "0");
    // Run once on mount; target is read only for the first frame.
  }, []);

  // Drive the spring toward the new target whenever it changes.
  useEffect(() => {
    const el = fieldsRef.current;
    if (!el) {
      return;
    }
    targetRef.current = target;

    function settle(element: HTMLElement, value: number) {
      element.style.setProperty("--p", String(value));
      element.style.setProperty("--wob", "0");
      blurRef.current?.setAttribute("stdDeviation", "0");
      element.classList.remove("is-morphing");
    }

    if (reduceMotion) {
      springRef.current = { p: target, v: 0 };
      settle(el, target);
      return;
    }

    const start = performance.now();
    let last = start;
    el.classList.add("is-morphing");

    const tick = (now: number) => {
      const spring = springRef.current;
      if (!spring) {
        rafRef.current = null;
        return;
      }
      const goal = targetRef.current;
      stepSpring(spring, goal, (now - last) / 1000);
      last = now;

      blurRef.current?.setAttribute(
        "stdDeviation",
        springBlur(spring).toFixed(2),
      );
      el.style.setProperty("--p", spring.p.toFixed(4));
      el.style.setProperty(
        "--wob",
        springWobble(spring, goal, now - start).toFixed(3),
      );

      if (isSpringSettled(spring, goal)) {
        spring.p = goal;
        spring.v = 0;
        settle(el, goal);
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    // Retarget the existing spring if one is already running; never stack loops.
    if (rafRef.current == null) {
      last = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      el.classList.remove("is-morphing");
    };
  }, [target, reduceMotion]);

  return { fieldsRef, blurRef };
}
