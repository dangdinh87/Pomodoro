---
phase: 01
title: "Nâng cấp framework"
status: pending
estimate: 2 ngày
depends_on: 00
---

# Phase 01 — Nâng cấp framework

## Mục tiêu
Đưa Study Bro lên cùng stack với luyenphongvan để port được code AI/OG/thanh toán và dùng R3F v9: **Next.js 16, React 19, Tailwind v4, AI SDK 6**. Bật lại gate type/lint trong build.

## Các bước
1. Next 14 → 15 → 16 bằng `@next/codemod` (async request APIs, Turbopack mặc định); React 19 (ref là prop, bỏ `forwardRef` dần).
2. Tailwind v3 → v4: chuyển `tailwind.config.js` sang `@theme` trong CSS. Token design system (`--ink`, `--surface`, `--accent*`, tone) giữ nguyên tên; bỏ cầu `color-mix(<alpha-value>)` vì v4 hỗ trợ opacity trên biến CSS. Đối chiếu cách cv-app bridge token shadcn.
3. shadcn/ui: cập nhật component sang bản hỗ trợ React 19/Tailwind v4, giữ Phosphor.
4. `motion` v12, `@phosphor-icons/react`, `sonner`, `zustand` (lên v5, dùng selector), react-query v5: kiểm tra tương thích.
5. AI SDK 5 → 6, thêm `@ai-sdk/openai-compatible` (dùng ở phase 09).
6. Sửa 17 lỗi TS trong code app và lỗi trong test; bỏ `ignoreBuildErrors`/`ignoreDuringBuilds`.
7. Đo lại bundle `/timer` (mốc hiện tại ~470 kB first load).

## File chính
`package.json`, `next.config.js` → `next.config.ts`, `postcss.config.*`, `tailwind.config.js` (xoá), `src/app/globals.css`, `src/components/ui/*`, `tsconfig.json`.

## Tiêu chí xong
- `pnpm build` không còn bỏ qua lỗi; `tsc` 0 lỗi; lint sạch; test xanh.
- Soát harness toàn bộ trang chính ở 1440/390: không lệch giao diện so với trước nâng cấp.

## Rủi ro
- Tailwind v4 đổi một số tên tiện ích (shadow, ring, blur mặc định) → soát ảnh trước/sau.
- Thư viện chưa hỗ trợ React 19 (dnd-kit, assistant-ui) → kiểm tra phiên bản; assistant-ui có thể bỏ vì trợ lý sẽ làm lại ở phase 09.
