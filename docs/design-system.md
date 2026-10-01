# Design System — Study Bro (Pomodoro)

Chuyển thể từ design system của luyenphongvan.online (bản 01/10/2026) cho codebase này: Next.js 14 + Tailwind **v3.4** + shadcn/ui. Giá trị gốc nằm trong `src/app/globals.css` (token), `tailwind.config.js` (ánh xạ class), `src/config/themes.ts` (bộ màu), `src/components/ui/*` (component).

**Tinh thần:** phẳng, viền mảnh, tông trung tính lạnh, một màu primary. Màu chỉ để truyền **nghĩa** (trạng thái, mức độ), không để trang trí. Thứ bậc thị giác dựa vào chữ, khoảng cách và độ đậm, không dựa vào hiệu ứng.

---

## 0. Màu primary

Mặc định là **cà chua** (`#D93A16`), khai báo ở khối PRIMARY đầu `globals.css`. Màu cam cũ `#EE572B` bị loại vì chữ trắng trên nền đó chỉ đạt 3.48:1 (dưới AA 4.5:1).

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `--accent` | `#D93A16` | `#F0532D` | chữ link, gạch chân tab, viền focus |
| `--accent-hover` | `#B42E10` | `#FB7350` | hover của link |
| `--accent-soft` | `#FFE2D8` | mix 30% với `#18181b` | nền nhạt mang màu primary |
| `--accent-ink` | `#8F2711` | `#FF9C7D` | chữ đặt trên `--accent-soft` |
| `--accent-solid` | `#D93A16` | `#D93A16` | nền nút chính, chip đang chọn (chữ trắng) |
| `--accent-solid-hover` | `#B42E10` | `#B42E10` | |
| `--accent-edge` | `#B42E10` | `#A12B10` | cạnh 3D dưới nút chính |

**Bộ màu người dùng chọn** (`src/config/themes.ts`, Settings → Color palette) chỉ ghi đè đúng khối này, qua thẻ `<style id="app-theme-vars">` (`src/lib/ui-preferences.ts`). Mỗi bộ được sinh từ một dải màu kiểu Tailwind theo bảng bậc ở trên; bậc của `--accent-solid` được chọn để chữ trắng đạt AA:
- 600: tomato, blue, rose, indigo, violet, pink.
- 700: emerald, amber, cyan, teal, mono (600 không đủ 4.5:1).
- Indigo/violet dùng bậc 400 làm `--accent` ở dark mode (500 chỉ đạt ~4:1 trên nền tối).

Thêm bộ màu mới: thêm dải vào `RAMPS`, gọi `fromRamp(ramp, { solid })`, thêm tên vào `settings.general.theme.themes.*` trong 3 file `src/i18n/locales/*.json`. Kiểm tra lại tương phản trước khi chọn bậc.

---

## 1. Stack

| Mục đích | Dùng | Ghi chú |
|---|---|---|
| Framework | Next.js 14 (App Router) + React 18 | |
| CSS | Tailwind CSS 3.4 + `globals.css` | Token là mã hex; Tailwind đọc qua `color-mix(...)` nên modifier độ mờ (`bg-primary/10`) vẫn chạy |
| Component nền | shadcn/ui (new-york) trong `src/components/ui/` | Copy vào repo, tự sửa |
| Hiệu ứng có sẵn | Animate UI, Aceternity, Magic UI (registry trong `components.json`) | Tìm ở đây trước khi tự viết animation |
| Animation | `motion` — **import từ `motion/react`** | Không dùng `framer-motion` (đã gỡ) |
| Icon | **Phosphor** `@phosphor-icons/react/dist/ssr` | Xem mục 2. `lucide-react`, `@tabler/icons-react` đã gỡ |
| Toast | `sonner` | |
| State | `zustand` | |

**Khi lấy component từ shadcn / Animate UI / Aceternity:** đổi icon lucide sang Phosphor; bỏ variant `dark:` nếu có thể (dark mode chạy bằng `data-theme`, mục 6); vòng lặp `requestAnimationFrame` phải tự kiểm tra `prefers-reduced-motion`; bỏ gradient trang trí.

---

## 2. Icon — Phosphor

```tsx
import { MagnifyingGlass, Gear, CaretDown } from '@phosphor-icons/react/dist/ssr'

<MagnifyingGlass size={16} />
<Gear size={18} weight="bold" />
```

