# Neon/Cyberpunk Clock Animation Techniques Research

**Research Date:** 2026-02-06
**Focus:** Production-ready React/SVG/CSS animation techniques for neon clock UI

---

## 1. SVG Neon Glow Techniques

### Comparison Matrix

| Technique | Performance | Quality | Complexity | Use Case |
|-----------|------------|---------|------------|----------|
| **CSS `filter: drop-shadow()`** | Best | Good | Low | Simple glows, external SVG |
| **SVG `<feGaussianBlur>` + merge** | Moderate | Excellent | Medium | Layered neon effects |
| **Multiple strokes** | Best | Moderate | Low | Static neon outlines |

### Recommended: Hybrid Approach

**For static/hover states:**
```css
.neon-element {
  filter:
    drop-shadow(0 0 2px currentColor)
    drop-shadow(0 0 8px currentColor)
    drop-shadow(0 0 16px currentColor);
}
```

**For dynamic animated glows:**
```xml
<defs>
  <filter id="neon-glow">
    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur3"/>
    <feMerge>
      <feMergeNode in="blur3"/>
      <feMergeNode in="blur2"/>
      <feMergeNode in="blur1"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>
```

**Performance Notes:**
- SVG filters NOT GPU-accelerated in WebKit/Firefox
- Limit filter dimensions to smallest rectangle
- Minimize blur iterations
- CSS `drop-shadow()` respects alpha channel (unlike box-shadow)
- Multiple CSS shadows stack efficiently for falloff effect

---

## 2. Arc-Following Particle Effects

### Framer Motion Approach (Recommended)

**Circle progress animation pattern:**
```jsx
import { motion } from 'framer-motion';

const circumference = 2 * Math.PI * radius;

<motion.circle
  cx={cx}
  cy={cy}
  r={radius}
  stroke="currentColor"
  strokeDasharray={circumference}
  initial={{ strokeDashoffset: circumference }}
  animate={{ strokeDashoffset: circumference * (1 - progress) }}
  transition={{ duration: 0.5, ease: "easeOut" }}
/>
```

**Particle positioning on arc:**
```jsx
// Calculate particle position at percentage along arc
const angle = (percentage * 2 * Math.PI) - Math.PI / 2; // Start at top
const x = cx + radius * Math.cos(angle);
const y = cy + radius * Math.sin(angle);

<motion.circle
  cx={x}
  cy={y}
  r={particleRadius}
  animate={{
    cx: x,
    cy: y,
    opacity: [0.3, 1, 0.3]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "linear"
  }}
/>
```

**Path-based alternative:**
```jsx
<motion.path
  d={arcPath}
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 1.5, ease: "easeInOut" }}
/>
```

### CSS-Only Option (Limited)

For simple pulse effects on fixed points:
```css
@keyframes pulse-along-arc {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

.particle { animation: pulse-along-arc 2s ease-in-out infinite; }
```

**Recommendation:** Use Framer Motion for dynamic arc paths; CSS for static decorative particles.

---

## 3. Pulse/Heartbeat Patterns for Urgency

### Urgency State Matrix

| State | Pattern | Scale Range | Duration | Easing |
|-------|---------|-------------|----------|--------|
| **Normal** | None | - | - | - |
| **Warning** | Slow pulse | 1.0 → 1.1 | 2s | ease-in-out |
| **Urgent** | Fast heartbeat | 1.0 → 1.2 → 1.0 → 1.15 | 1s | cubic-bezier |
| **Critical** | Rapid pulse | 1.0 → 1.3 | 0.5s | ease-out |

### Production-Ready Implementation

```css
@keyframes urgent-heartbeat {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px currentColor);
  }
  10% {
    transform: scale(1.2);
    filter: drop-shadow(0 0 16px currentColor);
  }
  20% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px currentColor);
  }
  30% {
    transform: scale(1.15);
    filter: drop-shadow(0 0 12px currentColor);
  }
}

.clock-urgent {
  animation: urgent-heartbeat 1s cubic-bezier(0.36, 0, 0.66, -0.56) infinite;
  animation-delay: 0.5s; /* Pause between beats */
}

/* Accessibility: Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  .clock-urgent {
    animation: none;
    /* Static urgent state indicator */
    filter: drop-shadow(0 0 12px currentColor);
  }
}
```

**Best Practices:**
- Always include `prefers-reduced-motion` query
- Use `aria-hidden="true"` if pulse is decorative
- Add `aria-label="Urgent: 5 seconds remaining"` on focusable parent
- Limit scale to 1.3x max (avoid overwhelming users)
- Combine scale + glow intensity for compound effect

---

## 4. Color Shift Animation Techniques

### OKLCH vs HSL: Critical Difference

**Problem with HSL:**
- RGB interpolation produces gray/dark mixes
- Lightness inconsistent across hues
- Poor accessibility (contrast issues)

