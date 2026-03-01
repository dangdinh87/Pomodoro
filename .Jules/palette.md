## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.

## 2024-11-20 - [Menu Toggle Accessibility]
**Learning:** Common layout elements like mobile menu toggles often lack accessible names when they use icon-only designs (like the `Menu` or `X` from `lucide-react`). Additionally, they should use `aria-expanded` and `aria-controls` to communicate state and relationships to screen readers.
**Action:** Always verify that layout toggle buttons have descriptive `aria-label` attributes (localized via `t()`) and include ARIA state attributes like `aria-expanded` and `aria-controls` where applicable.
