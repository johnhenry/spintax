import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parse, choose } from "../src/index.mjs";

describe("Back References", () => {
  it("should support basic back references", () => {
    const template = parse("You {see|hear|feel} the work. Once you {$0}.");
    const values = [...template];

    assert.deepEqual(values, [
      "You see the work. Once you see.",
      "You hear the work. Once you hear.",
      "You feel the work. Once you feel.",
    ]);
  });

  it("should support multiple back references", () => {
    const template = parse("The {red|blue|green} {box|circle} is a {$0} {$1}.");
    const values = [...template];

    // All combinations should correctly reference their respective choices
    assert.equal(values.length, 6);
    assert.ok(values.includes("The red box is a red box."));
    assert.ok(values.includes("The blue circle is a blue circle."));
    assert.ok(values.includes("The green box is a green box."));
    console.log({ values });
  });

  it("should support back references with ranges", () => {
    const template = parse("Number {1,3} doubled is {$0} * 2");
    const values = [...template];

    assert.deepEqual(values, [
      "Number 1 doubled is 1 * 2",
      "Number 2 doubled is 2 * 2",
      "Number 3 doubled is 3 * 2",
    ]);
  });

  it("should support custom back reference marker", () => {
    const template = parse(
      "The {red|blue|green} {box|circle} is a {@0} {@1}.",
      { backReferenceMarker: "@" }
    );
    const values = [...template];

    // All combinations should correctly reference their respective choices
    assert.equal(values.length, 6);
    assert.ok(values.includes("The red box is a red box."));
    assert.ok(values.includes("The blue circle is a blue circle."));
    assert.ok(values.includes("The green box is a green box."));
  });

  it("should ignore invalid back references", () => {
    const template = parse("The {red|blue} color is {$0} and not {$2}.");
    const values = [...template];

    assert.deepEqual(values, [
      "The red color is red and not {$2}.",
      "The blue color is blue and not {$2}.",
    ]);
  });

  it("should preserve back reference markers if no match", () => {
    const template = parse("This is {a|the} test with {$1}");
    const values = [...template];

    // $1 isn't a valid reference, so it should be preserved
    assert.deepEqual(values, [
      "This is a test with {$1}",
      "This is the test with {$1}",
    ]);
  });

  it("should allow using $ in regular text", () => {
    const template = parse(
      "The cost is ${10|20}. Yes, $$$ dollars. Reference: {$0}"
    );
    const values = [...template];

    assert.deepEqual(values, [
      "The cost is $10. Yes, $$$ dollars. Reference: 10",
      "The cost is $20. Yes, $$$ dollars. Reference: 20",
    ]);
  });

  it("should work with choose function", () => {
    const picker = choose(
      "Hello {world|nurse}! Are you really a {$0}? Well then, how do we get {there|here}"
    );

    // Test with specific choices
    const result1 = picker(1, 0); // nurse, there
    assert.equal(
      result1,
      "Hello nurse! Are you really a nurse? Well then, how do we get there"
    );

    // Test with undefined for random choice
    const result2 = picker(0, undefined);
    // Since the second choice is random, we can only check that the back reference works
    assert.ok(
      result2 ===
        "Hello world! Are you really a world? Well then, how do we get there" ||
        result2 ===
          "Hello world! Are you really a world? Well then, how do we get here"
    );
  });
});
