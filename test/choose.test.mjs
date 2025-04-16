import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { choose, parse } from "../src/index.mjs";

describe("choose", () => {
  it("should produce one of the strings from the full set", () => {
    const pattern = "Count: {1,5}";
    const strings = [...parse(pattern)];
    const choice = choose(pattern)();
    assert(strings.includes(choice));
  });

  it("should produce specifc pattern for the given arguments", () => {
    const pattern = "Count: {1,5} {A|B|C}";
    const generator = choose(pattern);
    assert.equal(generator(0, 0), "Count: 1 A");
    assert.equal(generator(1, 2), "Count: 2 C");
    assert.equal(generator(2, 1), "Count: 3 B");
  });
});
