/**
 * Step through number ranges.
 *
 * {start,end} and {start,end,step} expand to inclusive numeric ranges.
 * Whitespace inside a range body is ignored, decimals and negatives work,
 * and the end value is ALWAYS included — even when the step overshoots it.
 *
 * Run with: node examples/02-step-through-number-ranges.mjs
 */

import parse, { range, compile } from "../src/index.mjs";

console.log("-- Basic range --");
console.log([...parse("Count: {1,5}")].join(", "));
// Count: 1 ... Count: 5

console.log("\n-- With a step --");
console.log([...parse("Even: {0,10,2}")].join(", "));
// 0, 2, 4, 6, 8, 10

console.log("\n-- The end value is always included, even off-step --");
console.log([...parse("Day {7,30,7}")].join(", "));
// Day 7, Day 14, Day 21, Day 28, Day 30  <- 30 appended despite step 7

console.log("\n-- Decimals and negatives --");
console.log([...parse("{0.5,1.5,0.5}")].join(", ")); // 0.5, 1, 1.5
console.log([...parse("{-2,2}")].join(", "));        // -2 .. 2

console.log("\n-- Caution: a descending range is empty --");
// Ranges only count up. One empty pattern zeroes the whole template.
console.log(JSON.stringify([...parse("n {5,1}")])); // []

// Need a strict step grid with no appended end? Use range() with
// includeEnd = false through the compile tagged template.
console.log("\n-- Strict grid via range(start, end, step, false) --");
console.log([...compile`Day ${range(7, 30, 7, false)}`].join(", "));
// Day 7, Day 14, Day 21, Day 28
