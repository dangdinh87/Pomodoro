## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-24 - [React Memoization Verification]
**Learning:** When verifying `React.memo` optimizations with Jest mocks, a non-memoized mock function will still be called by the parent re-render even if props are stable. To verify optimization, either use a memoized mock or inspect the *props* of the subsequent calls to confirm they are referentially identical to the previous call.
**Action:** When testing optimization prevents re-renders, verify prop stability if using simple mocks.
