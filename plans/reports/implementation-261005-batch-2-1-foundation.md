# Batch 2.1 — Nền móng Sticker pop (spec §9 bước 1)

Ngày 2026-10-05, nhánh `feat/design-system`. Làm xong 6 task, 4 commit. `pnpm type-check` sạch, `pnpm test` 55 file / 485 test pass, `pnpm i18n:check` OK (1218 khoá), `pnpm lint` 0 lỗi (95 warning cũ). Dev server `pnpm dev -p 3001` đang chạy nền.

## Commit

| Hash | Nội dung |
|---|---|
| `cdd85b0` | Task 1-3: token, `.btn*`/`.sticker*`, nền giấy kem (`globals.css`, `background-renderer.tsx`) |
| `130b7bc` | Task 4: font Baloo 2 + Nunito (`layout.tsx`, `ui-preferences.ts`, sửa tràn ngang `doc-layout.tsx`) |
| `f51a2d5` | Task 6: 6 preset + test tương phản (`themes.ts`, `themes.test.ts`, 3 locale: tên/mô tả preset) |
| `7f5497d` | Task 5: sáng mặc định + chọn Sáng/Tối/Hệ thống (`app-providers.tsx`, `(landing)/layout.tsx`, `appearance-settings.tsx`, `settings-panel.tsx`, 3 locale: `colorSection`/`textSection`) |

## Từng task

1. **Token** (`globals.css`): `:root` = sáng, tối ở `:root[data-theme='dark']`. Có `--outline`, `--on-accent`, `--candy-*`, tone `success|warning|danger|info|ai` (DEFAULT/-bg/-ink, khác nhau sáng/tối), `--gold #FFB800`, `--outline-w`, `--shadow-sticker-sm|-|-lg`, `--radius 12`, `--radius-lg 20`, `--radius-xl 28`. Đã ánh xạ `@theme inline`: `bg-candy-*`, `text-on-accent`, `bg/border-outline`, `shadow-sticker[-sm|-lg]`, `rounded-xl`. `--color-primary-foreground` = `--on-accent`. `--color-destructive` = `--danger`. `--accent-edge` = `var(--outline)`. Scope timer: `[data-timer][data-mode=shortBreak|longBreak]` mint/sky (kèm bản tối); `html[data-timer-mode]` → `--stage-tint`.
2. **Utility**: `.btn` viết lại (viền `--outline-w`, bóng cứng `--sticker-offset`, hover nhích -1px, `:active` lún đúng độ dày bóng, 0.08s). Cỡ sm 34 · md 42 · lg 50 · icon 40. Variant `--primary|--secondary|--danger|--ghost|--link` + mới `--fun` (butter). Mới: `.sticker`, `.sticker-sm`, `.sticker-lg`, `.sticker-press`, `.tilt-l`, `.tilt-r` (dùng thuộc tính `rotate` nên cộng được với translate khi nhấn), `.paper-bg`. Giữ nguyên khối reduced-motion.
3. **Nền**: `--doodle` (SVG inline 240px: cà chua, sao, chấm, nét lượn; sáng ~6% mực + cà chua 10%, tối ~5%) cho `body` và scene mặc định (`background-renderer` thêm class `paper-bg`, không đụng WebGL). `body` dùng `--stage-tint` với transition 0.7s: focus pha 4% cà chua, nghỉ ngắn 22% bạc hà, nghỉ dài 22% trời (tối 6/11/11%).
4. **Font**: `Baloo_2` + `Nunito` dạng variable (bỏ `weight` nên mỗi font 1 file/subset) latin + vietnamese, JetBrains Mono `preload: false`. Đo thực tế: 4 file font preload (trước: Be Vietnam Pro 4 weight × 2 subset + Space Grotesk). Fallback JA `Hiragino Maru Gothic ProN`, `Yu Gothic`, `Meiryo` trong cả hai stack. `UI_FONTS` = Nunito (mặc định) + System UI; giá trị cũ tự về Nunito.
5. **Sáng/Tối**: bỏ `forcedTheme`, `defaultTheme="light"`, `enableSystem`. Chọn Sáng/Tối/Hệ thống ở Cài đặt → Giao diện (dùng lại khoá `settings.general.theme.mode|light|dark|system`). Hết lặp "Appearance": panel giữ tiêu đề, hai thẻ con là "Màu sắc" và "Chữ".
6. **Preset** + test (xem dưới).

