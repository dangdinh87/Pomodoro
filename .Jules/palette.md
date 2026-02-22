## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.

## 2026-02-22 - Game Controls Accessibility
**Learning:** In-game controls (like directional arrows) implemented as HTML overlays often lack accessible names, making games unplayable for screen reader users.
**Action:** Ensure all game control buttons have descriptive `aria-label` attributes (e.g., "Move Up", "Restart Game"), localized where possible, even if the button only contains an icon.
