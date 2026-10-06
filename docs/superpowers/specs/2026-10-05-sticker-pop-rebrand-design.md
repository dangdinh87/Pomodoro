---
title: "Study Bro — rebrand Sticker pop + linh vật Tomo"
status: draft — chờ chủ dự án duyệt
created: 2026-10-05
branch: feat/design-system (làm chung nhánh, theo yêu cầu chủ dự án)
mockup: .superpowers/brainstorm/33705-1791132950/content/visual-direction.html (hướng B)
supersedes: docs/design-system.md (bản "phẳng, tối, tối giản" 01/10/2026)
---

# Study Bro — rebrand "Sticker pop" + linh vật Tomo

## 1. Mục tiêu

Làm lại **toàn bộ** giao diện và nhận diện thương hiệu Study Bro theo phong cách dễ thương, phá cách, có chất "game" kiểu Duolingo nhưng không sao chép Duolingo.

**Chủ dự án đã chốt (04–05/10/2026):**

| Quyết định | Chọn |
|---|---|
| Linh vật | Quả cà chua có mặt, tên **Tomo** (từ "tomato"; 友 = "bạn" trong tiếng Nhật) |
| Nền | **Sáng làm chủ đạo**; dark mode là tuỳ chọn |
| Phạm vi | **Toàn bộ**: thương hiệu, design system, mọi component nền (button, modal, popover, select…), mọi màn |
| Game hoá | **Chỉ giao diện + linh vật phản ứng theo trạng thái**. Không thêm backend (XP, level, huy chương để sau) |
| Hướng hình ảnh | **B · Sticker pop** — viền nâu đậm, bóng đổ cứng, nền giấy kem, màu pastel tươi |
| Không gian WebGL | **Giữ, làm nền tuỳ chọn**. Mặc định là giấy kem có hoạ tiết |
| Cách làm | Thay tại chỗ, đi từ token (mục 9) |

**Thành công nghĩa là:**
- Mở app ra thấy ngay một thương hiệu có cá tính, vui và dễ thương mà vẫn dễ tập trung.
- Mọi cặp chữ/nền đạt WCAG AA. Không tràn ngang ở 390px. Có `prefers-reduced-motion`.
- Không có "AI slop": không gradient tím, không glow, không icon Sparkles.
- Toàn bộ test hiện có vẫn pass, chức năng không đổi.

## 2. Nguyên tắc thiết kế

1. **Mọi thứ là một sticker.** Khối nổi (thẻ, nút, ô nhập, popover, modal) có viền nâu đậm và bóng đổ cứng không nhoè. Phẳng nhưng có chiều sâu vật lý.
2. **Chữ đậm màu trên nền màu.** Chữ trên nền màu luôn là `--on-accent` (nâu đậm `#2A1A14`), không dùng chữ trắng. Nhờ vậy mọi màu pastel đều đạt AA.
3. **Bấm là thấy lún.** Nút và ô bấm được dịch xuống đúng bằng độ dày bóng khi bấm (`:active`). Hover nhích lên 1px.
4. **Tomo là giọng nói của app.** Lời nhắc, màn trống, lỗi, ăn mừng đều đi qua Tomo. Khi đang tập trung, Tomo im lặng.
5. **Đồng hồ vẫn là trọng tâm.** Trang trí (hoạ tiết, độ nghiêng, sticker) chỉ nằm ở khung và điểm nhấn, không chen vào vùng đồng hồ.
6. **Phá cách có chừng mực.** Độ nghiêng (±0.5–1.5°) chỉ dùng cho sticker trang trí, toast, modal ăn mừng, thẻ landing. Form, danh sách, bảng luôn thẳng.

## 3. Token

Giữ **tên token cũ** khi nghĩa không đổi (`--ink*`, `--surface*`, `--border*`, `--accent*`, tone theo nghĩa) để khoảng 160 file đang đọc token tự đổi theo. Thêm token mới cho phần riêng của sticker.

