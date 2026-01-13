## 2024-05-22 - DottedMap Optimization
**Learning:** The `DottedMap` component re-calculates thousands of points via `svg-dotted-map` on every render. This is computationally expensive (O(N)) and blocks the main thread.
**Action:** Always memoize expensive third-party library computations like `createMap` and wrap the component in `React.memo` to avoid unnecessary re-renders from parent updates.
