## 2024-05-21 - Icon-Only Button Pattern
**Learning:** The project frequently uses `Button` with `size="icon"` wrapped in `Tooltip` components but consistently omits `aria-label`. This pattern relies solely on visual tooltips which are not accessible to screen reader users who can't hover.
**Action:** When encountering `Button size="icon"`, verify `aria-label` is present. If missing, map the tooltip text (often a translation key) to the `aria-label` prop.