- Luôn import từ `@phosphor-icons/react/dist/ssr`. `next.config.js` có `modularizeImports` để mỗi import chỉ nạp đúng file icon (không có nó, mỗi trang compile cả ~1500 icon).
- Luôn truyền `size`. Cỡ thường dùng: 14–18px trong UI, 12–13px trong meta.
- Độ đậm dùng `weight` (`thin | light | regular | bold | fill | duotone`), không có `strokeWidth`. Icon đặc (play/pause) dùng `weight="fill"`.
- Kiểu cho prop nhận icon: `import type { Icon as PhosphorIcon } from '@phosphor-icons/react'`.
- Tên khác Lucide: `Search`→`MagnifyingGlass`, `Settings`→`Gear`, `Trash2`→`Trash`, `ChevronDown`→`CaretDown`, `Loader2`→`CircleNotch`, `Menu`→`List`, `Zap`→`Lightning`, `Layers`→`Stack`, `RotateCcw`→`ArrowCounterClockwise`, `Gamepad2`→`GameController`.

**Giữ SVG riêng:** logo, mascot, icon động trong `src/components/animate-ui/icons/`, hình minh hoạ, vòng tiến độ, spinner.

**Không dùng** icon Sparkles ✨ / "phép thuật" — trông như UI do AI sinh ra.

---

## 3. Font

| Vai trò | Font | Biến | Tailwind |
|---|---|---|---|
| Tiêu đề, con số, đồng hồ | Space Grotesk 500/700 | `--font-heading` | `font-heading` |
| Đoạn văn, control, nhãn | Be Vietnam Pro 400/500/600/700 | `--font-body` | `font-body` |
| Code, phím tắt | JetBrains Mono 400 | `--font-mono` | `font-mono` |

Nạp subset `latin` + `vietnamese` trong `src/app/layout.tsx`, biến font gắn trên `<html>` (gắn trên `<body>` thì `--font-body` ở `:root` không đọc được). Người dùng vẫn đổi được font thân bài trong Settings (Be Vietnam Pro / Space Grotesk / System UI).

- `h1–h4` tự dùng font heading, `letter-spacing: -0.02em`, `line-height: 1.1`.
- Con số thống kê: `font-heading font-bold tabular-nums`.
- Cỡ hay dùng: `text-[0.6875rem]` tag/nhãn hoa · `text-xs` meta · `text-[0.8125rem]` chữ phụ · `text-sm` chữ thân trong thẻ · `text-[0.9375rem]` tiêu đề mục · `text-[1.0625rem]` tiêu đề khối.
- Nhãn chữ hoa nhỏ: `text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-ink-muted`.

---

## 4. Màu — class Tailwind tương ứng token

**Không viết `text-blue-500`, `bg-zinc-800`, `text-white/60`…** trong UI. Dùng class token dưới đây. Ngoại lệ: chữ trắng trên nền solid, và màu nội tại của mini game (Wordle, Snake…).

| Token | Class |
|---|---|
| `--ink` / `-secondary` / `-muted` / `-faint` | `text-ink`, `text-ink-secondary`, `text-ink-muted`, `text-ink-faint` |
| `--surface` / `-page` / `-raised` / `-hover` | `bg-surface`, `bg-surface-page`, `bg-surface-raised`, `bg-surface-hover` |
| `--border` / `--border-strong` | `border-border`, `border-border-strong` |
| primary | `bg-primary` (= `--accent-solid`), `text-brand` (= `--accent`), `bg-brand-soft text-brand-ink`, `ring-brand`, `border-brand` |
| shadcn cũ | `bg-background` = surface-page, `bg-card`/`bg-popover` = surface, `bg-muted`/`bg-secondary` = surface-raised, `bg-accent` = surface-hover, `text-muted-foreground` = ink-muted |

**Màu theo nghĩa** (mỗi tone có `DEFAULT` = nền đặc mang chữ trắng, `-bg`, `-ink`):

| Nghĩa | Class | Dùng khi |
|---|---|---|
| success (green) | `bg-success-bg text-success-ink`, `bg-success` | đã xong, đã lưu |
| warning (amber) | `bg-warning-bg text-warning-ink`, `bg-warning` | cần chú ý, sắp hết giờ. **Chỉ** nghĩa này |
| danger (rose) | `bg-danger-bg text-danger-ink`, `bg-danger` | lỗi, xoá |
| info (blue) | `bg-info-bg text-info-ink`, `bg-info` | thông tin, gợi ý |
| ai (purple) | `bg-ai-bg text-ai-ink`, `bg-ai` | nội dung do AI (Bro Chat) |
| meta | `bg-surface-raised text-ink-secondary` | phân loại, số đếm |

