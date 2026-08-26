/**
 * Echo earlier choices with back references.
 *
 * {$n} repeats the value chosen by the n-th real pattern (0-based, counting
 * only non-back-reference patterns, left to right). Back references do NOT
 * multiply the combination count — they echo choices already made.
 *
 * Run with: node examples/03-echo-choices-with-backrefs.mjs
 */

import parse, { count } from "../src/index.mjs";

console.log("-- Basic back reference --");
for (const s of parse("The {blue|straw|rasp}berries taste like {$0}berries")) {
  console.log(s);
}
// 3 results, not 9 — {$0} echoes the first pattern's value

console.log("\n-- count() ignores back references --");
console.log(count("The {a|b}berries taste like {$0}berries")); // 2, not 4

console.log("\n-- Works with ranges too --");
for (const s of parse("Number {1,3} doubled is {$0} * 2")) {
  console.log(s);
}

console.log("\n-- Multiple patterns: indices skip the back references --");
for (const s of parse("The {red|blue} {box|circle} is a {$0} {$1}.")) {
  console.log(s);
}

console.log("\n-- Edge cases --");
// Invalid index -> left literally in the output
console.log([...parse("Pick {a|b}, not {$5}")][0]); // "Pick a, not {$5}"
// $ outside a standalone {$n} body is plain text
console.log([...parse("Price: ${10|20}, ref {$0}")][0]); // "Price: $10, ref 10"

console.log("\n-- Custom marker --");
for (const s of parse("{red|blue} is {@0}", { backReferenceMarker: "@" })) {
  console.log(s);
}
