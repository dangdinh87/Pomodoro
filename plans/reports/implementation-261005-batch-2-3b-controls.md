# Batch 2.3b: control, display và primitive thương hiệu mới (spec §5 + "Primitive mới")

Ngày 2026-10-05, nhánh `feat/design-system`. Xong 7 task, 5 commit code + 1 commit báo cáo. `pnpm type-check` sạch, `pnpm lint` 0 lỗi (90 warning cũ), `pnpm i18n:check` OK (1276 khoá), `pnpm test` 94/95 file, 892/897 test pass. 5 test fail đều ở `src/lib/weather/weather-mood.test.ts` (weather WIP của phiên khác, preset dùng id âm thanh không còn trong `soundCatalog.ambient`), không liên quan batch này, không đụng.

## Commit

| Hash | Nội dung |
|---|---|
| `378ad29` | `globals.css` (`.field`, `.focus-ring`, `.skeleton`, `--control-edge`, `tick-pop`), button, input, textarea, label, checkbox, radio-group, switch, slider + test |
| `0639888` | `IconTile`, tabs, filter-chip, badge, card, avatar, skeleton, kbd, stat-strip, page-header, separator, table, loader, empty-state + test; `globals.css` thêm `@utility border-sticker`, `tilt-l/r` |
| `8df2835` | `StickerCard`, `StreakPill`, `SessionTomatoes`, `TomoBubble` + test, test quét tương phản, khoá `tomoBubble.dismiss` (3 locale, chỉ stage hunk của mình) |
| `10aa438` | `/dev/ui` (trang trưng bày, `notFound()` ở production), `/dev/` vào `robots.ts` |
| `f202f5e` | `user-menu.tsx`, `account-settings.tsx`: bỏ class đè nền/viền để avatar nhận màu kẹo (xem Quyết định) |

## Từng primitive

1. **button**: thêm variant `fun` (`btn--fun`, candy-butter). Khối `.btn*` của 2.1 đã đúng spec (viền, bóng cứng, nhích -1px, lún khi bấm, cỡ 34/42/50/40, Baloo 700) nên `button.tsx` vẫn chỉ map variant → class, một nguồn duy nhất. Không đổi tên variant nào.
2. **input, textarea, label**: dùng chung `.field` trong `globals.css` (viền `--outline-w`, `shadow-sticker-sm`, cao 42px; focus: bóng đổi `2px 2px 0 var(--accent-solid)` + vòng 3px `--accent` cách 2px; `aria-invalid="true"` đổi viền `--danger-ink` + bóng `--danger`; disabled: nền raised, bỏ bóng). Placeholder `--ink-muted` (không dùng `ink-faint`). Textarea min 96px. Label Nunito 700 `leading-tight` (trước `leading-none` dễ cắt dấu tiếng Việt khi xuống dòng). `.field` có thể dùng cho select trigger nếu cần.
3. **checkbox, radio-group, switch, slider**: checkbox 22px bo 7px, tick Phosphor bold nảy (`motion-safe:animate-tick-pop`), vùng chạm nới ~34px bằng `::after`; radio 22px, chấm `bg-on-accent`; switch 48×28, bật = `candy-mint`, núm trắng có viền; slider track 10px có viền, range `bg-primary`, núm trắng tròn có viền + bóng cứng; disabled slider qua `data-[disabled]` (Radix thumb là `span`, `disabled:` không ăn). Tất cả dùng `.focus-ring` (vòng 3px `--accent`).
4. **tabs** khay pill có viền, tab đang chọn là ô sticker nổi (`flex-1`, cuộn ngang khi nhiều tab; padding 6px chừa chỗ cho bóng và vòng focus trong hộp cuộn). **filter-chip** pill viền; chọn = `bg-primary text-on-accent shadow-sticker-sm`; chưa chọn = nền surface, không bóng. **badge** viền 2px, `-bg` + `-ink` theo tone (9 variant giữ nguyên), chữ 12px. **card** = `.sticker` (caller có thể làm phẳng bằng utility). **avatar** viền + bóng nhỏ, fallback nền kẹo theo hash tên. **skeleton** `.skeleton` (nền raised + viền mảnh `--border` + vệt sáng quét, tắt hẳn khi reduced-motion). **kbd** phím viền có bóng 1px. **stat-strip** ô `.sticker-sm`, số Baloo 800 cỡ `clamp(1.75rem,3vw,2.375rem)`, icon vào `IconTile sm`. **page-header** tiêu đề Baloo 800 theo `clamp`. **separator** 2px bo tròn. **table** header Baloo, kẻ `border-b-2 border-outline`, hàng chọn `bg-brand-soft`, wrapper `rounded-[inherit]` để không lòi góc khi nằm trong Card. **loader**: Tomo nhảy tại chỗ (tĩnh khi reduced-motion) thay vòng xoay.
5. **empty-state**: Tomo (`face?` mặc định `happy`) + tiêu đề + mô tả + một action, nằm trong thẻ `.sticker`. Lồng trong thẻ khác thì làm phẳng bằng `className="border-0 bg-transparent shadow-none"`.
6. **Primitive mới**: xem API bên dưới. Test: icon-tile (7 tone, 3 size), sticker-card (tilt/size/ref), streak-pill (label en/vi/ja), session-tomatoes (đếm, clamp, label en/vi/ja), tomo-bubble (ẩn khi bấm, bàn phím, nhớ theo `id`, sessionStorage bị chặn, nhãn en/vi/ja), avatar hash cố định (inline snapshot).
7. **Quét tương phản**: không còn `text-white` trong 26 file của batch; không dùng `text-success|warning|danger|info|ai|destructive|gold` làm màu chữ (test nguồn `primitives-contrast.test.ts` giữ cho khỏi tái phát). Chữ trên nền kẹo là `text-on-accent`; chữ tone trên `-bg` là `-ink`.

