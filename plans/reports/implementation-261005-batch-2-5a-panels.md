# Batch 2.5a: panel Việc, Thống kê, Cài đặt, Góp ý theo Sticker pop

Ngày 2026-10-05, nhánh `feat/design-system`. Xong 4 panel, 7 commit code + 1 commit báo cáo. Mọi commit đi qua `commit-own.py`, locale chỉ stage hunk của mình.

## Gate cuối

| Gate | Kết quả |
|---|---|
| `pnpm type-check` | sạch |
| `pnpm lint` | 0 lỗi, 73 cảnh báo (cũ) |
| `pnpm i18n:check` | OK (1353 khoá) |
| `pnpm test` | 120/121 file, 1130/1135 test pass. 5 đỏ đều ở `src/lib/weather/weather-mood.test.ts` (weather WIP, bỏ qua theo yêu cầu). Lần chạy đầu có thêm 3 test đỏ thoáng qua do máy tải (nhiều phiên song song), chạy lại thì hết |

## Commit

| Hash | Panel | Nội dung |
|---|---|---|
| `67010d4` | Việc | quick-add, hàng việc, danh sách, bảng, chip lọc, form, tag/mẫu, popover chọn việc, khoá `tasksUi.doneCheer` |
| `a8401e9` | Việc | khung xương bảng về `rounded-lg` chuẩn |
| `ed2cecb` | Thống kê | ô số to, heatmap, cột tuần, danh sách phiên, StreakPill, màn trống Tomo |
| `3b5322a` | Thống kê | trạng thái chưa đăng nhập có `PageHeader` (nút đóng không còn đè lên thẻ) |
| `b795c15` | Cài đặt | vỏ panel, `SettingsSection` thẻ sticker, Giao diện (chip sáng/tối + ô màu), Tài khoản |
| `951f42b` | Góp ý | form primitive mới, sao có viền, Tomo `party` + lời cảm ơn, đổi `feedback.success.message` sang giọng Tomo |

## Từng panel

### Việc cần làm
- **Quick-add**: cả thanh là một `.field` (viền, bóng, focus đổi bóng sang `--accent-solid` + vòng 3px qua `has-[input:focus-visible]`), `IconTile` tomato có dấu `+`. Select ưu tiên bên trong giữ phẳng (`shadow-none!`).
- **Hàng việc**: danh sách là một `.sticker` chia vạch `divide-y-2`, hàng thẳng không nghiêng. Việc đang chọn: nền `brand-soft` + vạch trái `accent-solid` (hàng) hoặc bóng accent (thẻ bảng). Checkbox dùng đúng primitive (bỏ ghi đè `rounded-full`, `text-white`).
- **Bounce khi xong**: tick xong thì ô nảy (motion, scale 1 → 1.3 → 1), tiêu đề gạch ngang ngay, 380 ms sau mới gọi cập nhật trạng thái và hàng chuyển sang nhóm Xong. Chạm lại trong lúc nảy bị bỏ qua; đóng panel giữa chừng thì cập nhật chạy ngay (không mất); lỗi thì bỏ tick; `prefers-reduced-motion` và bỏ tick thì không chờ. Lý do làm vậy: nếu cập nhật ngay, hàng biến mất trước khi thấy nảy (nhóm Xong mặc định gập).
- **Nhóm Xong**: hàng cuối nhóm là Tomo `party` 40px + `tasksUi.doneCheer`, chỉ khi nhóm đang mở và có ≥ 1 việc xong. Nút "Hiện N việc đã xong" thành `Button variant="link"`.
- **Chip lọc** dùng `FilterChip` (đã có), ô tìm bỏ `h-10`. **Badge**: ưu tiên có cờ `Flag` fill (không chỉ dựa vào màu), tag viền. Chấm Pomodoro có viền.
- **Bảng**: cột là `.sticker` nền raised, tiêu đề có `IconTile` (sky/butter/mint) + pill đếm; thả vào cột thì bóng đổi sang accent; khung cuộn chừa chỗ cho bóng (`-m-1 p-1 pr-2`, `scroll-pl-1`).
- **Form**: bỏ mọi `h-9/10/11`, lỗi dùng `aria-invalid` (`.field` tự đổi màu), tiêu đề có `IconTile`, gợi ý tag là `badgeVariants` outline, nút Thêm tag cao bằng ô nhập.
- **Popover chọn việc** (`task-selector.tsx`, chỉ phần `PopoverContent`): bỏ `data-theme="dark"`, `border-border`, `shadow-[…]`, `rounded-lg bg-surface`, `sideOffset` thừa, `h-9`; `text-gold` → `text-warning-ink`. Phần pill ở thẻ đồng hồ không đụng (batch timer).
- **Màn trống**: Tomo `happy` + nút chính; không khớp bộ lọc dùng Tomo `sleepy`.

