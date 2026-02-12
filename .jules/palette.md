## 2024-05-22 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like skip, play/pause, settings) are frequently implemented without `aria-label` attributes, relying only on tooltips or visual icons. This makes them inaccessible to screen reader users who might not trigger the tooltip or understand the icon's purpose.
**Action:** When implementing or refactoring icon-only buttons, always ensure an `aria-label` is present. If a translation key exists for a tooltip, reuse it for the `aria-label`.
