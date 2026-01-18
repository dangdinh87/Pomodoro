## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-24 - [StreakTracker Optimization]
**Learning:** `StreakTracker` component (`src/components/focus/streak-tracker.tsx`) used `includes()` (O(N)) inside a loop for rendering calendar days, which is O(N*M). This is inefficient as history grows. `StreakTracker` uses `localStorage` directly, not the API.
**Action:** When optimizing calendar/list rendering, always prefer `Set` lookups (O(1)) over Array `includes()` (O(N)). Also, ensure tests are added to verify behavior, especially when refactoring logic. Note: `StreakTracker` might need migration to API later.