Thêm: `text-gold` (cúp, streak), `text-timer` (= `--timer-foreground`, mặc định theo primary).

Độ ưu tiên task: high → danger, medium → warning, low → meta (trung tính).

---

## 5. Bo góc, viền, bóng, layout

- `rounded` / `rounded-md` = 8px (input, chip, hàng danh sách) · `rounded-lg` = 12px (thẻ, modal, khối lớn) · `rounded-full` (pill, avatar, tag). Tránh `rounded-2xl`/`rounded-3xl` cho thẻ.
- Viền 1px `border-border`; `border-border-strong` cho viền nút phụ, ô nhập, vạch chia trên nền raised.
- Thẻ phẳng có viền, không bóng. Khung lớn: `shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]`. Không dùng `shadow-lg`/`shadow-xl`/glow màu.
- Trang nội dung: `max-w-[1180px]`, lề ngang `px-[clamp(16px,4vw,32px)]`. Lưới thống kê: 2 cột → 4 cột từ 720px; dùng `minmax(0,1fr)`.
- Kiểm tra mọi màn ở 390px: không tràn ngang.

---

## 6. Dark mode

- Bật bằng `data-theme="dark"` (next-themes `attribute="data-theme"`). Không dùng class `.dark`. Tailwind `dark:` vẫn chạy (cấu hình `darkMode: ['selector', '[data-theme="dark"]']`) nhưng hạn chế — component đọc token sẽ tự đổi.
- App hiện **ép dark** (`forcedTheme="dark"` trong `app-providers.tsx` và layout landing). Token light đã đủ; muốn mở light mode chỉ cần bỏ `forcedTheme`.
- Muốn một vùng luôn tối (trang timer đè lên ảnh nền): đặt `data-theme="dark"` trên phần tử bọc vùng đó.

---

## 7. Component

### 7.1 Button (`src/components/ui/button.tsx` + `.btn*` trong `globals.css`)

| variant (shadcn) | Kiểu design | Dùng cho |
|---|---|---|
| `default` | primary — `--accent-solid`, chữ trắng, cạnh 3D | CTA chính, **mỗi khu vực một nút** |
| `secondary`, `outline` | secondary — mặt trung tính, viền strong, cạnh 3D | hành động phụ |
| `ghost` | trong suốt, hover `--surface-hover` | thanh công cụ, icon button |
| `link` | chữ, hover gạch chân màu primary | liên kết |
| `destructive` | danger — nền rose | xoá vĩnh viễn |

`size`: `sm` 32px · `default` 38px · `lg` 44px · `icon` 36×36. Nhãn nút: động từ + đối tượng, 2–5 chữ. Không ghi đè màu nền nút bằng `style` hay class màu.

### 7.2 Thẻ
`Card` = `bg-surface border border-border rounded-lg`. Ô con trong thẻ dùng `bg-surface-raised`, không viền. **Không tô nền thẻ theo trạng thái**; muốn báo trạng thái thì tô viền: `border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]`. **Không thanh màu viền trái** cho thẻ/hàng.

### 7.3 Danh sách liền khối thay cho nhiều thẻ rời
Nhiều mục cùng loại → một khung `divide-y divide-border rounded-lg border border-border bg-surface`, mỗi hàng `px-5 py-4`. Lưới chia ô: `grid gap-px bg-border border border-border rounded-lg overflow-hidden` + mỗi ô `bg-surface`. Mẫu: `SettingsSection`/`SettingsRow` trong `general-settings.tsx`.

### 7.4 Tag / badge
`Badge` variant: `default`/`secondary` (trung tính), `outline`, `brand`, `success`, `warning`, `destructive`, `info`, `ai`. Icon cạnh tag không tô cùng màu tag.

### 7.5 Tab vs chip — không trộn
| | Underline tab (`ui/tabs.tsx`) | Filter chip |
|---|---|---|
| Dùng khi | điều hướng nội dung | lọc / bật tắt trạng thái (vd chế độ Work/Short/Long) |
| Đang chọn | gạch chân 2px `--accent`, chữ `text-ink font-semibold` | `bg-primary text-white font-semibold` |
| Chưa chọn | `text-ink-muted` | trong suốt, viền `border-border`, `text-ink-secondary` |
| ARIA | `role=tablist/tab`, `aria-selected` | `aria-pressed` |

