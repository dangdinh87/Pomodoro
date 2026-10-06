# Batch 2.2 — Thương hiệu và linh vật Tomo (spec §9 bước 2)

Ngày 2026-10-05, nhánh `feat/design-system`. Xong 6 task, 4 commit. `pnpm type-check` sạch, `pnpm lint` 0 lỗi (93 warning cũ), `pnpm test` 63 file / 554 test pass, `pnpm i18n:check` OK (1251 khoá). Không chạy `pnpm build` (theo yêu cầu).

## Commit

| Hash | Nội dung |
|---|---|
| `ac18c60` | Task 1-2: `Tomo`, `tomo-art.ts`, `Logo` + test, thay logo ở status bar, site-header, footer, login |
| `c895df2` | Task 3-4: `generate-brand-icons.mjs`, favicon.svg/.ico, icon PWA, apple-touch, manifest, `pnpm icons:brand`, README, xoá logo cũ + `generate-pwa-icons.mjs` |
| `cdb777a` | Task 5: `opengraph-image.tsx`, font Baloo 2 tĩnh, `share-image.ts`, `page-metadata.ts`, `layout.tsx`, xoá `card.jpg` |
| `ddb7f65` | Task 6: 404 + `EmptyState` dùng Tomo, xoá `public/mascot/*`, bỏ nhánh mascot trong prebuild, khoá `notFound.tomoAlt` (en/vi/ja) |

## Từng task

1. **Tomo** (`src/components/brand/tomo.tsx` + `tomo-art.ts`). Hình vẽ là dữ liệu (cây node SVG), một nguồn cho 3 nơi: React (màu bằng biến CSS `--candy-tomato`, `--outline`, `--on-accent` nên sáng/tối tự đổi), file tĩnh và `next/og` (bảng màu sáng cố định `TOMO_LIGHT_PALETTE`). Thân tròn, bóng dưới, vệt sáng, lá đài xanh, cuống, má hồng, viền sticker. Vẽ lại so với mockup: bóng dưới là cung trên chính elip thân (không tràn viền), lá bớt chìa xuống để không đè lông mày, mắt dịch xuống 2-3 đơn vị, chữ "z" vẽ bằng nét (không phụ thuộc font), cuống có viền. Viền dày 5 (thay vì 3.5) khi `size <= 40`. Đã kiểm ở 24/32/40/48/96/160/200: 5 mặt vẫn phân biệt được ở 24px.
2. **Logo** (`logo.tsx`): đầu Tomo (cắt sát) + chữ "Study Bro" Baloo 2 800 `text-ink`, cỡ chữ = 0.62 × `size`. Thay 4 chỗ: `app-status-bar` (26), `site-header` (26), `Footer` (28), `login-form` (`variant="mark"`, 56). Chỉ đổi component, giữ nguyên bố cục. Chữ là hằng "Study Bro" (tên thương hiệu không dịch).
3. **Favicon và icon PWA**: `scripts/generate-brand-icons.mjs` (chạy qua `pnpm icons:brand`, dùng `tsx` để nhập `tomo-art.ts`). Sinh `public/favicon.svg` (master, viền 5), `public/favicon.ico` (khung PNG 16/32/48, tự ghi header ICO, không thêm dependency), `icon-192/512` (ô kem bo góc 20%, Tomo chiếm 76%), `maskable-icon-512x512.png` (kem tràn viền, Tomo 62% nằm trong vùng an toàn), `apple-touch-icon.png` (180, kem tràn viền, 74%). `layout.tsx` icons thêm `/favicon.ico` + `/favicon.svg` (trước đó favicon.svg có trong `public` nhưng không được link).
4. **Manifest**: `theme_color #FF5A36`, `background_color #FFF3E0`, `start_url "/"`, shortcut Timer → `/`, Tasks → `/?panel=tasks`. Tên, mô tả giữ nguyên (không nhắc tính năng đã bỏ).
5. **OG** (`src/app/opengraph-image.tsx`, 1200×630 PNG): nền kem, 4 chấm kẹo, thẻ sticker nghiêng -1° có Tomo + "Study Bro" (Baloo 2 800 132px), pill bơ nghiêng +1° với "Free Pomodoro timer · tasks · focus sounds" (Baloo 2 700). Font: đọc `assets/fonts/Baloo2-{Bold,ExtraBold}.ttf` bằng `readFile(process.cwd()…)` ở module scope đúng guide Next 16 (mỗi file 56KB, subset Latin + Việt; satori không đọc được woff2 của `next/font`, nên lấy bản tĩnh từ Google Fonts rồi subset). Tomo đưa vào bằng `<img src="data:image/svg+xml;base64,…">`. Đã xoá `public/card.jpg` và mọi tham chiếu (`layout.tsx`, `page-metadata.ts`).
   - **Phát hiện**: trang có `openGraph` riêng (guide, privacy, terms, `/`) không kế thừa ảnh file-based của layout; `page-metadata.ts` phải khai ảnh tường minh. Thêm `src/lib/seo/share-image.ts` (path, alt, size) để route OG và `buildPageMetadata` dùng chung, khỏi lệch. Đã curl: `/`, `/guide`, `/nonexistent` đều có `og:image` + `twitter:image` trỏ `/opengraph-image`.
6. **Gỡ sói**: `not-found.tsx` → `<Tomo face="sleepy" size={144} title={t('notFound.tomoAlt')}>` và bỏ `data-theme="dark"` cứng; `empty-state.tsx` → Tomo `happy` 128px, giữ `imageClassName`, thêm `face?`. Xoá `public/mascot/wolf_cute.{png,webp}`; `scripts/optimize-backgrounds.mjs` (prebuild) bỏ hẳn hàm `optimizeMascots` và hằng liên quan (thư mục đã mất, code chết).

