## 2026-02-16 - Radix UI Progress Accessibility
**Learning:** Default implementations of the `Progress` component (often from shadcn/ui or similar) may fail to pass the `value` prop to `ProgressPrimitive.Root`. This causes the component to render with `data-state="indeterminate"` and missing `aria-valuenow` attributes, breaking accessibility compliance even if visually correct.
**Action:** When using or auditing `Progress` components built with Radix UI, always verify that `value={value}` is explicitly passed to the `Root` element.