### Thống kê / lịch sử
- `StatStrip` có icon + tone: Timer/tomato, Target/mint, Fire/butter, Trophy/lilac. `StreakPill` ở header khi chuỗi hiện tại > 0.
- **Heatmap**: ô 14px co giãn theo bề rộng (`minmax(14px,1fr)`, vuông), bo 4px, viền mảnh (`--border` ô trống, `--outline` ô có phút), thang kem → màu accent 0/30/55/80/100% (theo bộ màu người dùng chọn, mặc định cà chua; chạy cả sáng/tối vì cả hai đầu là token). Ô hôm nay có vòng `--ink`. Có `data-level`, xuất `levelFor` + `HEATMAP_LEVEL_MIX`. Nhãn thứ cùng lưới 7 hàng nên thẳng hàng.
- **Cột tuần**: cột bo trên, viền 2px; hôm nay = accent, ngày khác = butter, ngày 0 phút = mẩu phẳng viền. `ul`/`li` vẫn có `aria-label` từng ngày.
- **Danh sách phiên**: thẻ sticker; huy hiệu theo màu chế độ timer (tập trung = cà chua, nghỉ ngắn = success/mint, nghỉ dài = info/sky). "Không có phiên" có Tomo `sleepy` nhỏ.
- **Trống**: chưa có phiên → Tomo `sleepy`; lỗi → Tomo `worried` + nút thử lại; chưa đăng nhập có header.

### Cài đặt
- Hai cột giữ nguyên. Cột trái: khay `surface-raised`, mục hiện tại là sticker nhỏ nổi, mỗi mục có `IconTile` (butter/lilac/sky từ `settings-sections.ts`). Mobile vẫn `Tabs`.
- `SettingsSection` = `.sticker` + `IconTile` + tiêu đề Baloo (`h3`, trước là `h2` cùng cấp tiêu đề tab); thêm prop `icon`, `tone`; `SettingsRow` thêm `stacked`. Vì mọi caller dùng chung, `timer-settings`, `bell-notifications`, `general-settings`, `weather-settings` tự đổi hình mà không bị sửa.
- **Giao diện**: Sáng/Tối/Theo hệ thống là chip (wrap); 6 bộ màu là `ColorPresetPicker` (Radix RadioGroup nên 1 tab stop, mũi tên đổi lựa chọn): ô tròn 48px viền + bóng, ô đang chọn có dấu tick `--on-accent` và vòng `--ink`, tên dưới ô, mô tả bộ màu đang chọn dưới lưới. Font/cỡ chữ vẫn là Select.
- **Tài khoản**: khách = thẻ sticker + Tomo `happy`; vùng xoá tài khoản = `SettingsSection` icon tomato; `text-destructive` → `text-danger-ink`.

### Góp ý
- `Label`, `Textarea`/`Input` primitive (`aria-invalid` cho lỗi), chip loại có icon; form `flex flex-col gap-5` (do `FilterChipGroup` có `-m-1` làm `space-y` mất khoảng cách).
- Sao đánh giá là SVG riêng: vàng `--gold` viền `--outline` khi sáng, rỗng viền `--control-edge` (đạt tương phản đồ hoạ trên mọi nền; Phosphor Star không viền được).
- Gửi xong: Tomo `party` 136px (vào bằng spring + 2 bước nhảy, tĩnh khi reduced-motion) và bong bóng sticker có đuôi trỏ lên Tomo chứa "Cảm ơn bạn!" + `feedback.success.message` (viết lại ở giọng Tomo: "Mình nhận được rồi! Mình sẽ đọc từng chữ…"). Không thêm khoá mới.

## i18n
- Khoá mới: `tasksUi.doneCheer` (en/vi/ja). Sửa chữ: `feedback.success.message` (en/vi/ja) sang giọng Tomo ("mình" / "bạn"; JA lịch sự thân thiện).
- Không dùng `|| 'fallback'`.

## Test mới (đều xanh)
- `task-row.test.tsx` (7): nảy rồi mới báo, lỗi thì bỏ tick, chạm đôi, đóng giữa chừng không mất, bỏ tick tức thì, huy hiệu.
- `task-list-view.test.tsx` (3): cheer chỉ khi nhóm Xong mở và có việc; một cheer mỗi nhóm; không có khi chưa xong việc nào.
- `streak-heatmap.test.tsx` (14): ranh giới 0/1/24/25/59/60/119/120, thang mix, `data-level` từng ô, nhãn ô, không có ô ngày tương lai.
- `week-chart.test.tsx` (2): nhãn truy cập đủ 7 ngày kể cả ngày 0, chỉ ngày học hôm nay là cột accent.
- `color-preset-picker.test.tsx` (5), `feedback-panel.test.tsx` (7: en/vi/ja sau khi gửi, lỗi, sao).

