import test from "node:test";
import assert from "node:assert/strict";
import { erf, computeDomeConstants, domeGradient } from "../../src/lib/liquid-glass/math.ts";

test("erf approximation boundaries", () => {
  assert.equal(erf(0), 0);
  assert.ok(Math.abs(erf(2) - 1) < 0.01);
  assert.ok(Math.abs(erf(-2) - (-1)) < 0.01);
});

test("computeDomeConstants generates valid radii and scales", () => {
  const c = computeDomeConstants(10, 100, 50);
  assert.ok(c.Rx > 100);
  assert.ok(c.Ry > 50);
  assert.ok(c.scaleX > 0);
  assert.ok(c.scaleY > 0);
});

test("domeGradient calculates gradient within cap", () => {
  const c = computeDomeConstants(10, 100, 50);
  const grad = domeGradient(20, c.Rx, c.scaleX);
  assert.ok(grad >= 0);
  assert.ok(Number.isFinite(grad));
});
