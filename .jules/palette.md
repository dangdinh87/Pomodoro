## 2024-05-23 - Icon-Only Button Accessibility Pattern
**Learning:** The `Button` component with `size="icon"` is frequently used without `aria-label` in the Timer features (`TimerControls`, `TimerSettingsDock`), relying solely on tooltips or visible icons which are inaccessible to screen readers.
**Action:** When using `Button` with `size="icon"`, always enforce `aria-label` prop usage. Check for `Tooltip` content and reuse the translation key for the `aria-label` to ensure consistency.
