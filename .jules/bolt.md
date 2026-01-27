## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` appears in `package.json` but `grep` found no usage in `src`. It might be a candidate for removal to reduce install time/size, but requires careful checking of non-standard usage (e.g. dynamic imports or usage in scripts).
**Action:** When looking for heavy dependencies to prune, verify usage of `svg-dotted-map`.

## 2024-05-24 - [Jest Configuration Typos]
**Learning:** `jest.config.js` contained `moduleNameMapping` instead of `moduleNameMapper`, causing "Unknown option" warnings. This is a common typo that allows tests to run but fails path mapping silently or noisily.
**Action:** When diagnosing test environment warnings, verify configuration keys against official documentation.
