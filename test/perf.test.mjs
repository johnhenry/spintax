import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { count, parse, range, compile } from "../src/index.mjs";

// These are regression tests for the algorithmic-DoS fix tracked in
// https://github.com/johnhenry/spintax/issues/7 — count() and
// cartesianProduct() (exercised here via parse()) used to eagerly
// materialize entire ranges into arrays before doing what should be O(1)
// or lazy work. A huge (attacker-controlled) range bound could previously
// force multi-hundred-millisecond stalls and hundreds of MB of allocation.
//
// Wall-clock time is used as the observable proxy for "did this avoid
// enumerating N values" — a bound of well under 100ms is only reachable if
// the implementation is doing O(1)/lazy work rather than O(N) enumeration,
// since actually iterating tens or hundreds of millions of values takes
// far longer than that (as demonstrated by the pre-fix ~558ms/~900ms
// measurements in the linked issue).
//
// Warm up the functions once before any timed assertion below, so the
// timings reflect steady-state cost rather than one-off module
// evaluation / JIT warm-up noise (which can otherwise make an O(1)
// operation look like it took tens of milliseconds on a cold start).
count("Number: {1,5}");
[...parse("A {1,3} B {1,3}")].length;

describe("count() performance", () => {
  it("computes the size of a huge range analytically (no enumeration)", () => {
    const start = performance.now();
    const result = count("Number: {1,100000000}");
    const elapsed = performance.now() - start;

    assert.equal(result, 100000000);
    assert.ok(
      elapsed < 100,
      `count() on a 100,000,000-element range took ${elapsed}ms; expected well under 100ms`
    );
  });

  it("computes the size of a huge stepped range analytically", () => {
    const start = performance.now();
    const result = count("Number: {1,100000000,2}");
    const elapsed = performance.now() - start;

    // range()'s default includeEnd=true explicitly appends the end value
    // when the step doesn't land on it exactly (stepping 1, 3, 5, ... by 2
    // never reaches the even number 100000000), so this is the 50,000,000
    // stepped values (1, 3, 5, ..., 99999999) plus the explicit end value:
    // 50000001 total. This matches RangeGenerator's enumeration semantics
    // (see the "should include end value when requested" test in
    // basic.test.mjs).
    assert.equal(result, 50000001);
    assert.ok(
      elapsed < 100,
      `count() on a stepped 100,000,000-bound range took ${elapsed}ms; expected well under 100ms`
    );
  });

  it("still multiplies range and choice pattern sizes correctly", () => {
    assert.equal(count("Count: {1,100000000} {A|B|C}"), 300000000);
  });
});

describe("RangeGenerator.size()", () => {
  it("matches enumeration for small ranges, including step edge cases", () => {
    const cases = [
      [1, 5, 1],
      [0, 10, 2],
      [0, 10, 3],
      [1, 1, 1],
      [5, 1, 1], // start > end, positive step => empty
      [0.5, 1.5, 0.5],
    ];
    for (const [start, end, step] of cases) {
      const gen = range(start, end, step);
      const enumerated = [...gen.values()].length;
      assert.equal(
        gen.size(),
        enumerated,
        `size() mismatch for range(${start}, ${end}, ${step})`
      );
    }
  });

  it("returns 0 for an empty range (start beyond end, positive step)", () => {
    assert.equal(range(10, 1, 1).size(), 0);
  });
});

describe("cartesianProduct laziness (via parse/compile)", () => {
  it("gets the first combination from two huge ranges without materializing them", () => {
    const start = performance.now();
    const iterator = parse(
      "A {1,2000000} B {1,2000000}"
    )[Symbol.iterator]();
    const { value, done } = iterator.next();
    const elapsed = performance.now() - start;

    assert.equal(done, false);
    assert.equal(value, "A 1 B 1");
    // The pre-fix implementation measured ~900ms/~216MB RSS for this exact
    // scenario (see issue #7); 150ms leaves comfortable margin above
    // observed steady-state timings (consistently single-digit ms locally)
    // while remaining far below what any eager enumeration could achieve.
    assert.ok(
      elapsed < 150,
      `Getting the first combination out of two 2,000,000-element ranges took ${elapsed}ms; expected well under 150ms`
    );
  });

  it("gets the first few combinations from huge ranges without materializing them", () => {
    const start = performance.now();
    const iterator = parse(
      "A {1,2000000} B {1,2000000}"
    )[Symbol.iterator]();
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(iterator.next().value);
    }
    const elapsed = performance.now() - start;

    assert.deepEqual(results, [
      "A 1 B 1",
      "A 1 B 2",
      "A 1 B 3",
      "A 1 B 4",
      "A 1 B 5",
    ]);
    // Same rationale as above; a slightly larger bound to absorb scheduler
    // noise from doing 5 pulls instead of 1, while staying an order of
    // magnitude below the pre-fix ~900ms baseline.
    assert.ok(
      elapsed < 300,
      `Getting the first 5 combinations out of two 2,000,000-element ranges took ${elapsed}ms; expected well under 300ms`
    );
  });

  it("only pulls as many values from a custom generator as are actually visited", () => {
    // A CartesianGenerator-shaped object that counts how many values it has
    // produced, so we can assert cartesianProduct (exercised here via
    // compile()) isn't over-pulling beyond what's needed to yield the
    // requested combinations.
    let pulled = 0;
    const trackedGenerator = {
      values: function* () {
        for (let i = 0; i < 1000000; i++) {
          pulled++;
          yield i;
        }
      },
    };

    const template = compile`Value: ${trackedGenerator} / ${["x", "y"]}`;
    const iterator = template[Symbol.iterator]();

    // Pull only the first 3 combinations.
    iterator.next();
    iterator.next();
    iterator.next();

    // With the ["x", "y"] generator as the fastest-varying (rightmost)
    // position, 3 combinations require the tracked generator (leftmost)
    // to have produced at most 2 values (index 0 for the first two
    // combinations, index 1 for the third) — nowhere near the full
    // 1,000,000-element range.
    assert.ok(
      pulled <= 2,
      `Expected at most 2 values pulled from the tracked generator, got ${pulled}`
    );
  });
});