### 3.1 Màu — sáng (mặc định)

| Token | Giá trị | Ghi chú |
|---|---|---|
| `--surface-page` | `#FFF3E0` | giấy kem, có hoạ tiết doodle (mục 7.2) |
| `--surface` | `#FFFCF6` | thẻ, popover, modal |
| `--surface-raised` | `#FCEBD2` | ô con trong thẻ, track |
| `--surface-hover` | `#FFE6C2` | hover hàng/ô |
| `--ink` | `#2A1A14` | chữ chính, cũng là màu viền sticker |
| `--ink-secondary` | `#5A4038` | |
| `--ink-muted` | `#7A6158` | ≥ 4.5:1 trên `--surface-page` |
| `--ink-faint` | `#A48E83` | chỉ cho trạng thái tắt/trang trí, không cho chữ cần đọc |
| `--border` | `#EAD6BF` | vạch chia mảnh bên trong thẻ |
| `--border-strong` | `#2A1A14` | = `--outline` |
| **`--outline`** (mới) | `#2A1A14` | viền sticker |
| **`--on-accent`** (mới) | `#2A1A14` | chữ/icon trên mọi nền màu đặc |

**Primary (khối PRIMARY, bộ màu "Cà chua"):**

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--accent-solid` | `#FF5A36` | nền nút chính, chip đang chọn (chữ `--on-accent`, ≈5.4:1) |
| `--accent-solid-hover` | `#FF7050` | |
| `--accent` | `#C2330F` | chữ link, gạch chân tab, vòng focus (≈5:1 trên giấy kem) |
| `--accent-hover` | `#9E290B` | |
| `--accent-soft` | `#FFD9CC` | nền nhạt mang màu primary |
| `--accent-ink` | `#8F2711` | chữ trên `--accent-soft` |
| `--accent-edge` | `= --outline` | giữ tên để code cũ không gãy |

**Màu kẹo (mới) — để nhận diện và trang trí, luôn đi với chữ `--on-accent`:**
`--candy-tomato #FF5A36` · `--candy-mint #7BDCB5` · `--candy-butter #FFD45C` · `--candy-lilac #C9B6FF` · `--candy-sky #7CC8FF` · `--candy-peach #FFB38A`.
Class Tailwind: `bg-candy-mint` và các màu cùng họ. Dùng cho ô icon của dock và panel, sticker trang trí, avatar, thẻ landing. **Không** dùng để truyền nghĩa trạng thái.

**Tone theo nghĩa** (giữ class `success|warning|danger|info|ai` với các đuôi `-bg`/`-ink`). Nền đặc (`DEFAULT`) nay mang chữ `--on-accent`:

| Tone | DEFAULT (đặc) | `-bg` | `-ink` |
|---|---|---|---|
| success | `#7BDCB5` | `#DDF6EA` | `#13603F` |
| warning | `#FFD45C` | `#FFF2C7` | `#7A5200` |
| danger | `#FF8A75` | `#FFE1DA` | `#9B2410` |
| info | `#7CC8FF` | `#DDEFFF` | `#0F4C81` |
| ai | `#C9B6FF` | `#EEE7FF` | `#4B2C9E` |

`--gold` (streak, cúp) là `#FFB800`, đi với viền `--outline`.

**Màu theo chế độ timer** (vùng `[data-timer][data-mode]`, cơ chế giữ nguyên): Tập trung = cà chua. Nghỉ ngắn = bạc hà (`--accent-solid #7BDCB5`, `--accent #1E7A57`). Nghỉ dài = trời (`--accent-solid #7CC8FF`, `--accent #1A5F99`).

### 3.2 Màu — tối (tuỳ chọn)

Chất sticker trong dark mode: **thẻ sáng hơn nền, viền và bóng màu đen**.