## API chính xác của primitive mới (batch sau dựa vào đây)

```tsx
// src/components/ui/icon-tile.tsx (server-safe, aria-hidden)
import { IconTile, type IconTileTone, type IconTileSize } from '@/components/ui/icon-tile';
type IconTileTone = 'tomato' | 'mint' | 'butter' | 'lilac' | 'sky' | 'peach' | 'surface';
type IconTileSize = 'sm' | 'md' | 'lg';          // 28 / 36 / 48px, icon 16 / 20 / 26, bo 10 / 11 / 12px
<IconTile icon={Timer} tone?="surface" size?="md" weight?="fill" className? />
// icon = component Phosphor (type Icon). Tone candy: nền bg-candy-*, icon text-on-accent. Tone 'surface': bg-surface-raised + text-ink
// (on-accent là nâu đậm, sẽ biến mất trên nền tối). Sheet header của 2.3a có sẵn ô riêng, không bắt buộc đổi sang IconTile.

// src/components/ui/sticker-card.tsx (server-safe, forwardRef, nhận mọi thuộc tính div)
<StickerCard tilt?="none" /* 'left' | 'right' | 'none' */ size?="md" /* 'sm' | 'md' | 'lg' */ className? ...divProps />
// sm = .sticker-sm p-3 · md = .sticker p-5 · lg = .sticker-lg p-6. Có padding sẵn (Card thì không). Tilt = class tilt-l / tilt-r (±1deg).
// Thêm sticker-press vào className nếu cần bấm được.

// src/components/ui/streak-pill.tsx ('use client', dùng useI18n)
<StreakPill count={number} className? />
// span role="img", aria-label = t('shell.streak', { count }) ("5-day streak" / "Chuỗi 5 ngày" / "5日連続"). Cao 32px, candy-butter, ngọn lửa SVG riêng.
// Muốn bấm được: bọc trong <button> hoặc Link. Chưa thay StreakChip của app-status-bar (ngoài phạm vi).

// src/components/ui/session-tomatoes.tsx ('use client')
<SessionTomatoes completed={number} total?={4} size?={22} className? />
// completed bị kẹp trong [0, total]. aria-label = t('timerUi.sessionOf', { current: min(completed + 1, total), total })
// ("Session 3 of 4" / "Phiên 3/4" / "セッション 3/4"), tức "phiên đang ở", khớp nhãn "Phiên N/4" nằm cạnh. Cà chua đặc = xong, nét đứt = chưa.

// src/components/brand/tomo-bubble.tsx ('use client')
<TomoBubble face?="happy" id?={string} onDismiss?={() => void} tomoSize?={64} className?>{lời của Tomo}</TomoBubble>
// Render hàng [Tomo][bong bóng]. Bấm (hoặc Enter/Space) bong bóng thì ẩn, Tomo ở lại; gọi onDismiss một lần.
// Có `id`: nhớ trong sessionStorage ('tomo-bubble:dismissed:<id>', try/catch). Không `id`: mount lại thì hiện lại.
// SSR/hydrate không có bong bóng (tránh nháy), client hiện sau đó bằng spring 420/22; Tomo thở scale 1 → 1.03 / 3s (tắt khi reduced-motion).
// Nhãn đọc cho trình đọc màn hình: "<lời> <tomoBubble.dismiss>".

// Cũng thêm (kèm API cũ, chỉ additive)
AvatarFallback: prop `name?: string` (hạt giống màu kẹo; mặc định là children nếu là chuỗi). export avatarCandyClass(name).
Button variant 'fun'. StatItem.tone?: IconTileTone.
```

