## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.
## 2026-02-26 - Timer Accessibility
**Learning:** The timer page's icon-only buttons (Skip, Sound, Background, etc.) lacked `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always add descriptive `aria-label` to icon-only buttons, reusing localized tooltip text or hint keys where available.

## 2024-05-18 - Missing ARIA Labels on Icon-Only Scroll Buttons
**Learning:** Icon-only scroll buttons (like "scroll left" / "scroll right") in horizontally scrolling areas and dropdown toggle buttons are frequently missed when applying `aria-label`s, making them invisible or confusing to screen reader users.
**Action:** When working on components with dynamic scroll areas (like `preset-chips.tsx` or `youtube-pane.tsx`), actively check if the overflow navigation buttons have `aria-label` attributes.
