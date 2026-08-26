/**
 * Count and pick without expanding the full combination space.
 *
 * Patterns multiply: ten four-option choices is 4^10 = 1,048,576 strings.
 * count() computes that product from pattern sizes alone, and choose()
 * builds specific (or random) combinations directly — neither expands the
 * cross product, so both stay fast no matter how large the space is.
 *
 * Run with: node examples/04-count-and-pick-without-expanding.mjs
 */

import { count, choose } from "../src/index.mjs";

// count() is the safe pre-flight check before [...parse(t)]
console.log("-- How big is this template? --");
console.log(count("/api/v{1,3}/{users|items}/{1,100}")); // 600
console.log(count("{a|b|c|d} ".repeat(10))); // 1048576 — instant

// choose() returns a picker: positional 0-based indices, one per pattern,
// in left-to-right order. Iteration order guarantees make these stable.
console.log("\n-- Deterministic picks --");
const pick = choose("Count: {1,5} {A|B|C}");
console.log(pick(0, 0)); // "Count: 1 A"
console.log(pick(1, 2)); // "Count: 2 C"
console.log(pick(4, 1)); // "Count: 5 B"

// Omit indices (or pass undefined) for random slots
console.log("\n-- Random sampling from a huge space --");
const sample = choose("{tiny|small|large|huge} {red|green|blue} #{1,1000}");
console.log("space size:", count("{tiny|small|large|huge} {red|green|blue} #{1,1000}"));
for (let i = 0; i < 3; i++) {
  console.log(sample());
}

// Caution: indices are not validated — out-of-range gives "undefined"
console.log("\n-- Out-of-range index --");
console.log(choose("Hi {a|b}")(5)); // "Hi undefined"
