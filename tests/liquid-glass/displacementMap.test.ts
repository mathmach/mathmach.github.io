import test from "node:test";
import assert from "node:assert/strict";
import { computeDisplacementMap } from "../../src/lib/liquid-glass/displacementMap.ts";

test("computeDisplacementMap generates RGBA buffer with neutral boundary", () => {
  const size = 64;
  const buffer = computeDisplacementMap({
    size,
    halfWidth: 32,
    halfHeight: 20,
    radius: 8,
    depth: 4,
    domeDepth: 4,
    splay: 1,
    glow: 0.2,
    glowSpread: 1,
    glowExponent: 1.5,
    edgeHighlight: 0.3,
    edgeWidth: 2,
    edgeExponent: 1.5,
    specularAngle: 45,
  });

  assert.equal(buffer.length, size * size * 4);
  assert.equal(buffer[0], 128);
  assert.equal(buffer[1], 128);
  assert.equal(buffer[2], 128);
  assert.equal(buffer[3], 0);
});
