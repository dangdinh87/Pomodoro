# Lottie Shiba Inu Mascot Research - React/Next.js

## 1. Lottie Libraries Comparison

| Library | Bundle Size | Performance | Maintenance | Use Case |
|---------|-------------|-------------|-------------|----------|
| **lottie-react** | ~60KB | High (hooks-based) | Active | Modern React/functional components |
| **lottie-web** | ~80KB | High (raw) | Airbnb-backed | Direct control, low-level APIs |
| **@lottiefiles/react-lottie-player** | ~50KB | Excellent (optimized) | Official LottieFiles | Production-ready, modern React |

**Recommendation**: Use `@lottiefiles/react-lottie-player` for best DX + performance, or `lottie-react` for hooks integration.

---

## 2. Free Shiba Inu Animations

**Primary Source**: [LottieFiles](https://lottiefiles.com/free-animations/shiba-inu%20dog)

Available animations:
- Shiba Stare (idle/neutral expression)
- Shiba Inu Play in Metaverse (playful)
- Various cute Shiba animations from IconScout

**Sourcing**: Check [IconScout](https://iconscout.com/lottie-animations/shiba-inu) for 33+ Shiba options (JSON, GIF, MP4).

---

## 3. Custom Lottie Animations (Multiple Expressions)

**Tool Stack**:
1. Adobe After Effects + [Bodymovin plugin](https://aescripts.com/bodymovin/)
2. Alternative: [LottieFiles After Effects plugin](https://lottiefiles.com/plugins/after-effects) (better DX)
3. Export format: JSON with Bodymovin

**Workflow**:
- Design mascot in Illustrator (separate layers per feature)
- Import to AE, create expressions (idle, happy, thinking, error)
- Export JSON per state
- Load via React component

**Advanced**: Use [dotLottie](https://dotlottie.io/intro/) for state-based switching.

---

## 4. Speech Bubble + Mascot Implementation

**Pattern**: Framer Motion + animated text

```jsx
<motion.div animate={{ opacity: 1, scale: 1 }}>
  <LottieAnimation src="shiba-talking" />
  <motion.div className="speech-bubble">
    {/* Typed text animation */}
  </motion.div>
</motion.div>
```

**Resources**:
- [StackBlitz bubble dialog example](https://stackblitz.com/edit/react-ts-jfywps)
- [Motion library docs](https://motion.dev/)
- Framer Motion: 30.6K stars, 8.1M weekly npm downloads (2026)

---

## 5. Global Mascot State Management

**Performance Issue**: Context causes full tree re-renders on updates.

**Solutions (2026)**:
1. **Zustand** (recommended): Hook-based, no boilerplate, minimal re-renders
2. **Jotai**: Atom-based, fine-grained reactivity
3. **Context**: Only for stable values (mascot visibility, expressions)
4. **Redux Toolkit**: Large apps only

**Strategy**:
- Store mascot state (visible, expression, message) in Zustand
- Wrap in Context only for deeply nested pages
- Memoize mascot component to prevent rerenders

---

## Bundle Size Impact
- Lottie player: ~50-80KB
- Shiba JSON animation: 50-200KB (varies)
- Framer Motion: ~40KB
- Total: ~150-300KB (gzip: 40-80KB)

**Optimization**: Code-split mascot, lazy-load animation JSON.

---

## Integration Checklist
- [ ] Install `@lottiefiles/react-lottie-player` or `lottie-react`
- [ ] Download/create Shiba JSON animations
- [ ] Build mascot context (Zustand or Context API)
- [ ] Implement speech bubble with Framer Motion
- [ ] Add lazy-loading + code-splitting
- [ ] Test performance on mobile (React DevTools Profiler)

