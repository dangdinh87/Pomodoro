## 2026-02-11 - Icon-Only Buttons in Data Tables
**Learning:** Dense data tables often rely on icon-only buttons for actions like "Edit", "Delete", or "More Actions". Without explicit `aria-label`, these buttons are completely opaque to screen reader users, even if tooltips are present for mouse users.
**Action:** Always add `aria-label` to icon-only buttons. Use dynamic labels (e.g., "Mark as incomplete" vs "Mark as complete") to provide clear context about the button's function and current state.
