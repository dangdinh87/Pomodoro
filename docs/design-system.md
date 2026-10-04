# Design System — Study Bro (Sticker pop + Tomo)

Bản viết lại ngày 05/10/2026 cho rebrand "Sticker pop" (thay bản "phẳng, tối, tối giản" 01/10/2026). Nguồn quyết định: `docs/superpowers/specs/2026-10-05-sticker-pop-rebrand-design.md`. Giá trị thật nằm ở `src/app/globals.css` (token, utility), `src/config/themes.ts` (bộ màu), `src/components/ui/*` (primitive), `src/components/brand/*` (Tomo, Logo), `src/features/mascot/*` (lời và biểu cảm của Tomo). Trang trưng bày mọi primitive: `/dev/ui` (chỉ có ở môi trường dev).

Tài liệu này chỉ ghi **cái đã làm xong và chạy được**. Muốn đổi, sửa token trước, rồi mới sửa component.

---

## 1. Nguyên tắc

1. **Mọi thứ nổi là một sticker**: thẻ, nút, ô nhập, popover, modal có viền đậm (`--outline`, 2.5px) và bóng cứng không nhoè. Phẳng nhưng có chiều sâu vật lý.
2. **Chữ đậm trên nền màu**: chữ và icon đặt trên nền màu đặc luôn là `--on-accent` (nâu đậm `#2A1A14`), **không bao giờ chữ trắng**. Nhờ vậy mọi màu pastel đều đạt AA.
3. **Bấm là thấy lún**: hover nhích lên 1px, `:active` dịch xuống đúng bằng độ dày bóng.
4. **Tomo là giọng nói của app**: lời nhắc, màn trống, lỗi, ăn mừng đều đi qua Tomo. Khi đang tập trung, Tomo im lặng.
5. **Đồng hồ là trọng tâm**: hoạ tiết, độ nghiêng, sticker chỉ ở khung và điểm nhấn.
6. **Phá cách có chừng mực**: độ nghiêng ±1° chỉ dành cho phần tử **trang trí** (thẻ landing, toast, modal ăn mừng, thẻ 404). Form, danh sách, bảng, thông báo lỗi luôn thẳng.

Màu để nhận diện và trang trí; màu truyền **nghĩa** (thành công, lỗi…) dùng bộ tone riêng ở mục 2.4. Không dùng màu kẹo để báo trạng thái.

---

## 2. Token

Tên token cũ (`--ink*`, `--surface*`, `--border*`, `--accent*`, tone) được giữ để code cũ tự đổi theo. Sáng là mặc định; tối là tuỳ chọn, chọn ở Cài đặt → Giao diện (Sáng / Tối / Theo hệ thống).

### 2.1 Bề mặt, chữ, viền

| Token | Sáng | Tối | Dùng cho |
|---|---|---|---|
| `--surface-page` | `#FFF3E0` | `#1A120F` | nền trang (giấy kem + hoạ tiết `--doodle`) |
| `--surface` | `#FFFCF6` | `#2E221C` | thẻ, popover, modal (tối: **sáng hơn nền** để viền đen còn đọc được) |
| `--surface-raised` | `#FCEBD2` | `#3A2C24` | ô con trong thẻ, track |
| `--surface-hover` | `#FFE6C2` | `#45352B` | hover hàng/ô |
| `--ink` | `#2A1A14` | `#FFF3E0` | chữ chính |
| `--ink-secondary` | `#5A4038` | `#E8D5C0` | |
| `--ink-muted` | `#7A6158` | `#C2AA96` | chữ phụ, ≥ 4.5:1 trên `--surface-page` |
| `--ink-faint` | `#A48E83` | `#8A7465` | trạng thái tắt/trang trí, **không** cho chữ cần đọc |
| `--border` | `#EAD6BF` | `#4A392E` | vạch chia mảnh bên trong thẻ |
| `--outline` | `#2A1A14` | `#0B0705` | viền và bóng sticker |
| `--on-accent` | `#2A1A14` | `#2A1A14` | chữ/icon trên mọi nền màu đặc |
| `--control-edge` | `= --outline` | `#8A7465` | viền của control (xem dưới) |

