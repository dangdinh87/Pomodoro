## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.
## 2026-02-26 - Timer Accessibility
**Learning:** The timer page's icon-only buttons (Skip, Sound, Background, etc.) lacked `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always add descriptive `aria-label` to icon-only buttons, reusing localized tooltip text or hint keys where available.
## 2026-02-26 - Audio Settings Horizontal Scroll Accessibility
**Learning:** The horizontal scroll container (`builtInScroll`) inside `PresetChips` uses icon-only `ChevronLeft` and `ChevronRight` buttons to navigate presets. These buttons lacked semantic context, making it confusing for screen reader users to identify their function.
**Action:** Implemented `aria-label` attributes using localized string keys (`common.scrollLeft`, `common.scrollRight`) and hid the inner SVG icons with `aria-hidden="true"`. Remember to always provide `aria-label` on any interactive control that uses only an icon for visual representation.
