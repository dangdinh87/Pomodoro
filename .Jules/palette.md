## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.
## 2026-02-26 - Timer Accessibility
**Learning:** The timer page's icon-only buttons (Skip, Sound, Background, etc.) lacked `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always add descriptive `aria-label` to icon-only buttons, reusing localized tooltip text or hint keys where available.
## 2024-05-24 - Accessible Close/Scroll Icon-Only Buttons
**Learning:** Icon-only buttons (using `size="icon"`) often lack descriptive labels, hurting accessibility for screen readers. Using `aria-label={t("translation.key")}` on the button and `aria-hidden="true"` on the inner SVG icon fixes this.
**Action:** Always verify that `<Button size="icon">` implementations include descriptive, translated `aria-label` attributes and hide the decorative SVG using `aria-hidden="true"`.
