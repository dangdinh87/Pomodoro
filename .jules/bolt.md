## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-24 - [Jest Configuration Trap]
**Learning:** `jest.config.js` property for path aliases is `moduleNameMapper`, not `moduleNameMapping`. The incorrect name caused `unknown option` warnings and module resolution failures that were hard to debug because `next/jest` was involved.
**Action:** Always verify `jest.config.js` property names against official documentation, especially when migrating or copying configs.
