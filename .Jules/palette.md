## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.
## 2026-02-26 - Timer Accessibility
**Learning:** The timer page's icon-only buttons (Skip, Sound, Background, etc.) lacked `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always add descriptive `aria-label` to icon-only buttons, reusing localized tooltip text or hint keys where available.

## 2025-02-17 - Accessible Custom List Items
**Learning:** Custom list items functioning as buttons (e.g., clickable cards or rows using `onClick` on a `div`) lack proper keyboard accessibility and semantics.
**Action:** When a UI element acts as a button, it must be rendered as a `<button>` tag (or have `role="button"`, `tabIndex={0}`, and `onKeyDown`) and include proper `focus-visible` styles to ensure it can be navigated via the keyboard and read correctly by screen readers.
