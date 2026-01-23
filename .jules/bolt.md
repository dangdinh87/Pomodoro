## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2026-01-23 - [Optimization & Config]
**Learning:** `StreakTracker` used `Array.includes` inside a render loop (O(N*M)), enabling optimization via `Set` (O(M)). Also, `jest.config.js` required `moduleNameMapper` instead of `moduleNameMapping` to avoid warnings.
**Action:** Use `Set` for frequent lookups in components. Ensure `moduleNameMapper` is used for Jest path aliases.
