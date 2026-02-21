## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** The app frequently uses icon-only buttons (e.g., Edit, Delete, More Actions) without `aria-label` attributes. This makes the app difficult to navigate for screen reader users.
**Action:** Always add descriptive `aria-label` props to icon-only `Button` components, especially in list views where multiple similar buttons exist. Use dynamic labels (e.g., "Edit task [Task Name]") for context.

## 2025-02-24 - Redundant Icon Announcements
**Learning:** Screen readers may announce icon names (e.g., "skip-forward") or "graphic" even when the parent button has an `aria-label`, causing redundant or confusing output (e.g., "Skip session, skip-forward graphic").
**Action:** Always add `aria-hidden="true"` to decorative icon components (like `lucide-react` icons) inside buttons that already have a descriptive `aria-label` or text content.