## Preset cuối (chỉ khối PRIMARY, sáng / tối)

| Key | solid (cả 2 chế độ) | solid-hover | accent sáng | accent tối | soft sáng / tối | ink sáng / tối |
|---|---|---|---|---|---|---|
| `default` Cà chua | `#FF5A36` | `#FF7050` | `#C2330F` | `#FF8A6B` | `#FFD9CC` / `#5C2E22` | `#8F2711` / `#FFB09C` |
| `mint` Bạc hà | `#7BDCB5` | `#8FE3C1` | `#1E7A57` | `#7BDCB5` | `#D2F3E4` / `#1F3A2D` | `#13603F` / `#A6EBCF` |
| `butter` Bơ | `#FFD45C` | `#FFDE80` | `#8A5C00` | `#FFD45C` | `#FFF0BF` / `#40330F` | `#7A5200` / `#FFE58F` |
| `lavender` Oải hương | `#C9B6FF` | `#D6C8FF` | `#5E3DBE` | `#C9B6FF` | `#E9E0FF` / `#33284F` | `#4B2C9E` / `#DDD0FF` |
| `sky` Trời | `#7CC8FF` | `#94D3FF` | `#1A5F99` | `#7CC8FF` | `#D6ECFF` / `#1B3347` | `#0F4C81` / `#A9DCFF` |
| `peach` Đào | `#FFB38A` | `#FFC3A1` | `#A8481A` | `#FFB38A` | `#FFE3D3` / `#4A2A1A` | `#8A3C12` / `#FFCFB4` |

(`accent-hover` có đủ cả hai chế độ trong `themes.ts`.) Key lạ hoặc key cũ (`blue`, `mono`, `pink-light`…) về Cà chua; bỏ bảng `LEGACY_KEYS`.

## Tương phản đo được

| Preset | `--on-accent` / solid | accent / giấy sáng `#FFF3E0` | accent / giấy tối `#1A120F` |
|---|---|---|---|
| Cà chua | 5.39 | 5.07 | 8.00 |
| Bạc hà | 10.15 | 4.82 | 11.21 |
| Bơ | 11.80 | 5.30 | 13.03 |
| Oải hương | 9.25 | 6.63 | 10.22 |
| Trời | 9.20 | 6.10 | 10.17 |
| Đào | 9.61 | 5.31 | 10.61 |

`--ink-muted` / giấy: 5.21 (sáng), 8.34 (tối). Test `src/config/themes.test.ts` (52 ca) đọc giá trị thật từ `globals.css`, ngoài các điều kiện của spec còn kiểm: `-hover` cũng đạt, `accent-ink` trên `accent-soft`, ink/ink-secondary/ink-muted trên 3 nền, `--on-accent` trên 6 màu kẹo và 5 tone, `-ink` trên `-bg` của tone (cả 2 chế độ), và Cà chua khớp khối PRIMARY trong CSS.

## Ảnh kiểm (`plans/reports/assets-261005-relaunch/`, không commit)

`2-1-guide-{390,1440}-{light,dark}.png` (4), `2-1-home-{390,1440}-{light,dark}.png` (4), `2-1-home-390-light-shortbreak.png`, `2-1-settings-appearance-390-light.png`, `2-1-focus-ring-390-light.png`.
Kết quả: 390px không tràn ngang ở `/` và `/guide` (sáng + tối); chữ đọc rõ trên giấy; vòng focus 3px `--accent` cách 3px nhìn rõ; tint nghỉ ngắn hiện đúng. Console chỉ có warning Radix Dialog thiếu Description (cũ, không liên quan).

## Quyết định

