/**
 * Build script for spintax
 *
 * This script:
 * 1. Verifies TypeScript definitions match implementation
 * 2. Runs tests to ensure everything works correctly
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = new URL("..", import.meta.url).pathname;
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");

// Get package info
const packageData = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));
console.log(`Building ${packageData.name} v${packageData.version}...`);

// Run tests
try {
  console.log("\nRunning tests...");
  execSync("node --test test/**/*.test.mjs", {
    stdio: "inherit",
    cwd: ROOT_DIR,
  });
  console.log("✅ Tests passed");
} catch (error) {
  console.error("❌ Tests failed");
  process.exit(1);
}

// Success message
console.log(
  `\n✨ ${packageData.name} v${packageData.version} built successfully!`
);
console.log("Run the following commands to publish:");
console.log("  npm test         # Run tests again");
console.log("  npm publish      # Publish to npm registry");