**OKLCH Advantages:**
- Perceptually uniform
- Consistent lightness across hues
- Maximizes chroma (avoids graying)
- Better accessibility
- Browser support: Chrome, Safari, Firefox (2026)

### Smooth Hue Rotation Pattern

```css
/* Define color stops in OKLCH */
:root {
  --neon-normal: oklch(70% 0.25 180); /* Cyan */
  --neon-warning: oklch(70% 0.25 60);  /* Yellow */
  --neon-urgent: oklch(70% 0.25 0);    /* Red */
}

/* Animated transition */
.clock-ring {
  stroke: var(--neon-normal);
  transition: stroke 0.8s ease-in-out;
}

.clock-ring[data-state="warning"] {
  stroke: var(--neon-warning);
}

.clock-ring[data-state="urgent"] {
  stroke: var(--neon-urgent);
}
```

### Continuous Hue Rotation (Rainbow Effect)

```css
@keyframes hue-rotate-smooth {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

/* Apply to OKLCH base color */
.clock-rainbow {
  color: oklch(70% 0.25 180);
  animation: hue-rotate-smooth 10s linear infinite;
}
```

### Color-Mix Alternative

```css
.clock-transitioning {
  /* Interpolate in OKLCH space with shorter hue path */
  background: color-mix(
    in oklch shorter hue,
    var(--color-start) 50%,
    var(--color-end) 50%
  );
  transition: background 1s ease-in-out;
}
```

**Recommendation:** Use OKLCH with state-based transitions for urgency; hue-rotate for decorative effects only.

---

## 5. Performance Optimization

### Critical Rules

**DO:**
- Use CSS `drop-shadow()` for simple glows (GPU-accelerated)
- Animate `transform` and `opacity` (avoid layout reflows)
- Limit SVG filter dimensions to minimum rect
- Test on WebKit + Firefox (worst filter performance)
- Use `will-change: transform, opacity` sparingly (memory cost)
- Combine multiple `drop-shadow()` for layered glow

**DON'T:**
- Animate SVG filter `stdDeviation` (causes jank)
- Use complex filter chains on large areas
- Animate `stroke-width` or `fill` directly
- Apply filters to full viewport
- Chain more than 3-4 filter primitives

### Optimization Checklist

```jsx
// React + Framer Motion optimized pattern
const NeonClock = ({ progress, urgencyState }) => {
  // Static filter definition (reused)
  const filterId = useId();

  // Animate via CSS variables (efficient)
  const style = {
    '--progress': progress,
    '--glow-intensity': urgencyState === 'urgent' ? '16px' : '8px'
  };

  return (
    <svg style={style}>
      <defs>
        {/* Define once, reference multiple times */}
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="3" result="blur1"/>
          <feGaussianBlur stdDeviation="8" result="blur2"/>
          <feMerge>
            <feMergeNode in="blur2"/>
            <feMergeNode in="blur1"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Animate via transform + CSS vars */}
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke="oklch(70% 0.25 180)"
        strokeDasharray={circumference}
        strokeDashoffset={`calc(${circumference} * (1 - var(--progress)))`}
        filter={`url(#${filterId})`}
        style={{ transformOrigin: '50px 50px' }}
        animate={{ scale: urgencyState === 'urgent' ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.5 }}
      />
    </svg>
  );
};
```

### Performance Budget

| Element | Blur Iterations | Area (px²) | FPS Target |
|---------|----------------|------------|------------|
| Clock ring | 2-3 | < 50k | 60fps |
| Particles (3-5) | 1-2 each | < 5k each | 60fps |
| Background | 0-1 | Any | 60fps |

**Testing Priority:** Safari/WebKit first (worst SVG filter performance).

---

## Recommended Tech Stack

1. **Animation:** Framer Motion (declarative, performant)
2. **Color:** OKLCH via CSS custom properties
3. **Glow:** Hybrid (CSS `drop-shadow` + SVG filters for intensity)
4. **Particles:** Calculate positions in JS, animate via Framer Motion
5. **Urgency:** CSS keyframes with `prefers-reduced-motion`

---

## Code Pattern: Complete Neon Clock

```jsx
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useId } from 'react';

