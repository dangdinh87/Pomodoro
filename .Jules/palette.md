## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.
## 2026-02-26 - Timer Accessibility
**Learning:** The timer page's icon-only buttons (Skip, Sound, Background, etc.) lacked `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always add descriptive `aria-label` to icon-only buttons, reusing localized tooltip text or hint keys where available.
## 2026-03-09 - Added Missing ARIA Labels for Icon-Only Buttons
**Learning:** Found that multiple icon-only buttons (especially within chat, audio settings, and background settings dialogs) were missing `aria-label` attributes, and the inner SVG icons lacked `aria-hidden="true"`, causing screen reader accessibility issues.
**Action:** Consistently apply `aria-label` attributes using the application's localization hook (e.g., `t('common.close')`, `t('common.scrollLeft')`, `t('common.scrollRight')`, `t('common.actions')`) to all icon-only buttons, and append `aria-hidden="true"` to the nested SVGs to ensure accurate parsing by assistive technologies.
