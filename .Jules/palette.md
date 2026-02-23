## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.

## 2025-05-30 - Delightful Empty States
**Learning:** Users are more likely to engage with a feature if the empty state provides a clear call-to-action and a friendly visual (mascot) rather than just "No data" text.
**Action:** Replace plain text empty states with the `EmptyState` component and include a primary action button (e.g. "Create Task") whenever possible.
