# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Numbered runnable examples (`examples/01`–`05`) covering generation,
  ranges and steps, back references, `count`/`choose` without expansion,
  and `compile` template reuse, with an index in `examples/README.md`
- `npm run examples` script that runs every numbered example, wired into CI
  as a smoke step
- This changelog
- Documentation section at
  [opensource.johnhenry.me/spintax](https://opensource.johnhenry.me/spintax/)

### Fixed

- README: CDN import URLs now point at the scoped `@johnhenry/spintax`
  package instead of the deprecated unscoped `spintax@1.1.2`
- README: the configuration-generation example now uses custom delimiters
  (`patternStart`/`patternEnd`) — with the default braces, JSON-shaped
  templates are mangled because `{`/`}` are structural and have no escape

## [0.0.0] - 2026-08-25

### Changed

- Renamed from `spintax` to `@johnhenry/spintax` and restarted the version
  line at 0.0.0 on import into the @johnhenry family — a new address and
  era, not a maturity signal. The last unscoped release was `spintax@1.1.2`
  (now deprecated); the API is unchanged from that release.
- Added CI (test matrix on Node 20/22/24) and a release-triggered npm
  publish workflow with provenance