**Vì sao có `--control-edge` (lệch spec).** Viền `--outline` tối là `#0B0705`, chỉ ~1.3:1 so với thẻ `#2E221C`, nên ô chưa tick, ô nhập, track của switch/slider gần như biến mất ở dark mode, trái WCAG 1.4.11 (thành phần giao diện cần ≥ 3:1). `#8A7465` đạt 3.5:1 trên `--surface` và 4.1:1 trên `--surface-page` (có test). Chỉ **viền control** dùng token này; bóng cứng vẫn là `--outline`. Muốn đúng tuyệt đối spec thì đổi một dòng, nhưng sẽ vi phạm 1.4.11.

### 2.2 Primary ("Cà chua", khối PRIMARY trong `globals.css`)

| Token | Sáng | Tối | Dùng cho |
|---|---|---|---|
| `--accent-solid` | `#FF5A36` | `#FF5A36` | nền nút chính, chip đang chọn (chữ `--on-accent`, 5.4:1) |
| `--accent-solid-hover` | `#FF7050` | `#FF7050` | |
| `--accent` | `#C2330F` | `#FF8A6B` | chữ link, gạch chân, vòng focus (≥ 4.5:1 trên giấy) |
| `--accent-hover` | `#9E290B` | `#FFA38A` | |
| `--accent-soft` / `--accent-ink` | `#FFD9CC` / `#8F2711` | `#5C2E22` / `#FFB09C` | nền nhạt mang primary / chữ trên nền đó |

Bộ màu người dùng chọn (`src/config/themes.ts`) chỉ ghi đè đúng khối này qua `<style id="app-theme-vars">`: **Cà chua** (mặc định), **Bạc hà**, **Bơ**, **Oải hương**, **Trời**, **Đào**. Mỗi bộ phải đạt hai điều (test `themes.test.ts`, cả sáng và tối): `--on-accent` trên `--accent-solid` ≥ 4.5:1 và `--accent` trên `--surface-page` ≥ 4.5:1. Key cũ không còn trong danh sách về Cà chua. Thêm bộ mới: thêm vào `themePresets`, thêm tên và mô tả vào `settings.general.theme.themes.*` ở 3 file locale, chạy test.

### 2.3 Màu kẹo (nhận diện, trang trí)

`--candy-tomato #FF5A36` · `mint #7BDCB5` · `butter #FFD45C` · `lilac #C9B6FF` · `sky #7CC8FF` · `peach #FFB38A`. Class `bg-candy-*`. Luôn đi với chữ `text-on-accent`. Giữ nguyên ở dark mode. Màu theo chế độ timer (vùng `[data-timer][data-mode]`): tập trung = cà chua, nghỉ ngắn = bạc hà, nghỉ dài = trời.

### 2.4 Tone theo nghĩa

Class `success|warning|danger|info|ai` với các đuôi `-bg` và `-ink`. `DEFAULT` là nền đặc (chữ `--on-accent`); `-bg` là panel nhạt đi với chữ `-ink`. **Không** dùng `text-success|warning|danger|info|ai|gold` làm màu chữ trên giấy (pastel đặc không đủ tương phản): chữ dùng `text-*-ink`. Test `primitives-contrast.test.ts` chặn lỗi này tái phát.

| Tone | `DEFAULT` | `-bg` sáng | `-ink` sáng |
|---|---|---|---|
| success | `#7BDCB5` | `#DDF6EA` | `#13603F` |
| warning | `#FFD45C` | `#FFF2C7` | `#7A5200` |
| danger | `#FF8A75` | `#FFE1DA` | `#9B2410` |
| info | `#7CC8FF` | `#DDEFFF` | `#0F4C81` |
| ai | `#C9B6FF` | `#EEE7FF` | `#4B2C9E` |

