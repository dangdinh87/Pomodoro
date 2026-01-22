## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-24 - [Set vs Array in Render Loops]
**Learning:** `StreakTracker` was using `array.includes()` inside a render loop (iterating over days of the month). For components with potential large datasets (like years of history), this becomes O(N*M). Swapping to `Set.has()` reduces this to O(M) and is a simple win.
**Action:** Look for `includes()` calls inside `map()` or `for` loops in render logic and memoize them into a `Set` if the dataset is potentially large.
