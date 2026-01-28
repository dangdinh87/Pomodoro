## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-24 - [Testing Next.js API Routes]
**Learning:** Testing Next.js API routes with `NextResponse` in `jest-environment-jsdom` causes `ReferenceError: Response is not defined` or ignores mocks if not configured carefully. Using `/** @jest-environment node */` at the top of the test file ensures a proper Node environment where `NextResponse` works as expected, often avoiding complex polyfilling.
**Action:** Always use `@jest-environment node` for Next.js API route tests.