`--gold #FFB800` (streak, cúp) luôn đi với viền `--outline`.

### 2.5 Hình khối

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--outline-w` | `2.5px` (`2px` cho phần tử ≤ 32px cao: `border-2`) | mọi sticker |
| `--shadow-sticker-sm` / `-` / `-lg` | `2px` / `4px` / `6px` đổ chéo xuống phải, màu `--outline` | chip, input / nút, thẻ, popover / modal, thẻ đồng hồ, thẻ 404 |
| `--radius` / `-lg` / `-xl` | `12px` / `20px` / `28px` | input, nút, hàng / thẻ, popover, sheet / modal, thẻ đồng hồ |
| pill | `999px` | chip, badge, switch |

Utility trong `globals.css`: `.sticker`, `.sticker-sm`, `.sticker-lg` (nền surface + viền + bóng + bo), `.sticker-press` (hover nâng 1px, bấm lún), `tilt-l` / `tilt-r` (±1°, dùng thuộc tính `rotate` nên cộng được với lún khi bấm; khai bằng `@utility` nên dùng được với `group-*:`, `data-*:`), `border-sticker`, `.field` (ô nhập), `.focus-ring` (vòng focus 3px `--accent`, cách 3px), `.skeleton`, `.paper-bg` (hoạ tiết giấy). Mọi giá trị đọc token nên tự đổi theo dark mode.

---

## 3. Class Tailwind

Tailwind v4, ánh xạ trong khối `@theme inline` của `globals.css`. **Không viết** `text-blue-500`, `bg-zinc-800`, `text-white`, mã hex trong component. Ngoại lệ duy nhất: màu nội tại của mini game và biểu đồ (`--blue-solid`… giữ chữ trắng).

| Cần | Class |
|---|---|
| chữ | `text-ink`, `text-ink-secondary`, `text-ink-muted` (`text-ink-faint` chỉ trang trí) |
| nền | `bg-surface`, `bg-surface-page`, `bg-surface-raised`, `bg-surface-hover` |
| primary | `bg-primary` (= `--accent-solid`), `text-brand` (= `--accent`), `bg-brand-soft text-brand-ink`, `text-on-accent` |
| kẹo | `bg-candy-tomato\|mint\|butter\|lilac\|sky\|peach` + `text-on-accent` |
| tone | `bg-success-bg text-success-ink`, `bg-success text-on-accent`… |
| viền, bóng | `border-outline`, `border-sticker`, `border-control-edge`, `shadow-sticker[-sm\|-lg]` |

Cẩn thận: `text-accent` / `bg-accent` là **màu hover của shadcn** (= `--surface-hover`), không phải primary. Primary là `brand`.

---

## 4. Chữ

| Vai trò | Font | Biến |
|---|---|---|
| Tiêu đề, số, đồng hồ, nhãn nút | **Baloo 2** 600–800 | `--font-heading` (`font-heading`) |
| Đoạn văn, control | **Nunito** 500–800 | `--font-body` |
| Phím tắt, code | JetBrains Mono 400 | `--font-mono` |

- Nạp bằng `next/font/google`, subset `latin` + `vietnamese`, dạng variable (một file mỗi subset). Biến gắn trên `<html>`. Cài đặt font thân bài: Nunito (mặc định) hoặc Hệ thống.
- Tiếng Nhật không tải font web; cả hai stack có fallback `Hiragino Maru Gothic ProN`, `Yu Gothic`, `Meiryo`.
- Nhãn nút và tiêu đề nhỏ: viết hoa đầu câu, Baloo 700. **Không** chữ hoa toàn bộ (dấu tiếng Việt khó đọc). Số liệu: `font-heading font-bold tabular-nums`.
- Trang đọc dài: độ rộng `68ch` (tiếng Nhật `42em`, vì mỗi ký tự rộng 1em; dùng `[&:lang(ja)]:`), `leading-[1.75]` (tiếng Nhật `1.95`). Tiêu đề dùng `text-balance`, đoạn dẫn dùng `text-pretty` để khỏi mồ côi chữ.
- Ô nhập trên mobile phải ≥ 16px (đã có trong `globals.css`) để iOS không tự phóng to.

---

## 5. Icon

- **Phosphor**, import từ `@phosphor-icons/react/dist/ssr`. Mặc định `weight="bold"` trong control, `weight="fill"` trong ô icon màu. Luôn truyền `size`.
- **Dùng tên cũ** (`Armchair`, `Timer`, `CaretDown`), **không** dùng bí danh `*Icon` (`ArmchairIcon`) dù thư viện đánh dấu tên cũ là deprecated: `next.config.ts` có `modularizeImports` ánh xạ tên import sang file (`dist/ssr/{{member}}`), nên `ArmchairIcon` làm build lỗi "Can't resolve". Type-check không bắt được lỗi này.
- **`IconTile`** (`ui/icon-tile.tsx`, server-safe, `aria-hidden`): ô vuông bo 10–12px, viền, nền kẹo, icon `text-on-accent`. `tone`: `tomato|mint|butter|lilac|sky|peach|surface` (`surface` dùng `text-ink` vì `on-accent` sẽ biến mất trên nền tối). `size`: `sm` 28 · `md` 36 · `lg` 48px. Dùng trong dock, header panel, mục menu, thẻ landing. Màu ô theo **dock** (việc = butter, âm thanh = sky, không gian = lilac, đồng hồ = mint, thống kê = tomato, arcade = peach) để một tính năng cùng màu ở mọi nơi.
- Cấm Sparkles ✨ và emoji làm icon. Ngọn lửa streak, quả cà chua đếm phiên, Google, Tomo là SVG riêng.

---

## 6. Chuyển động

- Thư viện: `motion/react`. Không dùng `framer-motion`.
- Pop-in của overlay (dialog, popover, menu, select, command) bằng CSS theo `data-state` của Radix: scale 0.92 → 1, 200–300ms, `cubic-bezier(.34,1.56,.64,1)` (≈ spring 420/22). Thoát 150ms. Radix tự chờ animation thoát, không cần `AnimatePresence`. Bong bóng Tomo, thẻ ăn mừng dùng spring `{ type: 'spring', stiffness: 420, damping: 22 }`.
- Nút, ô sticker bấm được: 0.08s. Checkbox nảy khi tick (`motion-safe:animate-tick-pop`). Tomo thở nhẹ (scale 1 → 1.03, 3s) khi đứng yên.
- **Reduced motion**: `globals.css` chặn toàn cục `animation-duration`/`transition-duration` khi `prefers-reduced-motion`. Animation lặp vô hạn bằng JS (motion, confetti, rAF) phải tự gọi `useReducedMotion()` và đứng yên. Tailwind dùng tiền tố `motion-safe:` hoặc `motion-reduce:`.

---

## 7. Primitive (`src/components/ui/*`)

Props và tên variant **không đổi**; chỉ thêm. Thấy primitive làm sẵn thì dùng, đừng tự vẽ lại.

| Primitive | Quy tắc dùng |
|---|---|
| `Button` | `default` (primary), `secondary`/`outline`, `ghost`, `destructive`, `link`, thêm `fun` (butter). Kích thước `sm` 34 · `default` 42 · `lg` 50 · `icon` 40. **Một nút chính mỗi khu vực.** Nhãn: động từ + đối tượng, 2–5 chữ, không ghi đè màu nền bằng `style`. Hình khối nằm ở `.btn*` trong `globals.css` |
| `Input`, `Textarea`, `Label`, select trigger | dùng `.field` (viền `--control-edge`, bóng nhỏ, cao 42px). Focus: bóng đổi sang `--accent-solid` + vòng 3px. `aria-invalid="true"` đổi sang tone danger. Placeholder `ink-muted` |
| `Checkbox`, `RadioGroup`, `Switch`, `Slider` | ô 22px có viền; switch bật = `candy-mint`; slider track 10px. Vùng chạm ≥ 34px. Tất cả dùng `.focus-ring` |
| `Tabs` | điều hướng nội dung: khay pill có viền, tab chọn là ô nổi |
| `FilterChip` | lọc/bật tắt trạng thái (`aria-pressed`), chọn = `bg-primary text-on-accent`. **Không trộn tab và chip** |
| `Badge` | pill viền 2px, tone `-bg` + `-ink`, 9 variant cũ |
| `Card` | `.sticker` (có header/footer). `StickerCard` (`tilt`, `size` sm/md/lg, có padding sẵn) cho ô trang trí |
| `Dialog`, `AlertDialog` | thẻ `rounded-xl` `.sticker-lg`, scrim 40% `--outline`, nút đóng tròn có viền, nhãn `common.close` |
| `Sheet` | cạnh trong bo, viền, bóng đổ về phía trang; `SheetHeader icon=` thêm ô icon |
| `Popover`, `DropdownMenu`, `Select` (content), `Command` | `.sticker`, `sideOffset` 8. Hàng đang chọn: nền `candy-sky` nhạt + viền + tick bên phải. Hàng đang highlight: `--surface-hover` + vòng 2px `--accent` (khác hẳn hàng đã chọn) |
| `Tooltip` | nền `--ink`, chữ `--surface`, bo 10px, không nghiêng |
| `Toaster` (sonner) | thẻ `tilt-l`, ô icon theo tone, theo theme thật |
| `Skeleton`, `Loader` | `.skeleton` (vệt sáng tắt khi reduced-motion); `Loader` là Tomo nhảy tại chỗ |
| `EmptyState` | Tomo (`face?`) + tiêu đề + mô tả + một nút chính |
| `StatStrip`, `PageHeader`, `Kbd`, `Table`, `Separator`, `ScrollArea`, `Calendar`, `Avatar` | theo token và viền mới; `Avatar` lấy nền kẹo theo hash tên |
| `StreakPill`, `SessionTomatoes`, `TomoBubble` | primitive thương hiệu: `candy-butter` + lửa SVG / 4 quả cà chua đếm phiên / Tomo kèm bong bóng thoại (bấm để ẩn, nhớ trong sessionStorage) |

Quy tắc bố cục: trang nội dung `max-w-[1180px]` với lề `px-[clamp(16px,4vw,32px)]`; lưới dùng `minmax(0,1fr)`; **kiểm mọi màn ở 390px, không tràn ngang**. Chừa chỗ cho bóng cứng và vòng focus (không để `overflow-hidden` hoặc `overflow-auto` sát mép sticker: nó cắt viền và bóng).

### 7a. Mini player YouTube và thẻ timer vừa một màn hình

- **Mini player** (`components/audio/youtube/youtube-mini-player.tsx`, gắn một lần trong `AppProviders`): thẻ `.sticker` ghim góc dưới trái, trên dock (desktop) hoặc thanh tab (mobile), `z-40` (trên dock, dưới panel và dialog). YouTube yêu cầu player nhúng **nhìn thấy được, ≥ 200×200 px, không bị che**, nên iframe chỉ được tạo trong `#youtube-player-slot` của thẻ này (không còn container ẩn); đóng thẻ là xoá iframe. Thu gọn = bỏ tiêu đề và thanh âm lượng, video giữ đúng 200×200 và **vẫn phát** (không bao giờ tạm dừng chỉ vì thu gọn). Slot không có viền hay padding riêng (border-box sẽ ăn vào 200px). Khi timer chạy và chuột đứng yên, thẻ **mờ còn 50%** (`[data-mini-player]` trong `globals.css`) chứ không ẩn như `[data-chrome]`.
- **Thẻ timer vừa một màn hình**: section quanh thẻ chừa 160px (thanh trạng thái + dock) nên thẻ cao tối đa `100dvh - 160px`. `.stage-card` (`globals.css`) có biến `--stage-*` co theo `--stage-t` (1 khi cao ≥ 820px, về 0 ở 640px): Tomo, khoảng cách, chữ số (160 → 108px), nút chính (56 → 48px); gợi ý phím ẩn khi cao ≤ 700px. Thẻ thật và khung SSR 25:00 (`app-home-skeleton.tsx`) đọc **cùng** biến, `stage-layout.test.ts` canh điều đó. Thêm khối vào thẻ thì phải dùng biến, rồi đo lại ở 1366×657, 1366×768, 1440×789, 1440×900, 390×664 (thẻ không chạm dock, CLS = 0).
- **Vỏ cuộn trong suốt**: hộp thoại chỉ làm khung cho một thẻ sticker (đăng nhập, `DialogPanel bare` trong `panel-host.tsx`) chừa `p-2` quanh thẻ; `overflow-y-auto` trên vỏ vẫn cần cho màn thấp, nhưng nó cắt mọi thứ nhô ra khỏi padding box, nên chừa chỗ cho viền 2.5px và bóng 6px. Panel là chính một thẻ (Cài đặt, Góp ý) thì để `p-0` và tràn mép.

---

## 8. Tomo

Quả cà chua có mặt, vẽ bằng code (`tomo-art.ts` là dữ liệu một nguồn cho React, favicon và ảnh OG). Màu đọc token (`--candy-tomato`, `--outline`, `--on-accent`) nên theo sáng/tối.

```tsx
<Tomo face="happy" size={96} title="…" tight />   // face: happy | focus | party | sleepy | worried
<Logo variant="full" | "mark" size={28} />          // đầu Tomo + chữ "Study Bro" (Baloo 2 800)
<TomoBubble face id onDismiss>{lời}</TomoBubble>
```

| Biểu cảm | Dùng khi |
|---|---|
| `happy` | chào, màn trống, đăng nhập, landing |
| `focus` | đang tập trung (thu nhỏ cạnh tên việc), im lặng |
| `party` | vừa xong phiên tập trung (modal ăn mừng) |
| `sleepy` | giờ nghỉ, khuya, **trang 404** |
| `worried` | sắp mất chuỗi, **lỗi** (`error.tsx`, `global-error.tsx`), lỗi đăng nhập |

- Có `title` khi Tomo đứng một mình và mang nghĩa (404): `role="img"` + `<title>`. Không có `title` thì `aria-hidden` (Tomo cạnh một tiêu đề đã nói đủ).
- `Tomo` là server-safe (không hook). Muốn animation, bọc bằng `motion.div`.
- Cỡ nhỏ (≤ 40px) viền tự dày lên để 5 mặt vẫn phân biệt được.

**`pickTomoMood(input) → { face, lineKey | null }`** (`src/features/mascot/pick-tomo-mood.ts`, hàm thuần, có test mọi nhánh). Duyệt từ trên xuống, nhánh đầu khớp thắng:

| # | Điều kiện | face | Lời |
|---|---|---|---|
| 1 | vừa xong phiên tập trung (`justCompleted`) | `party` | `celebration` |
| 2 | chế độ tập trung và đang chạy | `focus` | không nói |
| 3 | đang ở chế độ nghỉ | `sleepy` | `breakTip` |
| 4 | chuỗi > 0, hôm nay chưa có phút nào, giờ ≥ 18:00 | `worried` | `keepStreak` |
| 5 | giờ ≥ 23:00 hoặc < 04:00 | `sleepy` | `sleep` |
| 6 | còn lại | `happy` | `greetingMorning` / `Afternoon` / `Evening` |

Đầu vào: `mode`, `isRunning`, `justCompleted`, `streak`, `todayFocusMinutes`, `now`. Mỗi tình huống có 4 câu, xoay theo ngày học (không lặp liền nhau). Khoá `tomo.lines.<tình huống>.<n>` đủ cả 3 ngôn ngữ (test `tomo-lines.test.ts`). Lời không bịa số liệu.

---

## 9. Trang ngoài app

Ba nhóm, đều SSR (server component render chữ, client chỉ cho tương tác). Landing dưới màn đầu trên `/` dùng **H2/H3** vì H1 thuộc app; mỗi trang đúng một H1.

- **Landing** (`components/landing/*`): `FeaturesSSR` (thẻ `StickerCard` nghiêng xen kẽ, `IconTile` theo dock, Tomo `happy` cạnh tiêu đề), `HowItWorks` (thanh chu kỳ tô màu theo chế độ timer, chữ `on-accent`, ba thẻ chế độ), `FAQ` (`<details>` gốc để câu trả lời luôn nằm trong HTML, Tomo `happy`), `Footer`, `site-header`. JSON-LD FAQ lấy từ cùng `getFaqItems` nên không lệch.
- **Hướng dẫn, quyền riêng tư, điều khoản** (`doc-layout`, `legal-page`): mục lục dạng chip có số (một hàng cuộn ngang trên điện thoại), nội dung nằm trên một thẻ `.sticker-lg`. Có dòng "Cập nhật lần cuối" (`<time dateTime>`). Trang hướng dẫn thêm mục **Nguồn tham khảo** (Cirillo 2018; DeskTime 2014, ghi rõ là phân tích của một công ty, không phải nghiên cứu đối chứng) vì E-E-A-T.
- **404, lỗi, đăng nhập**: một thẻ sticker, một nút chính, Tomo `sleepy` (404) hoặc `worried` (lỗi). Thẻ lỗi không nghiêng.
  - `not-found.tsx` render trong root layout, ngoài provider của `(main)` và `(landing)`, nên tự bọc `next-themes` (`attribute="data-theme"`) để theo lựa chọn Sáng/Tối đã lưu.
  - `global-error.tsx` thay cả root layout nên **tự đủ**: `<html>`/`<body>` riêng, copy 3 ngôn ngữ riêng (`lib/i18n/global-error-copy.ts`), một khối CSS thuần chép token từ `globals.css`, font hệ thống. Không phụ thuộc Tailwind hay `globals.css`. Đọc theme từ `localStorage.theme` sau khi mount.
  - `RouteError` (`components/shared/route-error.tsx`) dùng chung cho `(main)/error.tsx` và `(landing)/error.tsx`. Cần `I18nProvider` ở trên.
  - `LoginForm`: thẻ sticker, Tomo `happy` (đổi sang `worried` khi có lỗi), nút "Gửi mã" là nút chính, "Tiếp tục với Google" là nút phụ.

---

## 10. Dark mode

- Bật bằng `<html data-theme="dark">` (next-themes, `attribute="data-theme"`, `defaultTheme="light"`, `enableSystem`). Selector token tối là `:root[data-theme='dark']` (gắn vào `<html>`, để cây con tự theo theme). Không dùng class `.dark`; biến thể Tailwind `dark:` vẫn chạy nhưng hạn chế dùng, hãy đọc token.
- Đừng ghi cứng `data-theme="dark"` ở cây con.
- Ở tối: thẻ **sáng hơn** nền, viền và bóng đen; viền control dùng `--control-edge` (mục 2.1). Bóng cứng đen trên nền nâu đậm kém rõ hơn ở sáng; nhận diện sticker ở tối chủ yếu nhờ chênh nền.
- Màu kẹo và `--accent-solid` giữ nguyên ở tối; chữ trên chúng vẫn `--on-accent`.

---

## 11. Viết câu chữ (VI / EN / JA)

Câu chữ nằm ở `src/i18n/locales/{en,vi,ja}.json`; mọi khoá phải có đủ 3 ngôn ngữ (`pnpm i18n:check`). Không viết `t('key') || 'fallback'`: khoá thiếu phải làm kiểm tra đỏ, không được che. Server dùng `getT()` (`lib/server-translations.ts`), client dùng `useI18n()`.

- **VI**: người dùng là **"bạn"**, Tomo xưng **"mình"** ("Mình bắt đầu một phiên nhé?"). Câu ngắn, ấm, không "Vui lòng…" dài dòng, không dịch máy. Chính tả giữ kiểu cũ nhất quán ("xoá", "hoà", "Huỷ").
- **JA**: thể です/ます, thân mật vừa phải, lời Tomo kết bằng ですよ・ましょう. Tên Tomo viết **トモ**. "集中" đã là tên chế độ timer nên chế độ toàn màn hình gọi là フォーカスモード. Tên thương hiệu viết Latin.
- **EN**: ngắn, chủ động, sentence case.
- Nhãn nút theo câu chuẩn ngành, ngắn. Không bịa công dụng, không ghi cứng số liệu đếm trong chữ tĩnh. Chỉ nói về tính năng đang có (đã gỡ: chat, bảng xếp hạng, AI coach, Spotify).
- Tên "Study Bro" không dịch. Không đánh số 01/02 trừ khi là trình tự thật, không gắn `→` vào nhãn nút.

**Bảng thuật ngữ** (theo batch 1D):

| Khái niệm | EN | VI | JA |
|---|---|---|---|
| phiên tập trung | focus session | phiên tập trung | 集中セッション |
| nghỉ ngắn / dài | short / long break | nghỉ ngắn / nghỉ dài (chung: giờ nghỉ) | 短い休憩 / 長い休憩 |
| việc | task | việc | タスク |
| hẹn giờ / mặt số | timer / clock | hẹn giờ (công cụ), đồng hồ (mặt số) | タイマー / 時計 |
| đặt lại | reset | đặt lại | リセット |
| chuông báo | alarm / bell | chuông | アラーム（総称）、ベル / チャイム |
| mẫu có sẵn | preset | mẫu có sẵn; bản phối (mix âm) | プリセット |
| chuỗi ngày | streak | chuỗi ngày | 連続日数 |
| toàn màn hình | focus mode | chế độ toàn màn hình | フォーカスモード |

---

## 12. Nên và không nên

**Nên:** đọc màu, bo góc, bóng từ token · một nút chính mỗi khu vực · chữ `text-on-accent` trên nền màu · dùng primitive có sẵn · kiểm ở 390px và 1440px, sáng và tối, cả VI và JA (dấu tiếng Việt và chữ Nhật dễ vỡ dòng) · mọi animation lặp tôn trọng `prefers-reduced-motion` · Tomo nói giọng "mình".

**Không nên:**
- gradient tím, glow, bóng mờ nhoè, icon Sparkles, emoji làm icon;
- chữ trắng trên nền màu (`text-white`) và `text-success|warning|danger|info|ai|gold` làm chữ;
- nghiêng form, danh sách, bảng, thông báo lỗi (tilt chỉ cho phần tử trang trí);
- trộn tab và chip; nhiều nút chính cùng lúc;
- ghi cứng mã hex, `bg-zinc-*`, `data-theme="dark"` ở cây con, class `.dark`;
- `overflow-hidden`/`overflow-auto` sát mép sticker (cắt viền và bóng);
- import icon bằng bí danh `*Icon`; thêm bộ icon thứ hai.

---

## 13. Việc còn nợ (đã biết)

- Khối landing dưới app (`(main)/page.tsx`) đang tô `bg-surface-page` đặc nên mất hoạ tiết.
- Mini player YouTube trên điện thoại (390px) che nửa dưới thẻ timer vì video phải ≥ 200×200 (xem mục 7a); chưa có cách kéo đi chỗ khác.
- Tiêu đề tab của 404 và trang lỗi là "Study Bro App" (từ metadata root).
- Khi chuyển trang ngoài app xuống `src/app/[lang]` (giai đoạn 3), `not-found`, `global-error` và layout `(landing)` cần xem lại cách lấy ngôn ngữ và theme.
