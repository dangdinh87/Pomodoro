# Batch 2.3a — Overlay Sticker pop (spec §5, hàng overlay)

Ngày 2026-10-05, nhánh `feat/design-system`. Xong 6 task, 4 commit code + 1 commit báo cáo. `pnpm type-check` sạch, `pnpm lint` 0 lỗi (94 warning cũ), `pnpm i18n:check` OK (1273 khoá), `pnpm test` 85/86 file pass (827/832 test). 5 test fail đều ở `src/lib/weather/weather-mood.test.ts` (weather WIP của phiên khác: preset dùng id âm thanh mà `soundCatalog.ambient` không còn, sau commit `c416c7b` ẩn 9 âm câm). Không liên quan overlay, không đụng.

## Commit

| Hash | Nội dung |
|---|---|
| `56b34c1` | `overlay-parts.tsx` (mới, dùng chung), `dialog`, `alert-dialog`, `sheet` |
| `9b4b7f3` | `popover`, `dropdown-menu`, `select`, `command` |
| `db46426` | `tooltip`, `toaster`, `scroll-area`, `calendar` |
| `4766537` | `overlays.test.tsx` (14 ca) |

Không cần thêm khoá locale: `common.close` đã có đủ en "Close" / vi "Đóng" / ja "閉じる". Không sửa `globals.css` và không sửa locale JSON (nên không dính hunk weather).

## Từng primitive

Props và export giữ nguyên, chỉ thêm. Phần dùng chung nằm ở `src/components/ui/overlay-parts.tsx` (scrim, pop-in, nút đóng, hàng menu) để dialog/sheet/popover/menu/select/command không lệch nhau.

1. **dialog, alert-dialog**: thẻ `.sticker-lg` (viền `--outline-w`, `--shadow-sticker-lg`, `--radius-xl`), rộng `calc(100%-2rem)` nên mobile có lề 16px (trước đây dính mép), tiêu đề Baloo `text-xl`. Pop-in scale .92 → 1, 300ms, easing `cubic-bezier(.34,1.56,.64,1)`; thoát 150ms. Nút đóng (Dialog): tròn 32px, viền 2px, `shadow-sticker-sm`, lún khi bấm, vòng focus 3px `--accent`; `aria-label={t('common.close')}`; vẫn là con trực tiếp của content nên `[&>button]:hidden` của `timer-settings-modal` còn tác dụng (có test). Footer đổi `space-x-2` sang `gap-3` (nút sticker xếp dọc không dính bóng nhau); `AlertDialogCancel` bỏ `mt-2 sm:mt-0` vì đã có gap.
2. **sheet**: cạnh trong bo `--radius-lg`, chỉ cạnh hướng vào trang có viền, bóng cứng 6px đổ về phía trang (sheet phải đổ sang trái, v.v.). Bottom sheet giữ `pb-[max(1.5rem,env(safe-area-inset-bottom))]` (hiện app chưa dùng `side="bottom"`, kiểm bằng đọc CSS). `SheetHeader` thêm 2 prop tuỳ chọn: `icon` (ô icon 40px, viền, nền `bg-candy-butter`) và `iconTileClassName` (đổi màu kẹo). Không có `icon` thì layout cũ y nguyên. Close dùng chung nút tròn, nhãn i18n.
3. **popover, dropdown-menu, select, command**:
   - Nội dung = `.sticker` (viền, `--shadow-sticker`, `--radius-lg`) + pop-in 200ms cùng easing nảy; `sideOffset` mặc định 4 → 8 cho khỏi dính bóng.
   - Hàng chọn/tick (select item, checkbox/radio item): nền `candy-sky/40` + viền `--outline` + dấu tick bên phải (mockup đặt tick bên phải).
   - Hàng đang highlight bằng bàn phím hoặc hover: nền `--surface-hover` + vòng 2px `--accent` nằm trong hàng. Khác hẳn hàng đã chọn nên không nhầm (ảnh `select-keyboard`).
   - Select trigger: cao 42px, viền, `shadow-sticker-sm`; mở hoặc focus-visible thì bóng thành `2px 2px 0 var(--accent-solid)`, focus-visible thêm vòng 3px (đo được: `outline 3px rgb(194,51,15)`, cao 42px). Placeholder đổi `ink-faint` → `ink-muted` (5.6:1, `ink-faint` không dành cho chữ đọc).
   - Command: ô tìm có viền + bóng nhỏ, focus thì bóng accent + vòng 3px; chừa `pr-14` để không đè nút đóng của Dialog; heading nhóm Baloo bold; hàng active dùng `data-selected` của cmdk với cùng kiểu highlight.
   - Label/heading trong menu và select: Baloo bold. Phân cách `h-0.5 bg-border`. Shortcut hết `opacity-60` (dùng `ink-muted`).
