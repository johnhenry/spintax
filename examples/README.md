# Examples

Run any example directly (`node examples/01-generate-every-variation.mjs`)
or run them all with `npm run examples` from the repo root.

| Example | Shows |
| --- | --- |
| [01-generate-every-variation.mjs](./01-generate-every-variation.mjs) | Basic `parse` usage, cross products, guaranteed rightmost-first iteration order, whitespace-in-choices gotcha |
| [02-step-through-number-ranges.mjs](./02-step-through-number-ranges.mjs) | Ranges with steps, decimals, negatives, the always-included end value, the empty descending-range trap |
| [03-echo-choices-with-backrefs.mjs](./03-echo-choices-with-backrefs.mjs) | `{$n}` back references, why they don't multiply `count()`, invalid-reference behavior, custom markers |
| [04-count-and-pick-without-expanding.mjs](./04-count-and-pick-without-expanding.mjs) | `count` and `choose` on huge combination spaces without materializing them |
| [05-reuse-compiled-templates.mjs](./05-reuse-compiled-templates.mjs) | The `compile` tagged template, re-iterable template objects, lazy chunked draining |
| [demo.mjs](./demo.mjs) | Kitchen-sink tour of the whole API (`npm run demo`) |
