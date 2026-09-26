# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## 0.0.1 -- 2026-09-26

### Added

- Numbered runnable examples (`examples/01`–`05`) covering generation,
  ranges and steps, back references, `count`/`choose` without expansion,
  and `compile` template reuse, with an index in `examples/README.md`.
  Fixed in f7ffafc (#6).
- `npm run examples` script that runs every numbered example, wired into CI
  as a smoke step. Fixed in f7ffafc (#6).
- This changelog. Fixed in f7ffafc (#6).
- Documentation section at
  [opensource.johnhenry.me/spintax](https://opensource.johnhenry.me/spintax/).
  Fixed in f7ffafc (#6).

### Fixed

- README: CDN import URLs now point at the scoped `@johnhenry/spintax`
  package instead of the deprecated unscoped `spintax@1.1.2`. Fixed in
  f7ffafc (#6).
- README: the configuration-generation example now uses custom delimiters
  (`patternStart`/`patternEnd`) — with the default braces, JSON-shaped
  templates are mangled because `{`/`}` are structural and have no escape.
  Fixed in f7ffafc (#6).
- `types.d.ts`: added a top-level `export default parse;` so
  `import parse from '@johnhenry/spintax'` type-checks — it previously only
  declared a default export inside an ambient `declare module "spintax"`
  block for the old, unscoped package name, so TypeScript reported TS1192
  ("Module has no default export"). Also removed that now-redundant
  `declare module "spintax"` block (nothing in this repo or its docs
  resolves the package under the old unscoped name), and replaced the
  phantom `chooseResult` value export — it was declared as a real function
  export in `types.d.ts` but never existed as a runtime export in
  `src/index.mjs`, and was also misused as a type annotation, which was
  itself a TS2749 error — with a proper `ChooseResult` type alias used only
  as the return type of `choose()`. Fixes #12.

## 0.0.0 -- npm scope migration (2026-08-25)

Previously published as `spintax`, last unscoped version `1.1.2` (now
deprecated). Renamed to `@johnhenry/spintax` and restarted the version line
at 0.0.0 on import into the @johnhenry family — a new address and era, not a
maturity signal. The API is unchanged from `1.1.2`.

- Added CI (test matrix on Node 20/22/24) and a release-triggered npm
  publish workflow with provenance. Fixed in 4b64db6 (#5).