4. **tooltip**: `bg-ink`, `text-surface`, `rounded-[10px]`, không nghiêng. **toaster**: thẻ sticker `tilt-l`, bo `--radius-lg`, bóng `shadow-sticker`; ô icon 28px viền `--outline` mỗi tone (success `bg-success`, error `bg-danger`, warning `bg-warning`, info `bg-info`, glyph Phosphor bold, chữ `--on-accent`). Theo theme thật qua `useTheme()` (trước đó cứng `theme="dark"`), màu qua biến sonner `--normal-*` trỏ token. Nút action: nền `--accent-solid` + `text-on-accent` (hết `text-white`).
5. **scroll-area**: thumb pill có viền 2px, nền `surface-raised`, thanh 12px. **calendar**: ngày chọn = `--accent-solid` + `text-on-accent` + viền + bóng nhỏ (đo: `rgb(255,90,54)` / chữ `rgb(42,26,20)`), hôm nay = viền `--outline` 2px (không đổ nền), vòng focus ngày `ring-ring` đặc (trước `/50`), caption Baloo, nền root trong suốt (trước `bg-background` lệch màu thẻ popover), `muted-foreground` → `ink-muted`.

## Tương phản đo được

| Cặp | Sáng | Tối |
|---|---|---|
| Chữ `--ink` trên hàng đã chọn (`sky/40`) | 13.0 | 5.6 |
| Chữ `--ink` trên hàng highlight | 13.8 | 10.7 |
| Vòng highlight/focus `--accent` trên `--surface` | 5.4 | 6.7 |
| Tooltip `--surface` trên `--ink` | 16.3 | 14.1 |
| Placeholder `--ink-muted` trên `--surface` | 5.6 | 7.0 |
| `--on-accent` trên ô tone success / info / danger / warning | 10.1 / 9.2 / 7.3 / 11.8 | cùng (màu kẹo giữ nguyên) |

## Ảnh kiểm (`plans/reports/assets-261005-relaunch/`, không commit)

`2-3a-settings-dialog-{1440-light,1440-dark,390-dark}`, `2-3a-select-open-{1440-light,390-dark}`, `2-3a-select-keyboard-1440-light` (highlight vs đã chọn), `2-3a-select-focus-1440-light`, `2-3a-popover-1440-light` (popover chọn việc, đang bị caller đè, xem Follow-up), `2-3a-dropdown-1440-light`, `2-3a-command-{1440,390}-light`, `2-3a-alert-dialog-1440-light`, `2-3a-sheet-tasks-1440-light`, `2-3a-sheet-stats-390-light`, `2-3a-calendar-popover-1440-light`, `2-3a-toast-1440-{light,dark}`, `2-3a-toast-tooltip-1440-dark` (tooltip của dock, xem Follow-up 1).
Chrome DevTools MCP (context `relaunch-2-3a`): không tràn ngang ở 390 (`scrollWidth` 390; dialog 16px mỗi bên), computed khớp: dialog `border 2.5px rgb(42,26,20)`, `radius 28px`, `shadow 6px 6px 0`, `animation enter .3s cubic-bezier(.34,1.56,.64,1)`, scrim `--ink` 40%, nút đóng 32px, `aria-label="Close"`. Alert dialog tối: scrim và thẻ đọc rõ. Reduced motion: không có công cụ emulate trong MCP; dựa vào khối `@media (prefers-reduced-motion)` sẵn có ở `globals.css` (`animation-duration: .01ms !important`), nên scale không nhìn thấy.

## Quyết định

