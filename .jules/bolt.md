## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-24 - [Conditional Hooks Anti-Pattern]
**Learning:** Found critical React violation in `TaskManagement.tsx`: hooks like `useTasksStore` are called after conditional returns for auth checks. This crashes the app on auth state transitions.
**Action:** Always verify hook order in this codebase; prefer splitting components (Container/Presenter) to handle loading states safely.

## 2024-05-24 - [O(N^2) Date Lookups]
**Learning:** `StreakTracker` used `history.includes(date)` inside a loop over days, creating O(N*M) complexity. For sets of dates (history), always use `Set` for O(1) lookups to avoid frame drops during rendering.
**Action:** When working with date collections in render loops, check for array vs Set usage.