- **Dark selector là `:root[data-theme='dark']`** (không phải `[data-theme='dark']` trần). Lý do: 5 chỗ còn ghi cứng `data-theme="dark"` ở cây con (`app-home.tsx`, `app-home-client-only.tsx`, `task-selector.tsx`, `clock-style-picker.tsx`, `not-found.tsx`) sẽ ép màn chính luôn tối. Với selector gắn vào `<html>`, các cây con tự theo theme người dùng nên màn timer sáng ngay mà không phải sửa file của phiên khác. Biến thể Tailwind `dark:` đổi tương ứng. Preset trong `applyColorPreset` dùng cùng selector.
- Tên chế độ focus trong store là `'work'` (không phải `'focus'`) nên CSS dùng `html[data-timer-mode='work']`.
- Giữ `--blue/green/purple/amber/rose/pink/cyan-solid` (giá trị cũ, chữ trắng) cho game và biểu đồ vì spec ngoài phạm vi màu mini game. Bỏ `--*-bg/-ink` cũ, thay bằng `--success|warning|danger|info|ai(-bg|-ink)`.
- `--radius-sm` = 8px (spec không nêu). `--color-input` vẫn là `--border` (viền outline của input để batch primitive).
- Bỏ field `emoji` của preset (không ai đọc, spec cấm emoji làm icon) và bỏ `accent-edge` khỏi `AccentTokens`.
- Bản Cà chua trong `themes.ts` khớp khối `:root`, "default" vẫn là xoá style override.
- `doc-layout.tsx` (ngoài danh sách task): thêm `grid-cols-[minmax(0,1fr)]` vì trang `/guide` tràn ngang ở 390px (cột lưới `auto` bị bảng 544px đẩy rộng). Sửa 1 class.
- Hunk locale chỉ stage khoá của mình, weather WIP không bị đụng.

## Batch sau cần biết

- **Tên token/class mới**: `bg-candy-{tomato,mint,butter,lilac,sky,peach}`, `text-on-accent`, `border-outline`/`bg-outline`, `shadow-sticker[-sm|-lg]`, `rounded-xl` (28px), `.sticker[-sm|-lg]`, `.sticker-press`, `.tilt-l|r`, `.paper-bg`, `.btn--fun`, biến `--outline-w`, `--sticker-offset`, `--doodle`, `--stage-tint`.
- **`general-settings.tsx` còn hàm `AppearanceSettings` cũ không ai dùng** (do không được chạm file đang dính weather WIP). Xoá khi weather commit xong.
- **Còn `data-theme="dark"` cứng** ở 5 file trên: giờ vô hại nhưng nên gỡ (batch 2.4 cho `app-home*`, `task-selector`, `clock-style-picker`; 404 ở batch thương hiệu).
- **`text-white` ghi cứng trên nền màu** (12 file): `global-error`, `scene-card`, `app-dock`, `toaster`, `task-row`, `animate-ui/buttons/button`, `preset-chips`, `streak-tracker`, `youtube-pane`, `youtube-input-section`, `filter-chip`, `HowItWorks`. Chip chế độ timer đang chọn hiện chữ trắng trên bạc hà (nhìn thấy ở ảnh shortbreak), cần `text-on-accent`.
- **`text-success|warning|danger|info|ai|gold|destructive` dùng làm màu chữ** (≈30 chỗ; nhiều nhất `feedback-panel` 6, `badge` 5, `toaster` 4, `task-row` 4, `task-form-modal` 4): DEFAULT giờ là màu pastel đặc, trên giấy kem chữ này không đủ tương phản. Chuyển sang `text-*-ink` hoặc đặt trên `bg-*` kèm `text-on-accent`.
- Mọi primitive (`dialog`, `select`, `input`, `card`…) chưa đổi hình: `rounded-md|lg` đã to hơn (12/20px) nhưng chưa có viền/bóng sticker. Phần của batch 2.3.
- Scene WebGL bật trong chế độ sáng: chữ `text-ink` tối trên cảnh tối sẽ khó đọc cho tới khi có thẻ đồng hồ đặc (batch 2.4).
- `docs/design-system.md` chưa viết lại (giai đoạn 7).

## Câu hỏi còn mở

- Doodle hiện ~6% nhưng cà chua nhỏ nhìn như giọt nước ở cỡ 14px. Cần vẽ lại cho tròn hơn khi có Tomo (batch thương hiệu) không?
