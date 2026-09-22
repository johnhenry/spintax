# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

<!-- Deliberately not relabeled to a dated `## <version>` heading in this
     retrofit: the family CHANGELOG standard ties a dated entry to a version
     bump in the same PR (adopt-library, templates/CHANGELOG.md rule 1), and
     bumping `package.json`'s `version` is a release decision, not a
     documentation-formatting one -- out of scope for this PR. The content
     below (PR #6) is already merged to `main`; only the version bump that
     would retitle this section as a dated release is outstanding. -->

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

## 0.0.0 -- npm scope migration (2026-08-25)

Previously published as `spintax`, last unscoped version `1.1.2` (now
deprecated). Renamed to `@johnhenry/spintax` and restarted the version line
at 0.0.0 on import into the @johnhenry family — a new address and era, not a
maturity signal. The API is unchanged from `1.1.2`.

- Added CI (test matrix on Node 20/22/24) and a release-triggered npm
  publish workflow with provenance. Fixed in 4b64db6 (#5).
