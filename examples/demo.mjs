/**
 * Demo showcasing spintax functionality
 *
 * Run with: node examples/demo.mjs
 */

import { compile, range, parse } from "../src/index.mjs";

// Basic example - Simple choices
console.log("DEMO 1: Basic choices");
console.log("===================");

const colors = compile`The color is ${["red", "green", "blue"]}.`;
for (const color of colors) {
  console.log(color);
}

console.log("\nDEMO 2: Numerical ranges");
console.log("===================");

const counts = compile`Item #${range(1, 5)}`;
for (const count of counts) {
  console.log(count);
}

console.log("\nDEMO 3: Numerical ranges with step and includeEnd");
console.log("============================================");

const steppedCounts = compile`Item #${range(0, 10, 3, true)}`;
for (const count of steppedCounts) {
  console.log(count);
}

console.log("\nDEMO 4: Multiple variables (right-to-left iteration)");
console.log("===============================================");

const products = compile`${["Shirt", "Pants"]} - Size ${["S", "M", "L"]}`;
for (const product of products) {
  console.log(product);
}

console.log("\nDEMO 5: Parse function with range syntax");
console.log("==================================");

const parsedRange = parse("Number: {1,5}");
for (const item of parsedRange) {
  console.log(item);
}

console.log("\nDEMO 6: Parse function with choices syntax");
console.log("===================================");

const parsedChoices = parse("Color: {red|green|blue}");
for (const item of parsedChoices) {
  console.log(item);
}

console.log("\nDEMO 7: Parse function with multiple variables");
console.log("=======================================");

const parsedMultiple = parse("{Shirt|Pants} size {S|M|L}");
for (const item of parsedMultiple) {
  console.log(item);
}

console.log("\nDEMO 8: Parse function with complex patterns");
console.log("======================================");

const parsedComplex = parse("Product {A|B}-{1,5,2}");
for (const item of parsedComplex) {
  console.log(item);
}

console.log("\nDEMO 9: Parse function with JSON-like structure");
console.log("=========================================");

const parsedJson = parse(
  '{"type": "{basic|premium}", "level": {1,3}, "active": {true|false}}'
);

for (const item of parsedJson) {
  console.log(item);
}

console.log("\nDEMO 10: Parse function for URL generation");
console.log("====================================");

const urls = parse("https://example.com/{products|users}/{1,5}");
for (const url of urls) {
  console.log(url);
}

console.log("\nDEMO 11: Back References");
console.log("====================================");

const str = parse("{1,5} {0|2|4} {$0} {$1}");
for (const url of str) {
  console.log(url);
}