Utility CSS mới (`globals.css`): `.field`, `.focus-ring`, `.skeleton`, `@utility border-sticker` (đáp lại gợi ý 2.3a (a)), `@utility tilt-l|tilt-r` (đáp lại (b), dùng được với `group-*:`/`data-*:`), `animate-tick-pop`, token `--control-edge` / `border-control-edge`.

## Ảnh kiểm (`plans/reports/assets-261005-relaunch/`, không commit)

`2-3b-ui-{390,1440}-{light,dark}.png` (toàn trang `/dev/ui`), `2-3b-s{1..5}-390-{light,dark}.png` (cắt theo đoạn, đọc được ở 390), `2-3b-focus-switch-1440-light.png`, `2-3b-focus-chip-1440-light.png` (vòng focus của chip không bị cắt trong `FilterChipGroup`), `2-3b-app-settings-390-light.png` (panel Cài đặt thật dùng tabs/nút/select mới).
Chrome DevTools MCP (context `relaunch-2-3b`, emulate 390×844×2 mobile): `scrollWidth` 390 ở `/dev/ui` và `/?panel=settings`. Lần đầu đo được 400 do hàng IconTile của trang trưng bày không wrap (lỗi của trang demo, đã sửa). Computed: vòng focus 3px `rgb(194,51,15)` ở checkbox, radio, switch, slider, tab, chip, input, textarea, nút; chip dùng offset 1px nên vừa đúng padding 4px của `FilterChipGroup`. Viền khay tabs 2.5px, `tilt-l` đo ra `-1deg`. Console chỉ có thông báo CSP report-only của Vercel Analytics (cũ). Reduced motion: MCP không có công cụ emulate; dựa vào CSS (`@media (prefers-reduced-motion)` ẩn `.skeleton::after`, khối sẵn có chặn `animation-duration`) và `motion-safe:` ở checkbox, `useReducedMotion` ở Loader/TomoBubble.

## Quyết định