## API cho batch sau

```tsx
// src/components/brand/tomo.tsx
type TomoFace = 'happy' | 'focus' | 'party' | 'sleepy' | 'worried';
<Tomo
  face?: TomoFace          // mặc định 'happy'
  size?: number            // px, mặc định 96
  className?: string
  title?: string           // có: role="img" + <title>; không: aria-hidden
  tight?: boolean          // cắt sát quả cà chua (viewBox 8 12 104 104), cho logo/avatar/Tomo nhỏ cạnh tên việc
/>
// src/components/brand/logo.tsx
<Logo variant?: 'full' | 'mark' /* 'full' */ size?: number /* 28, cao của Tomo */ className?: string />
// src/components/ui/empty-state.tsx (thêm, không phá API cũ)
<EmptyState title description? action? className? imageClassName? face?: TomoFace />
// src/components/brand/tomo-art.ts (không import gì, Node/tsx dùng được)
tomoNodes, tomoSvg(face, palette?, { size?, tight?, strokeWidth? }), serializeNodes,
TOMO_FACES, TOMO_THEME_PALETTE, TOMO_LIGHT_PALETTE, TOMO_VIEWBOX, TOMO_TIGHT_VIEWBOX
// src/lib/seo/share-image.ts
SHARE_IMAGE_PATH, SHARE_IMAGE_ALT, SHARE_IMAGE_SIZE
```

Tomo chưa có animation (thở, nhảy, lắc): phần của `TomoBubble`/`SessionCelebration`, bọc `<Tomo>` bằng `motion.div` là đủ vì không có state bên trong. `Tomo` là server-safe (không hook).

## Ảnh kiểm (`plans/reports/assets-261005-relaunch/`, không commit)

- `2-2-tomo-faces.png`: 5 mặt cạnh nhau, sáng + tối, 160px và 24/40px (ảnh cho chủ dự án).
- `2-2-og-image.png`: ảnh OG thật từ `/opengraph-image`.
- `2-2-404-{390,1440}-{light,dark}.png` (4), `2-2-header-guide-390-{light,dark}.png` (2), `2-2-header-home-{390,1440}-{light,dark}.png` (4), `2-2-icon-maskable.png`.
- Ghi chú: ở ảnh 404 dark, `data-theme="dark"` được gắn tay vì 404 nằm ngoài ThemeProvider (xem follow-up).

Chrome DevTools MCP (context `relaunch-2-2`): không tràn ngang ở 390 (`scrollWidth` 390). Mọi file tĩnh trả 200 (`/favicon.svg`, `.ico`, `apple-touch-icon.png`, icon 512, maskable, manifest); `/card.jpg` và `/mascot/wolf_cute.png` trả 404.

## Quyết định

- Hình vẽ dạng dữ liệu thay vì JSX riêng cho từng nơi: tránh lệch giữa component, favicon và OG; không dùng `dangerouslySetInnerHTML`.
- Favicon `.ico` ghi bằng PNG-in-ICO tự viết (20 dòng) thay vì thêm package; `public/favicon.ico` cũ (112KB logo sói/đồng hồ) đã được thay.
- Xoá luôn `public/images/{logo.png,logo.svg,favicon.ico}` (không còn ai tham chiếu, là logo cũ).
- Icon "any" 192/512 là ô kem bo góc (không trong suốt) theo spec "nền giấy kem"; maskable và apple-touch tràn viền vì OS tự bo.
- 404 không còn ép dark: nhưng 404/`global-error` nằm ngoài ThemeProvider nên luôn hiện sáng (mặc định mới của spec).
- Không đụng `next.config.ts`, locale hunk weather, `app-home*.tsx`: chỉ stage đúng hunk `tomoAlt`.

## Follow-up

1. **404 luôn sáng**: người dùng chọn Tối vẫn thấy 404 sáng (không có ThemeProvider ở root). Nếu muốn khớp, thêm script `next-themes` nội tuyến vào `not-found`/`global-error`.
2. **Verify trên Vercel preview**: Vercel phải gói `assets/fonts/*.ttf` cho route OG (cách `process.cwd()` theo docs Next 16, chưa build tại chỗ). Nếu thiếu file, ảnh OG 500; kiểm `/opengraph-image` ở preview.
3. **`card.jpg` còn trong lịch sử git** (lộ tên + email chủ dự án). Chỉ viết lại lịch sử nếu repo public.
4. **Doodle nền** (`--doodle` trong `globals.css`): cà chua nhỏ vẫn giống giọt nước (câu hỏi mở của 2.1). Nên vẽ lại theo dáng Tomo (thân tròn + lá) ở batch sau; không thuộc phạm vi 2.2.
5. `error.tsx`, `global-error.tsx`, đăng nhập: thêm `<Tomo face="worried">` (spec §7.5) ở batch trang ngoài app.
6. OG đa ngôn ngữ (phase 3): font Baloo đã subset Latin + Việt; tiếng Nhật cần subset font JP riêng (ghi trong `assets/fonts/README.md`).
7. Còn `data-theme="dark"` cứng ở `app-home*.tsx`, `task-selector`, `clock-style-picker` (batch 2.4; `app-home.tsx` đang dính weather WIP).
8. README ghi "Jest" nhưng test là Vitest (không thuộc batch này).
