## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2025-02-28 - [React.memo in Large Lists]
**Learning:** Components rendered within large lists (like `TaskItem` and `SortableTaskItem` inside `TaskList`) are highly susceptible to unnecessary re-renders when the parent component's state changes (e.g. `togglingTaskIds`). Wrapping them in `React.memo` effectively isolates them, reducing performance bottlenecks during list updates.
**Action:** When working with list items that receive stable props (or localized state like `togglingTaskIds`), wrap the individual item components in `React.memo` to prevent re-rendering the entire list when only one item changes.

## 2026-03-09 - [Reduce Array Allocations]
**Learning:** Using multiple `.filter()` calls to calculate summary statistics (like `taskStats`) increases time complexity from O(N) to O(kN) and forces the creation of intermediate arrays that immediately become garbage. This overhead adds up when the calculation happens within frequently-updating components or deep dependency trees.
**Action:** When calculating multiple aggregate values over an array, prefer a single-pass `for` loop over chained or parallel `.filter()` or `.map()` calls to improve performance and reduce memory allocations.
