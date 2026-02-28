## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.
## 2026-02-28 - Added missing ARIA labels to icon-only buttons
**Learning:** Found several icon-only buttons lacking accessible `aria-label`s across `global-chat.tsx`, `preset-chips.tsx`, and `focus-mode.tsx`. Screen readers would announce these as simply 'button' or read out raw SVGs.
**Action:** When creating or reviewing icon-only buttons (like `<Button size="icon">`), always ensure an `aria-label` or visually hidden text is included to describe the button's action (e.g., 'Close chat', 'Scroll left', 'Add blocked website').
