## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2025-02-28 - [React.memo in Large Lists]
**Learning:** Components rendered within large lists (like `TaskItem` and `SortableTaskItem` inside `TaskList`) are highly susceptible to unnecessary re-renders when the parent component's state changes (e.g. `togglingTaskIds`). Wrapping them in `React.memo` effectively isolates them, reducing performance bottlenecks during list updates.
**Action:** When working with list items that receive stable props (or localized state like `togglingTaskIds`), wrap the individual item components in `React.memo` to prevent re-rendering the entire list when only one item changes.
