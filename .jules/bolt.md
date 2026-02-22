## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-24 - [Zustand Performance]
**Learning:** React components subscribing to frequently changing store properties (like `timeLeft` in a timer) will re-render on every tick.
**Action:** To optimize, extract pure logic into utility functions and use selectors that return derived values (e.g., `clockColor`) which change less frequently. Use `useStore.getState()` inside event handlers to avoid subscriptions entirely for values only needed during interactions.
