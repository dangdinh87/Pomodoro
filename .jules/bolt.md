## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-24 - [Jest Configuration Typos]
**Learning:** `jest.config.js` had `moduleNameMapping` instead of `moduleNameMapper`, causing tests to fail with `Cannot find module 'next/jest'` (or similar path resolution errors).
**Action:** Always verify `jest.config.js` property names against Jest documentation or `next/jest` examples.

## 2024-05-24 - [Optimizing Render Loops]
**Learning:** `Array.includes` inside a render loop (like `gridDays` in `StreakTracker`) is O(N) per iteration. For calendar grids (M items), this becomes O(M*N). Converting to `Set` (O(N) once) allows O(1) lookups, reducing complexity to O(M).
**Action:** When working with existence checks in loops, always prefer `Set` over `Array.includes` if the data is static for the duration of the loop.
