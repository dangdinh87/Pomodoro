## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.
## 2026-02-26 - Timer Accessibility
**Learning:** The timer page's icon-only buttons (Skip, Sound, Background, etc.) lacked `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always add descriptive `aria-label` to icon-only buttons, reusing localized tooltip text or hint keys where available.

## 2024-05-31 - Icon-only buttons lacking ARIA labels
**Learning:** Icon-only buttons using `<Button size="icon">` frequently lack `aria-label` attributes and screen reader hiding for their internal icons (e.g., `<X aria-hidden="true" />`). The project uses `common.close` and similar standard translation keys that should be leveraged for this purpose.
**Action:** Always inspect `<Button size="icon">` usages to verify they have accessible names and their inner SVGs are appropriately hidden from screen readers.
