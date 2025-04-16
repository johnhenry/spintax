import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { range, compile } from "../src/index.mjs";

describe("Spintax", () => {
  describe("arrays()", () => {
    it("should generate all provided options", () => {
      const generator = ["red", "green", "blue"];
      const values = [...generator.values()];
      assert.deepEqual(values, ["red", "green", "blue"]);
    });

    it("should work with number choices", () => {
      const generator = [1, 2, 3];
      const values = [...generator.values()];
      assert.deepEqual(values, [1, 2, 3]);
    });
  });

  describe("range()", () => {
    it("should generate numbers within specified range", () => {
      const generator = range(1, 5);
      const values = [...generator.values()];
      assert.deepEqual(values, [1, 2, 3, 4, 5]);
    });

    it("should respect step parameter", () => {
      const generator = range(0, 10, 2);
      const values = [...generator.values()];
      assert.deepEqual(values, [0, 2, 4, 6, 8, 10]);
    });

    it("should include end value when requested", () => {
      const generator = range(0, 10, 3, true);
      const values = [...generator.values()];
      assert.deepEqual(values, [0, 3, 6, 9, 10]);
    });
  });

  describe("compile()", () => {
    it("should generate all combinations of a simple template", () => {
      const template = compile`Hello ${["world", "universe"]}!`;
      const values = [...template];
      assert.deepEqual(values, ["Hello world!", "Hello universe!"]);
    });

    it("should handle multiple variable parts", () => {
      const template = compile`${["A", "B"]}${range(1, 2)}`;
      const values = [...template];
      assert.deepEqual(values, ["A1", "A2", "B1", "B2"]);
    });

    it("should handle non-generator expressions", () => {
      const value = "static";
      const template = compile`A ${value} value and a ${[
        "dynamic",
        "variable",
      ]} one`;
      const values = [...template];
      assert.deepEqual(values, [
        "A static value and a dynamic one",
        "A static value and a variable one",
      ]);
    });

    it("should handle complex nested templates", () => {
      const template = compile`
        {
          "color": "${["red", "green", "blue"]}",
          "size": ${range(10, 20, 5)},
          "properties": ["${["round", "square"]}", "${["solid", "hollow"]}"]
        }
      `;

      // Should generate 36 combinations (3 colors × 3 sizes × 2 shapes × 2 fills)
      assert.equal([...template].length, 36);
    });

    it("should iterate rightmost variables first", () => {
      const template = compile`${["A", "B"]} - ${["1", "2", "3"]}`;
      const values = [...template];

      // First three should be A with all numbers
      assert.deepEqual(values.slice(0, 3), ["A - 1", "A - 2", "A - 3"]);

      // Next three should be B with all numbers
      assert.deepEqual(values.slice(3), ["B - 1", "B - 2", "B - 3"]);
    });
  });
});