- **Thêm token `--control-edge`** (lệch spec một chút, có lý do): sáng = `--outline`; tối = `#8A7465`. Viền `--outline` tối `#0B0705` chỉ ~1.3:1 so với thẻ `#2E221C`, nên ô chưa tick, ô nhập, track switch/slider gần như biến mất ở dark mode (thấy rõ ở ảnh trước khi sửa). `#8A7465` đạt 3.5:1 trên `--surface`, 4.1:1 trên `--surface-page` (WCAG 1.4.11), có test. Chỉ viền của control dùng nó; bóng cứng vẫn `--outline`. Nếu chủ dự án muốn đúng tuyệt đối spec thì đổi `--control-edge` tối về `var(--outline)` một dòng.
- **Avatar**: hash là DJB2 trên tên, mod 6 màu kẹo. Hai nơi gọi (`user-menu`, `account-settings`) đang ghi đè `bg-surface-raised` nên màu kẹo không bao giờ hiện; sửa 2 file này (sạch trong `git diff`, mỗi file vài dòng, truyền `name`). Lưu ý `initial` (1 ký tự) vẫn là children, `name` là tên/email nên màu ổn định theo người dùng.
- **Tabs** `flex-1` mỗi tab và `w-full` khay: ít tab thì chia đều, nhiều tab thì cuộn (vì `min-width:auto` giữ nguyên nội dung). Trước đây underline tabs nằm sát trái.
- **StatStrip** bỏ "một dải kẻ chia" của design-system cũ, đổi sang ô sticker rời theo spec §5; `gap-3.5` để bóng 2px không đè ô bên cạnh.
- **Sticker nhỏ ≤ 32px dùng `border-2`**, lớn dùng `--outline-w` 2.5px (`border-sticker`).
- **SessionTomatoes aria-label** dùng khoá có sẵn `timerUi.sessionOf` (current = số phiên đang ở, không phải số đã xong); khoá `timerUi.sessionsDone` ("x of y sessions done") là phương án đọc chính xác hơn nếu chủ muốn đổi.
- **StreakPill** dùng `shell.streak` có sẵn, nên batch này chỉ thêm đúng 1 khoá i18n (`tomoBubble.dismiss`).
- **Loader** vẫn mang chuỗi tiếng Anh mặc định (cũ, không có caller nào dùng); không đụng để giữ API.
- `filter-chip.tsx`: giữ nguyên vá `-m-1 … p-1` của phiên khác (đã nằm trong file lúc tôi ghi đè), commit cùng file.
- `/dev/ui` bọc `next-themes` + `I18nProvider` riêng vì route ngoài nhóm `(main)`/`(landing)` không có provider; có chip đổi sáng/tối và ngôn ngữ.

## Follow-up

1. **Dark mode: bóng + viền thẻ vẫn mờ**. Thẻ, nút secondary, tab đang chọn, chip dựa vào chênh nền (thẻ `#2E221C` trên giấy `#1A120F`) vì `--outline` tối gần đen. Đúng spec §3.2 nhưng "sticker" ở dark chủ yếu đọc bằng bóng. Cần chủ dự án xem ảnh `2-3b-ui-390-dark.png`; nếu muốn dày hơn, chỉnh `--outline` tối hoặc thêm viền sáng mảnh cho thẻ (token, không phải primitive).
2. **Caller còn đè giao diện** (ngoài danh sách của tôi): xem mục 2 trong báo cáo 2.3a (`task-selector`, `command-palette`, `task-form-modal`). Thêm: nhiều nơi ghi cứng `border-border` / `h-9` lên Input, Button sẽ không ăn `.field`/sticker; batch 2.4/2.5 quét lại khi chuyển panel.
3. **`StreakChip` ở `app-status-bar`** vẫn tự vẽ (nút viền mảnh + `Fire`). Batch khung app nên thay bằng `<button><StreakPill count/></button>`, và dùng `SessionTomatoes`/`TomoBubble` ở thẻ đồng hồ.
4. `animate-ui/components/buttons/button.tsx` có `buttonVariants` riêng, chưa theo sticker (ngoài danh sách, dùng ở đâu cần rà).
5. `src/components/ui/animated-icons.tsx`, `animated-list.tsx` không thuộc batch, chưa kiểm.
6. Test radio chỉ kiểm focus di chuyển bằng phím mũi tên (Radix chọn ở frame sau, jsdom không thấy); hành vi chọn bằng bàn phím cần kiểm tay ở trình duyệt.

## Câu hỏi còn mở

- Giữ `--control-edge` sáng hơn ở dark (lệch spec nhẹ) hay trả về `--outline`?
- `SessionTomatoes` đọc "Phiên đang ở" (hiện tại) hay "x/y phiên đã xong"?
