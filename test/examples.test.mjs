import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { range, compile } from "../src/index.mjs";

describe("Examples from Documentation", () => {
  it("should handle marketing message variations", () => {
    const messages = compile`${[
      "Try",
      "Discover",
      "Experience",
    ]} our new product for ${[
      "amazing",
      "incredible",
      "outstanding",
    ]} results within ${range(7, 30, 7)} days!`;

    const results = [...messages];
    // Total variations: 3 words × 3 adjectives × 4 day options = 36
    assert.equal(results.length, 45);

    // Check generation order (rightmost varies first)
    const daysPattern = /within (\d+) days!/;
    const firstOptions = results.slice(0, 4).map((msg) => {
      const match = msg.match(daysPattern);
      return match ? parseInt(match[1], 10) : null;
    });
    // Days should vary first for the first option (Try + amazing)
    assert.deepEqual(firstOptions, [7, 14, 21, 28]);
  });

  it("should handle API endpoint testing example", () => {
    const endpoints = compile`/api/${["v1", "v2", "v3"]}/${[
      "users",
      "products",
    ]}/${range(1, 5, 1)}`;

    const results = [...endpoints];

    // Total variations: 3 versions × 2 resources × 5 ids = 30
    assert.equal(results.length, 30);

    // Check that v1 endpoints come first, followed by ids 1-5
    assert.match(results[0], /^\/api\/v1\/users\/1$/);
    assert.match(results[1], /^\/api\/v1\/users\/2$/);
  });

  it("should handle configuration generation example", () => {
    const configs = compile`{ "timeout": ${range(
      1000,
      5000,
      1000
    )}, "retries": ${range(1, 3, 1)}, "mode": "${["strict", "lenient"]}" }`;

    const results = [...configs];

    // Total variations: 5 timeouts × 3 retries × 2 modes = 30
    assert.equal(results.length, 30);

    // Parse the first JSON config
    const firstConfig = JSON.parse(results[0]);

    // First result should have the first timeout (1000)
    assert.equal(firstConfig.timeout, 1000);
  });
});