- **Scrim dùng `--outline`, không phải `--ink` thẳng**: sáng thì `--outline` = `--ink` (đúng spec, 40%); tối `--ink` là màu kem nên 40% kem sẽ phủ trắng cả trang, còn `--outline` là nâu đen (dùng 60% cho đủ tối).
- **Pop-in bằng CSS** (Radix `data-state` + tw-animate) thay vì `motion`: Radix Presence tự chờ animation thoát, không phải `forceMount` + `AnimatePresence`. `cubic-bezier(.34,1.56,.64,1)` thay cho spring 420/22 (vượt ~1%, tương đương overshoot ~13% của spring).
- Đuôi `!` của Tailwind v4 ở toast, vì stylesheet sonner được chèn sau CSS app nên thắng khi cùng độ đặc hiệu.
- `.tilt-l` là class thường trong `@layer components` nên không đi kèm biến thể (`group-[...]:tilt-l`); đặt thẳng `tilt-l` trong `classNames.toast`.
- Tránh `outline-hidden` cùng `outline-*` trên một phần tử: `outline-hidden` đặt `--tw-outline-style: none` làm vòng focus biến mất. Hàng menu dùng `outline-0` rồi bật `outline-2` khi highlight.
- Hàng highlight dùng vòng `--accent` (cùng màu vòng focus toàn app) chứ không chỉ đổi nền, vì nền `--surface-hover` chỉ lệch 1.2:1 so với thẻ.
- Tick của hàng đã chọn nằm bên phải (khớp mockup), nên `SelectLabel` bỏ `pl-8`.
- Dark mode: viền hàng đã chọn là `--outline` gần đen nên gần như không thấy trên nền nâu; nhận diện nhờ nền sky + tick (5.6:1). Không thêm màu mới.

## Utility xin batch 2.3b

Không bắt buộc cái nào. Gợi ý nếu muốn gọn: (a) `.border-sticker` = `border: var(--outline-w) solid var(--outline)` (hiện lặp `border-[length:var(--outline-w)] border-outline` ở select/command/sheet/calendar); (b) khai `tilt-l|r` bằng `@utility` để dùng được với biến thể. `ui/overlay-parts.tsx` là file mới của tôi trong `src/components/ui/`, tên không trùng primitive nào của 2.3b.

## Follow-up (ngoài file được giao, cần batch/chủ sở hữu khác)

1. **Tooltip thật của app không phải `ui/tooltip.tsx`**: dock dùng `src/components/animate-ui/components/animate/tooltip.tsx` (`rounded-md bg-surface-raised text-ink`, mũi tên `fill-surface-raised`). `ui/tooltip.tsx` chỉ còn `TooltipProvider` được import. Muốn khớp spec §5 cần sửa file animate-ui thành `rounded-[10px] bg-ink text-surface` + mũi tên `fill-ink` (cho batch dock/1E). Ảnh `2-3a-toast-tooltip-1440-dark.png` cho thấy bản hiện tại.
2. **Caller đè giao diện sticker** (không sửa vì ngoài danh sách):
   - `features/timer/components/task-selector.tsx` `PopoverContent`: `border-border … shadow-[0_4px_20px_…]` + `data-theme="dark"` ⇒ popover chọn việc mất viền ink và bóng cứng (ảnh popover).
   - `components/layout/user-menu.tsx` `DropdownMenuContent`: `rounded-lg border-border bg-surface p-1` ⇒ viền nhạt.
   - `features/app-shell/command-palette.tsx`: `overlayClassName="bg-black/40"` đè scrim token (vẫn đẹp, nhưng nên bỏ).
   - `components/tasks/components/task-form-modal.tsx`: `SelectTrigger className="h-10"` ⇒ 40px thay vì 42px.
3. Panel Việc: nút "…" trong header nằm sát nút đóng 32px của sheet (cùng vị trí `right-4 top-4` như trước, nay nút to hơn); nếu cần chừa chỗ thì thêm `pr-10` ở header panel.
4. Sheet `w-full` trên mobile (mọi panel hiện tại) hiện viền và góc bo ở mép màn hình; nếu muốn phẳng hẳn, thêm `max-sm:rounded-none max-sm:border-0` ở nơi gọi.
5. `DialogContent` chưa có `max-height` mặc định (giữ hành vi cũ); form dài phải tự đặt như `task-form-modal`.
6. Toast `loading`: ô icon cố định 28px, chưa dùng ở đâu (`toast.loading/promise` không có trong repo).

## Câu hỏi còn mở

- Bỏ `overlayClassName="bg-black/40"` ở command palette và sửa 2 caller đè viền ở mục 2 thuộc batch nào (2.4?).