Chip đang chọn không dùng nền đen/trắng — luôn mang màu primary.

### 7.6 Ô nhập
`Input`, `Textarea`, `SelectTrigger`: viền `border-border-strong`, focus = viền `border-brand` + vòng `ring-[3px] ring-brand/15`. Placeholder `text-ink-faint`.

### 7.7 Chỉ số
Số là trung tâm (`font-heading font-bold tabular-nums`), nhãn nhỏ cạnh/dưới, icon nhỏ mờ cạnh nhãn. Nhiều chỉ số → một thanh chia ô bằng hairline. Tránh mẫu "icon trong ô màu + số + nhãn".

---

## 8. Chuyển động
- `motion/react`. Spring vào/ra `{ type: 'spring', stiffness: 320, damping: 26 }`.
- Transition CSS: 0.14s hover · 0.18s đổi kích thước/màu · 0.6–0.8s thanh tiến độ.
- `globals.css` đã chặn toàn cục `prefers-reduced-motion`. Animation bằng JS (motion lặp vô hạn, tsparticles, rAF, flip 3D) phải tự kiểm tra (`useReducedMotion()` của motion) và đứng yên.

## 9. Câu chữ
Xưng "bạn"; nhãn nút theo câu chuẩn ngành, ngắn; không bịa công dụng, không ghi cứng số liệu đếm trong chữ tĩnh; thuật ngữ chuẩn ngành giữ tiếng Anh.

## 10. Checklist

**Nên:** đọc màu/bo góc từ token · một nút chính mỗi khu vực · màu chỉ để truyền nghĩa · gộp mục cùng loại thành một khối hairline · kiểm tra ở 390px.

**Không nên:** gradient trang trí (chỉ chấp nhận ở hero/khối thương hiệu) · tô nền thẻ theo trạng thái · thanh màu viền trái · icon Sparkles · `lucide-react`/bộ icon thứ hai · class `.dark` · trộn tab và chip · nhiều thẻ rời cùng trọng lượng · `text-white/60`, `bg-zinc-900`, mã hex trong component.

---

## 11. Khung app & primitive dùng chung (bản làm lại 01/10/2026)

**Khung (`src/app/(main)/layout.tsx`):** không còn sidebar. Thanh trên cùng 56px (`components/layout/app-top-bar.tsx`) gồm logo, nav dạng underline tab, nút Settings và `UserMenu`; trên `/timer` thanh trong suốt. Dưới 768px có thanh tab dưới đáy (`mobile-tab-bar.tsx`), và `<main>` đã chừa sẵn khoảng đệm. Danh sách nav nằm ở một chỗ duy nhất: `src/config/app-navigation.ts` (có trường `flag` cho feature flag). Có sẵn skip link và `<main id="main-content">`. Trang cuộn theo document, không dùng `h-screen overflow-hidden`.

**Primitive — dùng lại, không tự viết:**
| Component | File | Dùng cho |
|---|---|---|
| `PageContainer` (`narrow` 880 / `wide` 1180), `PageHeader`, `SectionHeading` | `ui/page-header.tsx` | khung mọi trang nội dung |
| `FilterChip`, `FilterChipGroup` | `ui/filter-chip.tsx` | lọc / chuyển trạng thái (`aria-pressed`) |
| `StatStrip` | `ui/stat-strip.tsx` | nhiều con số trong một dải hairline |
| `Kbd` | `ui/kbd.tsx` | gợi ý phím tắt |
| `SettingsSection`, `SettingsRow` | `components/settings/settings-section.tsx` | khối cài đặt |

**Tông màu theo chế độ:** vùng timer gắn `data-timer data-mode="work|break"`. Ở chế độ nghỉ, các token `--accent*` được trỏ sang cyan (`globals.css`), nên chip, thanh tiến độ và nút chính tự đổi màu. Phần tử render qua portal (popover) phải tự mang thêm `data-timer data-mode`.

**Khung tự mờ khi tập trung:** phần tử nào có `data-chrome` sẽ mờ dần sau 3 giây không tương tác khi timer đang chạy (`hooks/use-chrome-idle.ts`).

**Câu chữ:** viết hoa đầu câu (sentence case) ở mọi chỗ; không dùng nhãn viết hoa toàn bộ, không đánh số 01/02 trừ khi là trình tự thật, không gắn `→` vào nhãn nút, không dùng emoji làm icon.
