# Agent playbook

`@johnhenry/spintax` -- a combinatorial string generation library: expands
`{choice|choice}` and `{start,end,step}` range patterns into every
combination, lazily via JS iterators. Single package, Node >= 26, `node --test`
(`npm test`), ships source (no build step -- `main` points straight at
`src/index.mjs`).

`CLAUDE.md` in this directory is a symlink to this file.

## The verification loop (before every push)

1. `npm test` -- `node --test`, covering parsing, ranges, back references,
   `count`/`choose`, and a perf test guarding against the exponential blowup
   this library's own docs warn about (`test/perf.test.mjs`).
2. `npm run examples` -- runs every numbered example in `examples/` against
   the actual published API; each one is self-verifying (asserts and exits
   non-zero on failure), not just a demo script.
3. A genuinely fresh clone:
   `git clone . /tmp/spintax-verifyN && cd $_ && npm ci && npm test`.
   Catches missing entries in `package.json`'s `files` array or undeclared
   deps that a checked-out tree hides.
4. Commit, push, close the issue with a comment naming the commit SHA.

CI (`.github/workflows/test.yml`) runs the same test suite; match it locally
before pushing.

## Repo-specific gotchas

- **Braces are structural everywhere and have no escape syntax.** A
  JSON-shaped template mangles its own `{`/`}` unless the caller passes
  custom `patternStart`/`patternEnd` delimiters (see README's "Configuration
  Generation" example). There is no way to escape a literal brace with the
  default delimiters -- this is a design constraint, not a bug to fix.
- **Whitespace is preserved inside choice patterns, ignored inside range
  patterns.** `{option1 |option2}` and `{option1|option2}` produce different
  first options; `{ 1, 5 }` and `{1,5}` do not differ. A "fix" that
  normalizes whitespace in one direction breaks a documented, tested
  distinction in the other.
- **`count`/`choose` exist specifically to avoid materializing huge
  combination spaces.** A change that internally expands a template (even
  temporarily) before counting or picking defeats the reason those functions
  exist; `test/perf.test.mjs` is the regression guard.

## Definition of done

A change is done when all of the following hold, not just when tests pass:
- A regression test exists for any bug fixed.
- Anything the feature does **not** do is stated in the README, not only in
  an issue comment.
- `CHANGELOG.md` has an entry, added in the same PR as any version bump --
  not left under an `[Unreleased]` heading past the PR that merges it.
- If the change affects `examples/`, `examples/README.md`'s table is updated
  to match.

## Non-goals

Escaping braces with a backslash or similar in the default delimiter set is
deliberately not supported -- the custom-delimiter escape hatch
(`patternStart`/`patternEnd`) already covers the one real case (JSON-shaped
templates) without adding a second parsing mode to the core grammar.

## Releases

Bump `version` in `package.json` in a PR, add the `CHANGELOG.md` entry, merge,
then `gh release create v<version>` -- the release event triggers
`.github/workflows/publish.yml`, which is idempotent (skips if the version is
already on npm).
