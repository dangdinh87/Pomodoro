## 2024-05-22 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Icon-only buttons (like "Skip", "Music", "Settings") are a common accessibility anti-pattern in this codebase. They often rely on tooltips for sighted users but completely lack `aria-label` for screen readers, making them "unlabeled buttons" in the accessibility tree.
**Action:** When creating or modifying icon-only buttons, always enforce `aria-label` equal to the tooltip text or a descriptive action name. Use `t()` keys for consistency.
