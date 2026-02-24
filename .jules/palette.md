## 2024-05-23 - Task Empty State
**Learning:** Found an inconsistency where the Task list used a plain div for empty state, while `EmptyState` component existed in the system.
**Action:** Always check for existing UI components like `EmptyState` before implementing custom empty states, and ensure action buttons are provided for user recovery/action.
