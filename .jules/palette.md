## 2026-02-16 - Accessibility of Progress Indicators
**Learning:** Custom `div`-based progress bars (like in `TaskItem`) lack ARIA roles and attributes, making them invisible to screen readers.
**Action:** Use the Design System's `Progress` component (`@/components/ui/progress`) which wraps Radix UI primitives for built-in accessibility, ensuring `aria-label` is provided.
