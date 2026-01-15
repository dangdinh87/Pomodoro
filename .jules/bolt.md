## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-25 - [Set vs Array Includes]
**Learning:** In `StreakTracker`, checking `history.includes(date)` inside a render loop (30+ iterations) with a growing history array causes O(N*M) complexity. Converting to `Set` reduces this to O(N).
**Action:** Always prefer `Set` for frequent existence checks, especially in render loops or recursive calculations involving historical data.
