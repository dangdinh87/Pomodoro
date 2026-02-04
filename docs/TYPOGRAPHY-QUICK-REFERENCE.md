# Typography & Base Components Quick Reference

## Font Usage

### Nunito (UI/Headers)
Use for buttons, labels, headings, and interactive elements.
```css
font-sans /* Automatically applies Nunito first */
font-semibold /* Recommended for buttons and headers */
```

### Be Vietnam Pro (Body Text)
Fallback for Vietnamese content and body text.
```css
font-sans /* Fallback applies if Nunito unavailable */
font-normal /* Standard weight for paragraphs */
```

### Space Grotesk (Numbers/Timer)
Use for monospace, timer display, and technical content.
```css
font-space-grotesk /* Apply explicitly for numbers */
font-mono /* Alternative monospace class */
```

## Border Radius Reference

| Class | CSS Value | Use Case |
|-------|-----------|----------|
| `rounded-sm` | `var(--radius-sm)` 0.5rem | Input fields, small buttons |
| `rounded-md` | `var(--radius)` 0.75rem | Default cards, inputs |
| `rounded-lg` | `var(--radius-lg)` 1rem | Large cards, modals |
| `rounded-xl` | `var(--radius-xl)` 1.5rem | Hero sections, featured cards |

## Shadow Palette

| Class | Effect | Use Case |
|-------|--------|----------|
| `shadow-sm` | Subtle elevation | Inputs, badges |
| `shadow-md` | Standard depth | Cards, popovers |
| `shadow-lg` | Strong depth | Modals, floating panels |
| `shadow-glow` | Primary color glow | Focus states, highlights |

## Button Styling

### Basic Button
```tsx
<Button>Default Button</Button>
/* Applies: Nunito font-semibold, px-5 py-2.5, hover lift */
```

### Focus State
```tsx
<Button>
  Focus visible: ring-2 ring-primary/20 + shadow-glow
</Button>
```

### Hover Animation
```css
hover:-translate-y-0.5  /* Lift 2px on hover */
active:translate-y-0    /* Return to normal on click */
```

## Input Styling

### Default Input
```tsx
<Input />
/* Applies: rounded-md, focus-visible:shadow-glow */
```

### Focus Appearance
```css
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
focus-visible:shadow-glow  /* Primary color glow */
```

## Component Examples

### Card with Updated Radius
```tsx
<div className="rounded-lg shadow-md p-4">
  {/* Uses --radius-lg (1rem) */}
</div>
```

### Button Stack
```tsx
<div className="flex gap-2">
  <Button size="sm">Small</Button>
  <Button>Default</Button>
  <Button size="lg">Large</Button>
  <Button size="icon">×</Button>
</div>
```

### Form with Focus Glow
```tsx
<form className="space-y-3">
  <div>
    <label>Name</label>
    <Input placeholder="Enter name" />
    {/* Focus shows green glow from --shadow-glow */}
  </div>
</form>
```

## CSS Variables

### Access in Custom Styles
```css
/* Border radius */
border-radius: var(--radius-lg);

/* Shadow with transparency */
box-shadow: var(--shadow-glow);

/* Override in dark mode */
.dark {
  --shadow-glow: 0 0 20px hsl(var(--primary) / 0.2);
}
```

## Common Patterns

### Friendly Button with Hover
```tsx
<button className="px-5 py-2.5 rounded-md font-semibold hover:-translate-y-0.5 transition-all">
  Click me
</button>
```

### Rounded Input with Glow
```tsx
<input className="rounded-md border border-input focus-visible:shadow-glow" />
```

### Card Stack
```tsx
<div className="space-y-3">
  <div className="rounded-lg shadow-md p-4">Card 1</div>
  <div className="rounded-lg shadow-md p-4">Card 2</div>
  <div className="rounded-lg shadow-md p-4">Card 3</div>
</div>
```

## Accessibility Notes

- All interactive elements have visible focus states (ring + glow)
- Hover lift effect uses transform (60 FPS)
- Font sizes maintained for readability
- Vietnamese text properly supported with fallback chain

---

For detailed information, see [Phase 02 Update Summary](./PHASE-02-UPDATE-SUMMARY.md)
