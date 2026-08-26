/**
 * Reuse compiled templates and stream large spaces lazily.
 *
 * compile is a tagged template that embeds real JavaScript values —
 * arrays of choices, range() generators, plain expressions — instead of
 * string patterns, so there is no delimiter parsing (and no escaping
 * worries). Both compile`...` and parse(...) return RE-ITERABLE objects:
 * build once, walk as many times as you like, each walk lazy from the top.
 *
 * Run with: node examples/05-reuse-compiled-templates.mjs
 */

import parse, { compile, range } from "../src/index.mjs";

// Build once...
const endpoints = compile`/api/${["v1", "v2"]}/${["users", "items"]}/${range(1, 3)}`;

// ...iterate many times. Each for...of restarts the generator.
console.log("-- First pass: preview --");
let preview = 0;
for (const url of endpoints) {
  console.log(url);
  if (++preview === 3) break; // lazy — the remaining 9 are never built
}

console.log("\n-- Second pass: full walk of the same object --");
console.log([...endpoints].length, "endpoints"); // 12

// Static expressions interpolate as-is; arrays/range() become dimensions.
const host = "example.com";
const pages = compile`https://${host}/${["docs", "blog"]}?page=${range(1, 2)}`;
console.log("\n-- Mixing static values and dimensions --");
console.log([...pages].join("\n"));

// Chunked processing pattern for very large spaces: hold the iterator,
// drain N at a time, resume later without recomputing anything.
console.log("\n-- Chunked draining of a large space --");
const big = parse("{a|b|c|d|e}{a|b|c|d|e}{a|b|c|d|e}{1,100}"); // 12,500
const iterator = big[Symbol.iterator]();
const chunk = (n) => {
  const out = [];
  for (let i = 0; i < n; i++) {
    const { value, done } = iterator.next();
    if (done) break;
    out.push(value);
  }
  return out;
};
console.log("chunk 1:", chunk(3).join(", "));
console.log("chunk 2:", chunk(3).join(", ")); // resumes where chunk 1 left off
