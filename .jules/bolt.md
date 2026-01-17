## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2025-05-27 - [List Virtualization & State Stability]
**Learning:** `TaskItem` re-renders were caused not just by missing `memo`, but by unstable callbacks in `TaskManagement`. Zustand's `useStore.getState()` pattern allows handlers to access fresh state without being recreated, enabling stable props for memoized children.
**Action:** When optimizing lists involving Zustand state, prefer `getState()` in handlers over reactive hook subscriptions if the handler logic is the only consumer of that state.