## Kiểm bằng mắt (`plans/reports/assets-261005-relaunch/2-5a-*.png`, không commit)
Chrome DevTools MCP, context `relaunch-2-5a` (+ `relaunch-2-5a-empty` cho khách mới), emulate 390×844×2 mobile và 1440×900.
- Việc: list/done (en + vi), board (390 + 1440), dark, form 1440, trống (trước/sau).
- Thống kê: 390 dark, heatmap light/dark, JA, trống `sleepy`, chưa đăng nhập.
- Cài đặt: General 390, Giao diện 390 (en, vi) và 1440 (sáng/tối), Tài khoản 1440, vòng focus ô màu, Hẹn giờ 390 (tự nhận thẻ mới).
- Góp ý: 390 light, 390 vi dark, màn cảm ơn.
- Không tràn ngang ở 390 (`scrollWidth` 390 ở cả 4 panel). Vòng focus 3px `rgb(194,51,15)` đo được ở chip, ô màu, tab. Bounce đo được: `scale(1.207)` ở 120 ms, hàng sang nhóm Xong sau đó.
- Tương phản: chỉ dùng cặp token đã có test (`ink/-secondary/-muted` trên 3 nền, `-ink` trên `-bg`, `--on-accent` trên kẹo, `--control-edge`); không có cặp mới ngoài test.

## Quyết định (chọn phương án đơn giản nhất)
- `SettingsSection` mặc định `icon=SlidersHorizontal`, `tone=butter` cho caller chưa truyền (xem Follow-up 1).
- Heatmap dùng `--accent-solid` thay vì cứng `--candy-tomato`: mặc định vẫn cà chua, đổi theo bộ màu.
- Tiêu đề `SettingsSection` đổi `h2` → `h3` (đúng thứ bậc dưới `h2` của tab).
- Không đổi Select ưu tiên trong quick-add thành sticker (nằm trong ô sticker cha, lồng sẽ rối).
- Không thêm `IconTile` vào `PageHeader` (primitive 2.3b, không thuộc phạm vi); tiêu đề panel Việc/Thống kê/Góp ý vẫn chỉ là chữ Baloo.

## File bỏ qua (có lý do)
- `general-settings.tsx`, `weather-settings.tsx` (weather WIP).
- `timer-settings*.tsx`, `bell-notifications-section*.tsx` (1F/panel Đồng hồ): chưa sửa className; chỉ hưởng `SettingsSection` mới.
- `background-settings*.tsx` (scene, batch 1E/2.5b): đang có thay đổi chưa commit của phiên khác.
- `animate-ui/**`, `app-dock.tsx`, thẻ đồng hồ/pill ở `task-selector` (khung/timer).

## Follow-up
1. **Truyền icon/tone cho các nhóm trong `general-settings.tsx` và `weather-settings.tsx`** khi weather commit xong: hiện cả "Hẹn giờ và cảnh", "Ngôn ngữ", "Thời tiết" cùng icon sliders màu butter. Gợi ý: `Timer`/mint, `Translate`/sky, `CloudSun`/butter. Tương tự `timer-settings` (Durations/Behavior/Clock display) và `bell-notifications-section`.
2. Gỡ hàm `AppearanceSettings` cũ trong `general-settings.tsx` (còn từ 2.1, vẫn còn `|| p.name`), và dòng `FALLBACK_PENDING` trong `translation-keys.test.ts`.
3. `PageHeader` chưa có tiêu đề kèm `IconTile` như spec §5 (sheet header); nếu muốn đồng bộ panel Việc/Thống kê/Góp ý thì thêm prop `icon` cho `PageHeader` (batch primitive).
4. `StatStrip` giá trị dài (JA "7時間27分") xuống dòng ở ô 168px, "分" đứng riêng; có thể giảm cỡ chữ theo độ dài.
5. Radix Dialog tự focus nút "Dùng mẫu" thay vì ô tên việc trong form thêm việc (`autoFocus` bị đè); cần `onOpenAutoFocus` ở `DialogContent` nếu muốn.
6. `TaskRow` bỏ tick đang chờ 380 ms trước khi báo: nếu thêm test e2e về tick thì cần chờ khoảng này.
7. Màn Hẹn giờ (panel timer) đang ở trạng thái chuyển tiếp: nút đóng trông chưa theo sticker (phiên khác đang làm).

## Câu hỏi còn mở
- Dùng cứng `--candy-tomato` cho heatmap (đúng chữ spec "kem đến cà chua") hay giữ theo bộ màu người dùng như hiện tại?
