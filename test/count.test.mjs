import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { count } from "../src/index.mjs";

describe("count", () => {
  it("should count the number or possible combinations", () => {
    const pattern = "Count: {1,5}";
    assert.equal(count(pattern), 5);
    const pattern2 = "Count: {1,5} {A|B|C}";
    assert.equal(count(pattern2), 15);
  });
});
