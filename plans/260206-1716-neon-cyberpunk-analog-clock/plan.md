---
title: "Neon Cyberpunk Analog Clock"
description: "Upgrade analog clock with jaw-dropping neon glow, particles, state-reactive animations"
status: done
priority: P2
effort: 5.5h
branch: feat/new-branding
tags: [animation, ui, clock, neon, cyberpunk, framer-motion]
created: 2026-02-06
---

# Neon Cyberpunk Analog Clock

## Summary

Transform the basic SVG analog clock into a jaw-dropping Neon Cyberpunk experience with multi-layer glowing rings, particle sparks, smooth NumberFlow digit transitions, and full timer-state-reactive animations.

## Background

Current analog clock (`analog-clock.tsx`, 67 lines) is bare-minimum: 1 background circle + 1 progress circle + centered text. No glow, no particles, no state reactivity. Needs major visual upgrade while maintaining performance and theme compatibility.

See: [Brainstorm Report](../reports/brainstorm-260206-1716-neon-cyberpunk-analog-clock.md)

## Approach

**SVG + CSS drop-shadow + Framer Motion** — no new dependencies.

Key decisions:
- Layered CSS `drop-shadow()` for neon glow (GPU-accelerated, better than SVG filters)
- Framer Motion `AnimatePresence` for 8-12 particles (no canvas needed)
- NumberFlow for smooth digit morphing (already installed)
- State machine hook for clean state derivation
- Theme-aware via `--timer-foreground` CSS variable

## Visual States

| State | Trigger | Visual |
|-------|---------|--------|
| Idle | Paused | Dim glow, slow breathing |
| Running | Playing, >60s | Bright neon, 8 particles |
| Urgent | Playing, ≤60s | Amber glow, heartbeat pulse, 12 particles |
| Critical | Playing, ≤10s | Red glow, rapid pulse, particle burst |
| Complete | timeLeft=0 | Flash → existing confetti |

## Implementation Phases

| # | Phase | Effort | Status | Details |
|---|-------|--------|--------|---------|
| 01 | [State Hook + CSS Foundation](./phase-01-state-hook-and-css.md) | 1.5h | Pending | State machine hook + neon CSS keyframes |
| 02 | [Neon Ring SVG + Glow](./phase-02-neon-ring-svg.md) | 2h | Pending | 6-layer SVG rewrite + head dot + glow system |
| 03 | [Particles + NumberFlow + Polish](./phase-03-particles-numberflow-polish.md) | 2h | Pending | Particle sparks + smooth digits + a11y + QA |

## Files Changed

| File | Action | Phase |
|------|--------|-------|
| `src/app/(main)/timer/components/clocks/use-analog-clock-state.ts` | CREATE | 01 |
| `src/app/globals.css` | EDIT | 01, 03 |
| `tailwind.config.js` | EDIT | 01 |
| `src/app/(main)/timer/components/clocks/analog-clock.tsx` | REWRITE | 02 |
| `src/app/(main)/timer/components/clock-display.tsx` | EDIT | 02 |
| `src/app/(main)/timer/components/clocks/analog-clock-particles.tsx` | CREATE | 03 |

## Dependencies

- No new npm packages
- Leverages: Framer Motion, @number-flow/react (both already installed)

## Success Criteria

- 60fps on Chrome/Safari desktop
- 5 distinct visual states clearly distinguishable
- Works across all 11 theme presets
- `prefers-reduced-motion` fallback functional
- No new dependencies

## Risks

| Risk | Mitigation |
|------|------------|
| Safari glow perf | Reduce drop-shadow layers to 2 on Safari if needed |
| Mobile battery | Auto-reduce particles on mobile (6 max) |
| Theme color conflicts | Use CSS variables throughout, no hardcoded colors |
