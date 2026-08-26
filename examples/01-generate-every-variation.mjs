/**
 * Generate every variation of a template.
 *
 * `parse` (the default export) turns a template with {...} patterns into a
 * lazy iterable of every combination. Nothing is generated until you
 * iterate, and iteration order is guaranteed: the rightmost pattern varies
 * fastest (odometer order).
 *
 * Run with: node examples/01-generate-every-variation.mjs
 */

import parse from "../src/index.mjs";

// A single choices pattern — one output per option
console.log("-- Choices --");
for (const s of parse("Hello, {world|friend|universe}!")) {
  console.log(s);
}
// Hello, world!
// Hello, friend!
// Hello, universe!

// Multiple patterns multiply: 2 sizes x 2 shapes x 2 colors = 8 strings,
// with the rightmost pattern cycling first.
console.log("\n-- Cross product (rightmost varies fastest) --");
for (const s of parse("{small|large} {box|circle} in {red|blue}")) {
  console.log(s);
}

// Whitespace rule: choices keep whitespace as part of the option.
// "{A |B}" yields "A " (trailing space) — don't pad choice lists.
console.log("\n-- Whitespace is part of a choice --");
console.log(JSON.stringify([...parse("x{A |B}y")]));
// ["xA y","xBy"]
