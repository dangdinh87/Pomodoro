---
phase: 01
title: "Nâng cấp framework"
status: done
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

## Kết quả (2026-10-01)
- `c3cf676` Next 16.3 (Turbopack) + React 19.3 + zustand 5 + ESLint 9 flat config; codemod async params/cookies, `middleware` → `proxy`.
  - `server-translations` thành `getT()` async; `ssr:false` của timer dời vào client component.
  - zustand 5: selector `.filter()` trong `preset-chips` (vòng render vô hạn) → `useMemo`.
- **Lệch plan:** không nâng AI SDK 6 ở phase này — chat cũ (đang tắt cờ) đã gỡ hẳn cùng assistant-ui/ai v5; AI SDK + `@ai-sdk/openai-compatible` cài ở phase 09 khi viết trợ lý mới.
- `716c8da` Tailwind v4: token qua `@theme inline`, `tw-animate-css`, `tailwind-merge` v3.
  - Sửa tay chỗ `@tailwindcss/upgrade` làm hỏng: chuỗi variant `'outline'`, key i18n `blur`, thứ tự variant `rtl:**:` ở calendar.
  - `.btn*` giữ ở `@layer components` (nếu là `@utility` thì v4 sắp theo số thuộc tính → `btn--sm` đè `btn--link`).
  - `Label` thành `block` (space-y v4 dùng margin-bottom, phần tử inline bỏ qua) — khoảng label→input gọn hơn v3 6px, chấp nhận vì form login/task làm lại ở phase 02–03.
- Rule React Compiler mới của eslint-config-next 16 (`set-state-in-effect`, `refs`, `purity`, `static-components`) tạm để **warn** — bật lại error sau phase 03–06.
- Kiểm tra: tsc 0, jest 181/181 (bớt test của chat đã gỡ), lint 0 lỗi/128 warn, i18n OK, build OK. Soát pixel 37 ảnh 1440/390 so với v3: khớp trừ khoảng label nói trên.
- Mốc bundle mới (gzip mọi `<script src>` của HTML, Turbopack): `/timer` 439 kB, `/tasks` 516 kB, `/` 344 kB. Webpack không nhỏ hơn (469/540/343). Không so thẳng được với số "First Load JS" của Next 14 vì Next 16 bỏ con số đó. Supabase (~49 kB) đi ở phase 02; ngân sách đặt ở phase 11.
