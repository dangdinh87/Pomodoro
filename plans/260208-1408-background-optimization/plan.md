---
title: "Background Image Optimization & Pack System"
description: "Build-time AVIF/WebP conversion, pack-based organization, lazy-loaded tab picker"
status: in-progress
priority: P2
effort: 10h
branch: feat/new-branding
tags: [performance, images, ui, optimization]
created: 2026-02-08
---

# Background Image Optimization & Pack System

## Problem

Current background system serves 95MB of unoptimized JPG assets (largest 21MB). All 27 image thumbnails load simultaneously in the picker. No modern image formats, no responsive sizing.

## Target

- 95MB -> ~15MB total assets (~84% reduction)
- AVIF + WebP at 1920px (full) and 400px (thumb)
- 7 theme packs with tab-based lazy picker
- Format auto-detection for CSS background-image
- Preload user's saved background on app init

## Phases

| # | Phase | File | Status | Effort |
|---|-------|------|--------|--------|
| 1 | Build Script & Source Restructure | [phase-01](./phase-01-build-script-source-restructure.md) | **DONE** (2026-02-08) | 3h |
| 2 | Data Model & Pack System | [phase-02](./phase-02-data-model-pack-system.md) | pending | 2h |
| 3 | Background Renderer Update | [phase-03](./phase-03-background-renderer-update.md) | pending | 1.5h |
| 4 | Picker UI - Tab Pack System | [phase-04](./phase-04-picker-ui-tab-packs.md) | pending | 2h |
| 5 | Integration & Cleanup | [phase-05](./phase-05-integration-cleanup.md) | pending | 1.5h |

## Key Decisions

- **Build-time sharp** over Vercel Image Optimization (CSS `background-image` can't use `next/image`)
- **Optimized output NOT in git** -- generated at build time, gitignored
- **Source images in `backgrounds-source/`** organized by pack subdirectory
- **Videos kept as-is** (day.mp4 936KB, night.mp4 492KB -- already small)
- **`cafe_1.jpeg`** is unreferenced in presets; will be excluded from migration

## Dependencies

- `sharp` (devDependency) for build-time conversion
- Existing: `@radix-ui/react-tabs`, `next/image`, `lucide-react`

## Reports

- [Brainstorm](../reports/brainstorm-260208-1408-background-optimization.md)
- [Scout](../reports/scout-260208-1408-background-implementation.md)
