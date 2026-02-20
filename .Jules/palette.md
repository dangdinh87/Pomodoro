## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.

## 2026-02-20 - Accessible Icon Buttons in Tooltips
**Learning:** Icon buttons with tooltips (like in `TimerSettingsDock`) often lack `aria-label`, relying incorrectly on the tooltip for screen readers. The icons inside these buttons should also be hidden from assistive technology to prevent redundant or confusing announcements.
**Action:** Add `aria-label` to the `Button` component matching the tooltip text, and `aria-hidden="true"` to the inner icon component.
