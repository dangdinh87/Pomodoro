## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-24 - [React Hook Ordering]
**Learning:** `TaskManagement` had hooks called after early returns (`if (isAuthLoading) return null`). This violates React Rules of Hooks but might have gone unnoticed.
**Action:** When refactoring components, always check for conditional returns before hooks and move hooks to the top level.