const NeonClock = ({
  remainingSeconds,
  totalSeconds,
  urgencyState = 'normal' // 'normal' | 'warning' | 'urgent' | 'critical'
}) => {
  const filterId = useId();
  const progress = remainingSeconds / totalSeconds;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  // Color mapping
  const colors = {
    normal: 'oklch(70% 0.25 180)', // Cyan
    warning: 'oklch(70% 0.25 60)', // Yellow
    urgent: 'oklch(70% 0.25 20)',  // Orange
    critical: 'oklch(70% 0.25 0)'  // Red
  };

  // Urgency animation config
  const urgencyAnimations = {
    normal: { scale: 1, duration: 0 },
    warning: {
      scale: [1, 1.05, 1],
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    },
    urgent: {
      scale: [1, 1.15, 1, 1.08, 1],
      duration: 1,
      repeat: Infinity,
      ease: [0.36, 0, 0.66, -0.56]
    },
    critical: {
      scale: [1, 1.2, 1],
      duration: 0.5,
      repeat: Infinity,
      ease: 'easeOut'
    }
  };

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1"/>
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2"/>
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur3"/>
          <feMerge>
            <feMergeNode in="blur3"/>
            <feMergeNode in="blur2"/>
            <feMergeNode in="blur1"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background ring */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        stroke="oklch(30% 0.1 180)"
        strokeWidth="4"
        fill="none"
        opacity="0.3"
      />

      {/* Animated progress ring */}
      <motion.circle
        cx="100"
        cy="100"
        r={radius}
        stroke={colors[urgencyState]}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        filter={`url(#${filterId})`}
        style={{
          transformOrigin: '100px 100px',
          rotate: -90 // Start at top
        }}
        animate={urgencyAnimations[urgencyState]}
        transition={{
          strokeDashoffset: { duration: 0.5, ease: 'easeOut' },
          stroke: { duration: 0.8, ease: 'easeInOut' }
        }}
      />

      {/* Leading particle */}
      {progress > 0 && (
        <motion.circle
          cx={100 + radius * Math.cos((progress * 2 * Math.PI) - Math.PI / 2)}
          cy={100 + radius * Math.sin((progress * 2 * Math.PI) - Math.PI / 2)}
          r="4"
          fill={colors[urgencyState]}
          filter={`url(#${filterId})`}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </svg>
  );
};

// CSS for accessibility
const styles = `
  @media (prefers-reduced-motion: reduce) {
    svg * {
      animation: none !important;
      transition: none !important;
    }
  }
`;
```

---

## Unresolved Questions

1. **Filter caching:** Does React re-mount cause filter re-render? Test with `useMemo` on filter def.
2. **Mobile GPU limits:** What's max simultaneous glow filters on iPhone 12-15?
3. **Framer Motion tree-shaking:** Does importing only `motion` reduce bundle vs full library?
4. **OKLCH fallback:** Best graceful degradation for older browsers (Safari < 15)?

---

## Sources

### SVG Glow Techniques
- [Neon effect in text and SVG with CSS - DEV Community](https://dev.to/miguelmj/neon-effect-in-text-and-svg-with-css-3dap)
- [Adding Shadows to SVG Icons With CSS and SVG Filters | CSS-Tricks](https://css-tricks.com/adding-shadows-to-svg-icons-with-css-and-svg-filters/)
- [Creating an animated SVG Neon light effect - 9elements](https://9elements.com/blog/creating-an-animated-svg-neon-light-effect/)
- [SVG filters · WebPlatform Docs](https://webplatform.github.io/docs/svg/tutorials/smarter_svg_filters/)

### React/Framer Motion Arc Animation
- [SVG Animation in React — Paths, Morph & Line Drawing | Motion](https://motion.dev/docs/react-svg-animation)
- [How to build an SVG circular progress component using React and React Hooks - LogRocket Blog](https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/)
- [How to Animate SVG Paths with Framer Motion - Noël's Blog](https://blog.noelcserepy.com/how-to-animate-svg-paths-with-framer-motion)

### Pulse/Heartbeat Patterns
- [CSS Pulse animation - GeeksforGeeks](https://www.geeksforgeeks.org/css/css-pulse-animation/)
- [Animate.css | A cross-browser library of CSS animations](https://animate.style/)
- [How to Make a "Pulsing" Animation - Pure CSS Shapes](https://css3shapes.com/how-to-make-a-pulsing-animation/)

### Color Shift Techniques
- [OKLCH in CSS: why we moved from RGB and HSL](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [Color Shifting in CSS • Josh W. Comeau](https://www.joshwcomeau.com/animation/color-shifting/)
- [Smashing Animations Part 8: Theming Animations Using CSS Relative Colour — Smashing Magazine](https://www.smashingmagazine.com/2026/01/smashing-animations-part-8-css-relative-colour/)
- [color-mix() - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix)

### Performance Optimization
- [Planning for Performance — Using SVG with CSS3 and HTML5](https://oreillymedia.github.io/Using_SVG/extras/ch19-performance.html)
- [Animating SVG Filters for Motion-Based UI and Art Effects - DEV Community](https://dev.to/hexshift/animating-svg-filters-for-motion-based-ui-and-art-effects-3l6)
- [An Interactive Guide to CSS Keyframe Animations with @keyframes • Josh W. Comeau](https://www.joshwcomeau.com/animation/keyframe-animations/)
