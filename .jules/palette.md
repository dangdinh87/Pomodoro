## 2025-05-21 - Timer Controls Accessibility
**Learning:** Icon-only buttons in the Timer components (`TimerControls`, `TimerSettingsDock`) relied solely on `title` or `Tooltip` for description. This fails WCAG criteria for screen reader users who cannot hover.
**Action:** When creating icon-only buttons, always include `aria-label` with the same or more descriptive text as the tooltip, using `t()` for localization.
