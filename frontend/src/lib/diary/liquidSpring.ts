// Spring that drives the add-entry fluid morph between its two shapes.
// p runs from 0 (one wide pill) to 1 (two half pills), v is its velocity.

const STIFFNESS = 170;
const DAMPING = 17;
// Clamp large frame gaps (tab refocus etc.) so the spring never jumps.
const MAX_STEP_SECONDS = 0.032;
const MAX_BLUR = 6;
const SETTLE_EPSILON = 0.001;

export type SpringState = { p: number; v: number };

/** Advance the spring one frame toward `target`, mutating `state`. */
export function stepSpring(
  state: SpringState,
  target: number,
  elapsedSeconds: number,
) {
  const dt = Math.min(elapsedSeconds, MAX_STEP_SECONDS);
  const accel = STIFFNESS * (target - state.p) - DAMPING * state.v;
  state.v += accel * dt;
  state.p += state.v * dt;
}

export function isSpringSettled(state: SpringState, target: number): boolean {
  return (
    Math.abs(state.v) < SETTLE_EPSILON &&
    Math.abs(target - state.p) < SETTLE_EPSILON
  );
}

/** Side-to-side wobble that fades out as the spring settles. */
export function springWobble(
  state: SpringState,
  target: number,
  elapsedMs: number,
): number {
  const settleAmount = Math.min(
    1,
    Math.abs(state.v) + Math.abs(target - state.p) * 4,
  );
  return Math.sin(elapsedMs / 90) * 0.5 * settleAmount;
}

// Blur peaks mid-morph and is ~0 at both ends, so the single opaque body keeps
// constant opacity (no surface flicker) while the corners round smoothly into
// the neck and back. Starting and ending at blur 0 means toggling the filter
// on and off is visually seamless.
export function springBlur(state: SpringState): number {
  const progress = Math.min(1, Math.max(0, state.p));
  return MAX_BLUR * Math.sin(Math.PI * progress);
}
