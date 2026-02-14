## 2024-05-23 - Custom Progress Bars & Icon Buttons

**Learning:** Custom div-based progress bars (like in `TaskItem`) are invisible to screen readers without explicit ARIA roles.
**Action:** Always add `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and a meaningful `aria-label` to custom progress components.

**Learning:** Icon-only buttons (like the Skip button in Timer) often rely on `title` for tooltips but miss `aria-label` for screen readers.
**Action:** Ensure all icon-only buttons have an explicit `aria-label` attribute, even if they have a `title`.
