## 2026-02-14 - Accessible Custom Progress Bars & Icon-Only Buttons
**Learning:** Custom visual indicators (like div-based progress bars or icon-only buttons) are invisible to screen readers without explicit ARIA roles and labels.
**Action:** Always wrap custom progress bars with `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and a descriptive `aria-label`. For icon-only buttons, prioritize `aria-label` over `title` for robust accessibility.
