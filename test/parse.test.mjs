import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parse, compile, range } from "../src/index.mjs";

describe("parse()", () => {
  it("should parse range patterns correctly", () => {
    const template = parse("Count: {1,5}");
    const expected = [...compile`Count: ${range(1, 5)}`];
    assert.deepEqual([...template], expected);
  });

  it("should parse ranges with steps", () => {
    const template = parse("Count: {0,10,2}");
    const expected = [...compile`Count: ${range(0, 10, 2)}`];
    assert.deepEqual([...template], expected);
  });

  it("should parse choices patterns correctly", () => {
    const template = parse("Color: {red|green|blue}");
    const expected = [...compile`Color: ${["red", "green", "blue"]}`];
    assert.deepEqual([...template], expected);
  });

  it("should handle single choices", () => {
    const template = parse("Value: {single}");
    const expected = [...compile`Value: ${["single"]}`];
    assert.deepEqual([...template], expected);
  });

  it("should handle multiple patterns", () => {
    const template = parse("{small|large} {box|circle}");
    const expected = [...compile`${["small", "large"]} ${["box", "circle"]}`];
    assert.deepEqual([...template], expected);
  });

  it("should handle a mix of ranges and choices", () => {
    const template = parse("Item {A|B}-{1,3}");
    const expected = [...compile`Item ${["A", "B"]}-${range(1, 3)}`];
    assert.deepEqual([...template], expected);
  });

  it("should ignore whitespace in range patterns", () => {
    const template1 = parse("Test {1,3}");
    const template2 = parse("Test { 1, 3 }");
    const template3 = parse("Test {1, 3}");
    const template4 = parse("Test {1,3, }"); // Extra trailing comma and space

    const expected = [...compile`Test ${range(1, 3)}`];

    assert.deepEqual([...template1], expected);
    assert.deepEqual([...template2], expected);
    assert.deepEqual([...template3], expected);
    assert.deepEqual([...template4], expected);
  });

  it("should preserve whitespace in choice patterns", () => {
    const template1 = parse("Test {A|B|C}");
    const template2 = parse("Test {A |B|C}");
    const template3 = parse("Test {A| B|C}");

    const expected1 = [...compile`Test ${["A", "B", "C"]}`];
    const expected2 = [...compile`Test ${["A ", "B", "C"]}`];
    const expected3 = [...compile`Test ${["A", " B", "C"]}`];

    assert.deepEqual([...template1], expected1);
    assert.deepEqual([...template2], expected2);
    assert.deepEqual([...template3], expected3);

    // Verify they're different
    assert.notDeepEqual([...template1], [...template2]);
    assert.notDeepEqual([...template1], [...template3]);
    assert.notDeepEqual([...template2], [...template3]);
  });

  it("should handle decimal numbers in ranges", () => {
    const template = parse("Value: {0.5, 1.5, 0.5}");
    const expected = [...compile`Value: ${range(0.5, 1.5, 0.5)}`];
    assert.deepEqual([...template], expected);
  });

  it("should handle complex nested templates", () => {
    const template = parse(
      `
      {
        "size": "<small|medium|large>",
        "count": <1,3>,
        "options": ["<A|B>", "<X|Y>"]
      }
    `,
      {
        patternStart: "<",
        patternEnd: ">",
      }
    );

    // Test that we get the right number of combinations
    // 3 sizes × 3 counts × 2 first options × 2 second options = 36
    assert.equal([...template].length, 36);

    // Verify that first result contains expected values
    const firstResult = [...template][0];
    assert.match(firstResult, /"size": "small"/);
    assert.match(firstResult, /"count": 1/);
    assert.match(firstResult, /"options": \["A", "X"\]/);
  });
});