| Token | Giá trị |
|---|---|
| `--surface-page` | `#1A120F` |
| `--surface` | `#2E221C` |
| `--surface-raised` | `#3A2C24` |
| `--surface-hover` | `#45352B` |
| `--ink` / `-secondary` / `-muted` / `-faint` | `#FFF3E0` / `#E8D5C0` / `#C2AA96` / `#8A7465` |
| `--border` | `#4A392E` |
| `--outline` | `#0B0705` |
| `--accent` (chữ) | `#FF8A6B` |

Màu kẹo và `--accent-solid` giữ nguyên ở dark mode. Chữ trên chúng vẫn là `--on-accent` nâu đậm.

- Bỏ `forcedTheme="dark"` ở `app-providers.tsx` và `(landing)/layout.tsx`. Mặc định là `light`.
- Thêm lựa chọn Sáng / Tối / Theo hệ thống trong Cài đặt → Chung.

### 3.3 Viền, bóng, bo góc

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--outline-w` | `2.5px` (`2px` cho phần tử ≤ 32px cao) | mọi sticker |
| `--shadow-sticker-sm` | `2px 2px 0 var(--outline)` | chip, ô nhỏ, input |
| `--shadow-sticker` | `4px 4px 0 var(--outline)` | nút, thẻ, popover |
| `--shadow-sticker-lg` | `6px 6px 0 var(--outline)` | modal, thẻ đồng hồ, thẻ landing |
| `--radius` | `12px` | input, nút, hàng |
| `--radius-lg` | `20px` | thẻ, popover, sheet |
| `--radius-xl` (mới) | `28px` | modal, thẻ đồng hồ |
| pill | `999px` | chip, pill trạng thái, switch |

Utility mới trong `globals.css`: `.sticker` (viền + bóng + nền surface), `.sticker-sm`, `.sticker-lg`, `.sticker-press` (lún khi bấm), `.tilt-l`/`.tilt-r` (±1°). Tất cả đọc token, nên tự đổi theo dark mode.

### 3.4 Chữ

| Vai trò | Font | Biến |
|---|---|---|
| Tiêu đề, số, đồng hồ, nhãn nút | **Baloo 2** 600/700/800 | `--font-heading` |
| Đoạn văn, control | **Nunito** 500/600/700/800 | `--font-body` |
| Phím tắt, code | JetBrains Mono 400 (giữ) | `--font-mono` |

- Nạp subset `latin` + `vietnamese` bằng `next/font/google`. Gỡ Space Grotesk và Be Vietnam Pro.
- Tiếng Nhật: thêm fallback `"Hiragino Maru Gothic ProN", "Yu Gothic", "Meiryo"` vào cả hai stack. Không tải font Nhật dạng web.
- Đồng hồ: mỗi chữ số nằm trong một ô rộng cố định (`1ch` theo Baloo) để số không giật khi đổi. Dấu `:` là hai chấm tròn vẽ bằng CSS.
- Nhãn nút: viết hoa đầu câu, Baloo 2 700. Không dùng chữ hoa toàn bộ.
- Cài đặt font thân bài: còn **Nunito** (mặc định) và **Hệ thống**. Giá trị cũ đã lưu (Be Vietnam Pro, Space Grotesk) tự quay về Nunito, theo cơ chế fallback sẵn có của `getSavedUiFont`.

### 3.5 Icon

- Giữ Phosphor (`@phosphor-icons/react/dist/ssr`). Mặc định `weight="bold"` trong control và `weight="fill"` trong ô icon màu.
- **Ô icon** (`IconTile`, mới): ô vuông bo 10–12px, nền màu kẹo, viền `--outline`, icon `--on-accent`. Dùng trong dock, header panel, mục select/menu có icon, landing.
- Vẫn cấm Sparkles và emoji làm icon. Ngọn lửa streak và quả cà chua đếm phiên là SVG riêng.

### 3.6 Chuyển động (`motion/react`)

- Spring nảy cho pop-in (popover, modal, toast): `{ type: 'spring', stiffness: 420, damping: 22 }`. Scale đi từ 0.92 lên 1.
- Nút: hover `translate(-1px,-1px)` kèm bóng dày thêm 1px. Active `translate(độ dày bóng)` và bóng về 0. Transition 0.08s.
- Tomo: thở nhẹ khi đứng yên (scale 1 → 1.03, 3s), nhảy khi ăn mừng, lắc khi lo lắng.
- Confetti (`canvas-confetti`, đã có) khi xong một phiên tập trung.
- Mọi animation lặp và confetti tắt khi bật `prefers-reduced-motion` (dùng `useReducedMotion()`). CSS chặn sẵn ở `globals.css`.

## 4. Linh vật Tomo

### 4.1 Hình

- Component `src/components/brand/tomo.tsx`: SVG vẽ bằng code, props `face`, `size`, `className`, `title?`.
  - Gồm thân tròn cà chua, vùng bóng dưới, vệt sáng, lá đài xanh làm "tóc", cuống và má hồng.
  - Viền `--outline` theo phong cách sticker.
- 5 biểu cảm (`face`): `happy`, `focus`, `party`, `sleepy`, `worried`. Bản phác ở mockup, vẽ lại cho chuẩn trong lúc làm.
- Mặc định `aria-hidden`. Có `title` khi đứng một mình và mang nghĩa (ví dụ trang 404).
- Thay hoàn toàn sói PNG: gỡ `public/mascot/wolf_cute.*` cùng các chỗ đang tham chiếu (`not-found.tsx`, `empty-state.tsx`).

### 4.2 Khi nào Tomo hiện biểu cảm nào

Hàm thuần `pickTomoMood(input) → { face, lineKey | null }` đặt ở `src/features/mascot/pick-tomo-mood.ts`, có unit test đủ các nhánh. Ưu tiên từ trên xuống:

| # | Điều kiện | face | Lời thoại |
|---|---|---|---|
| 1 | Vừa xong một phiên tập trung | `party` | hiện trong khung ăn mừng (4.3) |
| 2 | Timer đang chạy ở chế độ Tập trung | `focus` | không nói (Tomo thu nhỏ cạnh tên việc) |
| 3 | Đang ở chế độ nghỉ | `sleepy` | gợi ý nghỉ (đứng dậy, uống nước, nhìn xa) |
| 4 | Chuỗi > 0, hôm nay chưa đạt mức giữ chuỗi, giờ ≥ 18:00 | `worried` | nhắc giữ chuỗi |
| 5 | Giờ ≥ 23:00 hoặc < 4:00 | `sleepy` | nhắc ngủ sớm |
| 6 | Còn lại | `happy` | lời chào theo buổi (sáng/chiều/tối) |

- Đầu vào: `mode`, `isRunning`, `justCompleted`, `streak`, `todayFocusMinutes`, `now`. Lấy từ store timer và dữ liệu streak sẵn có. Không thêm API.
- Mỗi tình huống có 3–4 câu, xoay vòng theo ngày. Khoá i18n `tomo.lines.<tình huống>.<n>`, đủ 3 ngôn ngữ VI/EN/JA. Giọng: Tomo xưng "mình", gọi người dùng "bạn". Câu ngắn, vui, không bịa số liệu.
- Bong bóng thoại (`TomoBubble`) bấm vào thì ẩn, và giữ trạng thái ẩn trong phiên làm việc (sessionStorage).

### 4.3 Ăn mừng khi xong phiên

- `SessionCelebration`: modal sticker nghiêng nhẹ, Tomo `party`, tiêu đề "Xong phiên rồi!", pill "+N phút" và "Chuỗi X ngày", kèm confetti.
- Nút: "Nghỉ ngay" (chính) và "Để sau" (ghost).
- Nếu cài đặt **tự bắt đầu giờ nghỉ** đang bật: modal tự đóng sau 5 giây và giờ nghỉ vẫn tự chạy như hiện nay. Không chặn luồng timer.
- Chỉ hiện sau phiên **Tập trung** chạy đủ thời lượng. Bỏ qua phiên (skip) thì không hiện.
- Phải tôn trọng thông báo trình duyệt và âm báo sẵn có: không phát trùng, không thay.

### 4.4 Tomo xuất hiện ở đâu

Logo (đầu Tomo), màn timer (bong bóng chào hoặc nhắc), khung ăn mừng, màn trống (danh sách việc, thống kê, lịch sử), trang 404, trang lỗi, đăng nhập, landing (hero và FAQ), favicon, icon PWA, ảnh OG.

## 5. Component nền (`src/components/ui/*`)

Làm lại **phần hình** của mọi primitive. **Giữ nguyên API và props** để nơi gọi không phải sửa. Variant mới chỉ được thêm, không đổi tên variant cũ.

| Primitive | Hình mới |
|---|---|
| `button` | `default` = nền `--accent-solid` + viền + `--shadow-sticker`. `secondary`/`outline` = nền `--surface` (hoặc `candy-butter` qua variant mới `fun`) + viền + bóng. `ghost` = trong suốt, hover `--surface-hover`. `destructive` = nền danger. `link` giữ nguyên. Kích thước `sm 34` · `default 42` · `lg 50` · `icon 40`. Viết lại toàn bộ khối `.btn*` trong `globals.css` |
| `dialog`, `alert-dialog` | thẻ `--radius-xl`, viền, `--shadow-sticker-lg`, pop-in spring. Màn mờ (scrim) là `--ink` ở 40%. Nút đóng là nút icon tròn có viền |
| `sheet` | cạnh trong bo `--radius-lg`, viền, bóng. Header có `IconTile` + tiêu đề Baloo |
| `popover`, `dropdown-menu`, `select` (content), `command` | thẻ `--radius-lg`, viền, `--shadow-sticker`. Mục đang chọn: nền `candy-sky` nhạt, viền, dấu tick. Mục có icon dùng `IconTile` cỡ nhỏ |
| `select` (trigger), `input`, `textarea` | viền `--outline`, `--shadow-sticker-sm`, cao 42px. Focus: bóng đổi sang `2px 2px 0 var(--accent-solid)` cộng vòng focus |
| `tooltip` | nền `--ink`, chữ `--surface`, bo 10px, không nghiêng (để dễ đọc) |
| `tabs` | dạng "segmented": khay `--surface-raised` có viền, tab đang chọn là ô sticker nổi |
| `filter-chip` | pill có viền. Đang chọn: nền `--accent-solid`, chữ `--on-accent`, `--shadow-sticker-sm` |
| `checkbox`, `radio-group` | ô 22px có viền, khi chọn nền `--accent-solid` và tick nâu đậm (`checkbox` nảy nhẹ khi tick) |
| `switch` | track pill có viền, bật thì nền `candy-mint`. Núm trắng có viền |
| `slider` | track dày 10px có viền, phần đã chọn màu `--accent-solid`, núm tròn có viền và bóng |
| `badge` | pill có viền 2px, giữ các variant hiện có, tone lấy từ bảng 3.1 |
| `card` | `.sticker` (viền + `--shadow-sticker`, `--radius-lg`) |
| `avatar` | tròn, viền, nền màu kẹo theo hash tên |
| `toaster` (sonner) | thẻ sticker nghiêng nhẹ, icon trong `IconTile` theo tone |
| `skeleton` | `--surface-raised` có shimmer nhẹ (tắt khi reduced-motion) |
| `empty-state` | Tomo + tiêu đề + mô tả + một nút chính |
| `kbd`, `stat-strip`, `page-header`, `scroll-area`, `calendar`, `label`, `separator`, `table` | đổi theo token và viền mới |

Primitive mới: `IconTile`, `Tomo`, `TomoBubble`, `StickerCard` (alias có biến thể nghiêng, dùng cho landing và ăn mừng), `StreakPill`, `SessionTomatoes` (4 quả cà chua đếm phiên).

## 6. Thương hiệu

- **Logo** (`src/components/brand/logo.tsx`): đầu Tomo + chữ "Study Bro" (Baloo 2 800, màu `--ink`). Có bản chỉ có biểu tượng (`variant="mark"`).
- **Favicon:** `public/favicon.svg` là đầu Tomo. Bỏ icon đồng hồ feather.
- **Icon PWA:** sinh `icon-192x192.png`, `icon-512x512.png`, `maskable-icon-512x512.png` và `apple-touch-icon.png` từ SVG gốc bằng `scripts/generate-brand-icons.mjs` (dùng `sharp`, đã có trong devDependencies). Nền giấy kem, Tomo ở giữa, chừa vùng an toàn cho bản maskable.
- **Manifest:** `theme_color` `#FF5A36`, `background_color` `#FFF3E0`.
- **Ảnh OG:** dùng route `opengraph-image` của App Router (`next/og`). Nền kem, Tomo, logo, khẩu hiệu. Một bản tiếng Anh dùng chung (khớp với title/description SEO hiện đang là tiếng Anh). Đọc `node_modules/next/dist/docs/` trước khi viết (Next 16). Bỏ tham chiếu `card.jpg` trong `layout.tsx` và `page-metadata.ts`.
- **Khẩu hiệu:** giữ nội dung SEO hiện có. Chỉ thêm lời của Tomo ở UI, không đổi title và description SEO trong đợt này.

## 7. Các màn

### 7.1 Khung app (`features/app-shell`)

- **Thanh trên** (`app-status-bar`):
  - Bên trái: logo.
  - Bên phải: `StreakPill` (lửa + số ngày, nền `candy-butter`), pill "N phiên hôm nay", nút ⌘K (pill có viền), nút cài đặt, avatar.
  - Giữ `data-chrome` để thanh mờ đi khi đang tập trung.
- **Dock** (`app-dock`): hàng ô sticker 52px. Mỗi panel một màu kẹo: Việc (butter), Âm thanh (sky), Không gian (lilac), Đồng hồ (mint), Thống kê (tomato), Arcade (peach), Toàn màn hình (surface). Nhãn ở tooltip trên desktop, hiện dưới icon trên mobile.
- **Mobile < 768px:** dock thành thanh tab dưới đáy dạng khay sticker, chừa safe-area.
- ⌘K: popover sticker lớn, ô tìm có viền, nhóm lệnh có `IconTile`.

### 7.2 Nền

- **Mặc định — "Giấy kem":** `--surface-page` cộng hoạ tiết doodle SVG lặp (cà chua nhỏ, sao, chấm, nét lượn) ở độ mờ khoảng 6%. Nhuộm nhẹ theo chế độ: kem → kem bạc hà → kem trời, chuyển mềm khi đổi. Dark mode dùng nền socola và doodle độ mờ khoảng 5%.
- **Không gian WebGL** (9 scene): giữ nguyên shader. Khi đang dùng, thẻ đồng hồ đặc nên luôn đọc rõ. Bộ chọn không gian làm lại (mục 7.4).
- Tính năng "đổi cảnh nền theo thời tiết" (phiên khác đang làm song song trên nhánh này) chọn scene theo thời tiết, chạy chung được với thiết kế này mà không cần đổi gì.

### 7.3 Màn timer (`features/timer`)

Bố cục theo mockup B:

- Một **thẻ đồng hồ sticker lớn** (`--radius-xl`, `--shadow-sticker-lg`) đặt giữa màn hình. Rộng tối đa khoảng 560px, trên mobile chiếm gần hết chiều ngang.
- Thứ tự trong thẻ:
  1. Tomo + bong bóng (ẩn khi đang chạy, khi đó Tomo `focus` thu nhỏ cạnh tên việc)
  2. chip chế độ
  3. đồng hồ
  4. thanh tiến độ dày 18px có viền, vệt sáng bên trong
  5. `SessionTomatoes` + "Phiên 1/4"
  6. nút "Bắt đầu" lớn, kèm hai nút tròn đặt lại/bỏ qua hai bên
  7. ô chọn việc (viền nét đứt khi chưa chọn)
- Các kiểu đồng hồ 2D (`digital`, `analog`, `flip`): vẽ lại theo sticker, có viền, mặt kem, kim nâu đậm, ô flip có viền. Kiểu 3D giữ nguyên mô hình, chỉ đặt trong thẻ.
- Chế độ "tập trung sâu" và `data-chrome` hoạt động như cũ. Thẻ đồng hồ không mờ đi.
- `daily-progress`, `session-cycle`, `task-selector`, `timer-mode-selector`, `timer-controls` đổi theo primitive mới.

### 7.4 Panel (`features/panels` và component con)

| Panel | Điểm nhấn |
|---|---|
| Việc cần làm | ô thêm nhanh sticker. Checkbox nảy khi tick, hàng việc xong có gạch ngang và Tomo nhỏ khen ở cuối nhóm. Chip lọc mới. Màn trống có Tomo |
| Âm thanh | mỗi âm là một ô `IconTile` màu kẹo + slider sticker. Preset là chip |
| Không gian | lưới thẻ sticker có ảnh xem trước. Thẻ đang chọn có viền `--accent-solid` dày và nhãn "Đang dùng". "Giấy kem" là thẻ đầu tiên |
| Đồng hồ | lưới thẻ xem trước kiểu đồng hồ, cách chọn như Không gian |
| Thống kê / lịch sử | `StatStrip` thành các ô sticker số to. Heatmap streak dạng ô vuông bo có viền mảnh, màu từ kem đến cà chua. Biểu đồ tuần là cột bo tròn có viền |
| Arcade | thẻ game sticker với preview. Khung overlay của game (điểm, nút chơi lại) theo primitive mới. Màu bên trong từng game giữ nguyên |
| Cài đặt | hai cột giữ nguyên, khối `SettingsSection` thành thẻ sticker. Thêm "Giao diện: Sáng / Tối / Theo hệ thống". Bộ màu còn 6 (mục 8) |
| Góp ý | form theo primitive mới, Tomo cảm ơn sau khi gửi |

### 7.5 Trang ngoài app

- **Landing dưới màn đầu** (`FeaturesSSR`, `HowItWorks`, `FAQ`, `Footer`, `site-header`): thẻ sticker nghiêng xen kẽ, `IconTile`, Tomo ở hero tính năng và FAQ. Vẫn render SSR, JSON-LD giữ nguyên.
- **Hướng dẫn, quyền riêng tư, điều khoản** (`doc-layout`, `legal-page`): khung đọc trên thẻ sticker, mục lục dạng chip.
- **404, lỗi (`error.tsx`, `global-error.tsx`), đăng nhập:** Tomo (`worried` cho lỗi, `sleepy` cho 404), một nút chính.

## 8. Bộ màu người dùng chọn (`src/config/themes.ts`)

- Thay danh sách hiện tại bằng **6 bộ hợp sticker**: Cà chua (mặc định), Bạc hà, Bơ, Oải hương, Trời, Đào.
- Mỗi bộ chỉ ghi đè khối PRIMARY như hiện nay (`accent*`, qua `<style id="app-theme-vars">`).
- Vì chữ trên nền đặc là `--on-accent` nâu đậm, mỗi bộ chỉ cần đạt hai điều:
  - `--on-accent` trên `--accent-solid` ≥ 4.5:1.
  - `--accent` (chữ) trên `--surface-page` ≥ 4.5:1, ở cả sáng và tối.
- Thêm **unit test tương phản** chạy qua mọi preset với hai điều kiện trên.
- Key preset cũ đã lưu mà không còn trong danh sách thì về Cà chua, đúng cơ chế fallback sẵn có.
- Cập nhật tên bộ màu trong 3 file locale.

## 9. Cách làm và thứ tự

**Thay tại chỗ, đi từ token.** Không dựng hệ song song, không thêm feature flag.

| Giai đoạn | Nội dung | Xong khi |
|---|---|---|
| 1. Nền móng | token sáng/tối, font, bỏ `forcedTheme`, `.btn*` và utility `.sticker*`, nền giấy kem + doodle, `themes.ts` 6 bộ + test tương phản | app chạy ở light mode, test tương phản pass |
| 2. Thương hiệu | `Tomo`, `Logo`, favicon, icon PWA, manifest, ảnh OG, gỡ sói | logo và favicon mới hiện, OG render |
| 3. Primitive | mọi file trong mục 5 + primitive mới | test hiện có pass |
| 4. Khung và timer | thanh trên, dock, tab bar mobile, thẻ đồng hồ, 2D clocks, `pickTomoMood` + test, bong bóng, `SessionCelebration` | màn chính khớp mockup B ở 390 và 1440 |
| 5. Panel | mục 7.4 | mọi panel mở được và đúng phong cách |
| 6. Trang ngoài app | mục 7.5 | |
| 7. Tài liệu và QA | viết lại `docs/design-system.md` | xong khi đạt các tiêu chí ở mục 10 |

## 10. Kiểm thử và chất lượng

- **Tự động:** `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm i18n:check`, `pnpm build` đều pass.
- **Test mới:**
  - `pick-tomo-mood.test.ts`: mọi nhánh trong bảng 4.2, gồm cả ranh giới 18:00, 23:00, 04:00.
  - Test tương phản preset (mục 8).
  - Test render `Tomo` cho cả 5 `face`.
  - Test `SessionCelebration`: tự đóng khi bật tự bắt đầu nghỉ, và không hiện khi bỏ qua phiên.
- **Kiểm bằng mắt (Chrome DevTools):** màn timer, mọi panel, landing, trang hướng dẫn và pháp lý, 404. Kiểm ở 390×844 và 1440×900, cả sáng và tối. Không tràn ngang, vòng focus thấy rõ, chuyển động đứng yên khi bật reduced-motion.
- **Báo cáo:** ảnh trước/sau từng khu vực và kết quả kiểm, ghi ở `plans/reports/`.

## 11. Ngoài phạm vi

- Hệ XP, level, huy chương, league (plan v2 phase 07).
- Hiệu ứng âm thanh mới.
- Vẽ lại 9 không gian WebGL. Đổi mô hình đồng hồ 3D.
- Đổi tên app, đổi title và description SEO.
- Đổi luật hay màu bên trong từng mini game.

## 12. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| Phiên khác đang sửa cùng nhánh, cùng thư mục (tính năng thời tiết: `general-settings.tsx`, `app-home.tsx`, 3 file locale, `next.config.ts`) | Commit chỉ file của mình, ghi đường dẫn cụ thể. Không bao giờ `git add -A` hay `git add .`. Sửa file chung bằng Edit trên nội dung mới nhất. Nếu cần sửa đúng chỗ phiên kia đang sửa thì chờ họ commit trước |
| Nhiều chỗ ghi cứng `text-white` trên `bg-primary` (12 file) | grep và chuyển sang `text-on-accent` ở giai đoạn 3–5. `--color-primary-foreground` trỏ sang `--on-accent` |
| Font mới làm đổi kích thước layout | kiểm 390px sau giai đoạn 1 và sau mỗi giai đoạn |
| Bóng cứng kém rõ trong dark mode | thẻ sáng hơn nền (3.2), kiểm bằng mắt ở giai đoạn 1 |
| Ổ đĩa máy gần đầy (đã dọn còn 13 GB vào 05/10) | kiểm `df` trước khi `pnpm build` |
