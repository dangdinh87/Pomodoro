## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.
## 2026-02-26 - Timer Accessibility
**Learning:** The timer page's icon-only buttons (Skip, Sound, Background, etc.) lacked `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always add descriptive `aria-label` to icon-only buttons, reusing localized tooltip text or hint keys where available.
## 2024-05-23 - Accessibility for responsively hidden text
**Learning:** Buttons with text hidden on small screens using classes like `hidden sm:inline` become icon-only buttons on mobile devices. Because `hidden` sets `display: none`, the text is completely removed from the accessibility tree, leaving screen readers with no label.
**Action:** Always provide an `aria-label` for buttons where the text may be responsively hidden, ensuring it remains accessible across all viewport sizes.
