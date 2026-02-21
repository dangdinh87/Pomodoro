## 2025-05-23 - Timer Controls Accessibility
**Learning:** Icon-only buttons in the timer controls (specifically the Skip button) were missing accessible labels, and decorative icons were not hidden from screen readers. This makes the interface confusing for screen reader users.
**Action:** Always ensure icon-only buttons have a localized `aria-label` and the inner icon has `aria-hidden="true"` to prevent redundant announcements.
