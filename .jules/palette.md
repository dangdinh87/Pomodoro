## 2024-05-22 - Missing Value Prop in Radix Wrappers
**Learning:** Radix UI primitives like `Progress` need the `value` prop passed to the Root component to correctly set `aria-valuenow`. Wrapping components must explicitly pass this prop if they destructure it.
**Action:** When wrapping Radix primitives, check if props like `value` or `checked` need to be passed to the Root element for accessibility state.
