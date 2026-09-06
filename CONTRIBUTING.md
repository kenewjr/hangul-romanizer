# Contributing

## Setup

```bash
npm install
npm test
npm run typecheck
npm run lint
```

## Rule changes

1. Keep transformations on decomposed jamo, never post-process Latin strings.
2. Add generic Korean words only; do not use identifiable copyrighted lyric excerpts.
3. Add focused tests under `test/rules/` and an integration expectation when output changes.
4. Preserve alignment invariants and non-Hangul passthrough.
5. Keep rule-engine/decomposition per-file coverage at 90% or higher.

## Pull requests

Run all checks before opening a pull request:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run pack:check
```
