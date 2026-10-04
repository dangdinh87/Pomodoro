# Batch 2.5b: panel Âm thanh, Không gian, Đồng hồ, Arcade (spec §7.4)

Ngày 2026-10-05, nhánh `feat/design-system`. Xong 6 task, 3 commit code. `pnpm type-check` sạch, `pnpm i18n:check` OK (1353 khoá), `pnpm lint` 0 lỗi (73 warning cũ, file của tôi không thêm warning mới), `pnpm test` 120/122 file xanh, 1125/1130 test. 5 test đỏ là `weather-mood.test.ts` (weather WIP, bỏ qua). Lần chạy đầu `app-dock.test.tsx` đỏ nhất thời (2.4a đang sửa dở), chạy lại riêng thì 14/14 xanh.

## Commit

| Hash | Nội dung |
|---|---|
| `c14cd5c` | `feat(audio)`: sidebar, mixer, preset, saved mixes, YouTube, `slider.tsx` (forward `aria-valuetext`), `mixer-a11y.test.tsx`, 3 locale (hunk `audio.*`) |
| `2dd2fff` | `feat(scenes)`: `scene-card.tsx`, `background-settings.tsx`, `clock-style-picker.tsx`, 2 test mới, 3 locale (`scenes.inUse`, `scenes.names.pomodoro`, `scenes.defaultHint`) |
| `7265e6f` | `feat(arcade)`: `arcade-panel.tsx`, `game-overlay.tsx`, `arcade-mini-timer.tsx` (+test), 3 game đổi màu chữ tone, 3 locale (`arcadeUi.miniTimer|phaseChanged`) |

Chỉ stage hunk của mình trong locale (kiểm bằng dry-run: đúng 6 hunk/locale, không dính hunk weather hay hunk 2.5a).

## Từng task

1. **Âm thanh**
   - Mỗi âm là một hàng: `IconTile` md (nút bật/tắt, `aria-pressed`) + tên + slider + phần trăm. Đang bật: ô icon đổi sang màu kẹo theo nhóm (nature mint, rain sky, noise lilac, study butter, cozy peach, transport tomato, city sky, machine lilac), weight `fill`, bóng nhỏ, nền hàng `surface-raised`, chữ đậm. Tắt: ô trung tính. Trạng thái còn thể hiện bằng icon đặc + "50%" + vạch slider nên màu không phải tín hiệu duy nhất. Tên âm tối đa 2 dòng (không cắt "Rain on wind...").
   - Preset: thẻ "Thư viện" `sticker-sm`, 9 preset là `FilterChip` cuộn ngang (nút mũi tên có `aria-label`), dưới là mục "Bản phối đã lưu n/10": danh sách hàng chip (bấm để phát/tắt) + nút `⋮` có tên "Tuỳ chọn cho {tên}"; trống thì có hướng dẫn. Nút "Lưu bản phối" là nút secondary.
   - Cột trái cuộn một mạch (preset, banner YouTube, rồi danh sách); thanh "Tất cả âm thanh + Dừng tất cả + chip nhóm" dính trên đầu khi cuộn.
   - Chân panel: nút tắt tiếng `Button` 40px (đỏ `destructive` khi đang tắt, đổi tên "Tắt toàn bộ âm thanh" / "Bật lại âm thanh") + nhãn "Âm lượng chung" + pill % + slider, nền `surface-raised`, viền trên 2.5px.
   - **a11y (P3)**: mọi slider có `aria-label` + `aria-valuetext` ("Light rain 40%", "Heavy rain, off", "Master volume 50%", "Master volume, muted"), nút icon đều có tên. `Slider` (primitive 2.3b) chỉ thêm việc forward `aria-valuetext` xuống `Thumb`. Slider trong `background-settings` (độ sáng, độ mờ, blur) cũng có tên + valuetext.
   - YouTube: ô nhập là `Input` `.field` + nút icon; hàng "đang phát" là `sticker-sm` (ảnh bìa bấm để sửa, nút phát/dừng/đóng có tên); thư viện cùng kiểu preset (chip danh mục `FilterChip`); danh sách video chuyển từ `div onClick` sang `button` (bàn phím dùng được), chữ mô tả `ink-faint` đổi sang `ink-muted`. Hành vi giữ nguyên.
2. **Không gian**: `GalleryCard` làm lại thành thẻ sticker (ảnh xem trước 16:9, tên Baloo bên dưới, không còn chữ trắng trên nền đen). Thẻ đang dùng: khung `--accent-solid` dày 4px quanh thẻ + nhãn "Đang dùng" (có icon tick, là chữ, không chỉ màu). **"Giấy kem"** là thẻ đầu tiên, xem trước = doodle giấy + `--stage-tint` (đổi theo chế độ timer), đổi tên qua khoá `scenes.names.pomodoro` (giá trị mới "Cream paper" / "Giấy kem" / "クリーム紙"; khoá giữ nguyên) và cập nhật `scenes.defaultHint`. Tab "Ảnh của tôi": khung nét đứt, nút icon có tên, **lỗi tải ảnh (quá lớn, sai loại, link sai, hết dung lượng, quá 5 ảnh) hiện ngay trong tab dưới dạng `role="alert"`** (trước chỉ có toast), toast thành công giữ nguyên. Giữ nguyên toàn bộ hành vi 1E: preview tạm, Esc/Close/Back hoàn tác, lưu ảnh vào IndexedDB, `custom:<id>`. 9 scene WebGL không đụng.
3. **Đồng hồ**: `ClockStylePicker` dùng chính `GalleryCard` (chế độ `radio`: `role="radio"`, `aria-checked`, roving tabindex, phím mũi tên như cũ), cùng khung "Đang dùng", nhãn "3D" thành pill lilac. Preview vẫn là component đồng hồ thật (không sửa), bỏ `data-theme="dark"` cứng nên preview theo theme của người dùng.
4. **Arcade**
   - Lưới: `sticker sticker-press` với preview (nền `surface-raised`, to hơn từ `md`), `IconTile` màu kẹo theo game, mô tả, thời lượng, pill điểm cao (butter, chữ `on-accent`). Ghi chú đầu trang: vàng (`warning`) khi focus đang chạy, xanh (`info`) khi đang nghỉ. Chip lọc dùng `FilterChip`. Sheet hướng dẫn: `sticker-lg` bo, nút đóng tròn có viền, pill điều khiển viền 2px.
   - Khung game (`GameFrame`, dùng chung 10 game): header với ô điểm (Score butter, Best/khác surface), nút pause/restart/close dạng secondary; overlay Start/Paused/Game over là thẻ `sticker-lg` nảy spring (tắt khi reduced-motion); `OptionPills`, `SummaryRow` theo chip/sticker; canvas dùng `ring` + bóng thay cho `border` (border làm lệch toạ độ chuột/chạm vài px).
   - **Mini timer (P2-12)**: `ArcadeMiniTimer` (`role="timer"`, nhãn "Short break: 03:12 left", cùng định dạng mm:ss của đồng hồ chính, icon theo pha, có dấu ⏸ khi timer không chạy) nằm ở thanh phụ dưới header mỗi game và ở đầu trang lưới Arcade.
   - **Đổi pha khi đang chơi**: `useArcadePhaseNotice` theo dõi `mode` của timer-store; khi đổi (hết nghỉ sang focus, hoặc ngược lại) thì gọi `session.pause()` (chỉ tác dụng khi đang `playing`) và hiện `ArcadePhaseNotice` (`role="status"`): "Break's over. Time to get back to focus. The game is paused." + nút "Về đồng hồ" (đóng panel) và "Đã hiểu". Đã chạy thật: đặt nghỉ ngắn còn 60s, chơi 2048, hết giờ thì game dừng và hiện thông báo (ảnh `2-5b-arcade-phase-notice-390-light.png`).
5. **Contrast**: không còn `text-white` trên nền màu trong file của mình (còn `text-white` trên lớp phủ đen `bg-black/40-60` của ảnh bìa YouTube, đúng). `text-danger` thành `text-danger-ink` (tab YouTube, nút xoá preset, lỗi link), tone trên nền `-bg` dùng `-ink`. Ngoài danh sách, trong `entertainment/**`: `typing-sprint-game` (`text-success/danger` → `-ink`), `tic-tac-toe-game` (`text-info` → `text-info-ink`), `minesweeper-game` (`text-primary-foreground` → `text-on-accent`). Chỉ đổi token chữ, không đụng luật hay màu vẽ canvas.
6. **Test mới (29)**: `mixer-a11y.test.tsx` (aria-valuetext tiếng Anh/Việt, nút bật/tắt, tone ô icon, slider chung + nút tắt tiếng), `scene-card.test.tsx` (nhãn "Đang dùng" en/vi/ja, khung, chế độ radio), `clock-style-picker.test.tsx` (radiogroup, "Đang dùng", mũi tên, 3D), `arcade-mini-timer.test.tsx` (hiện giờ còn lại, cập nhật theo store, tạm dừng, en/vi/ja; `GameFrame` tự pause khi đổi pha cả hai chiều, "Về đồng hồ" gọi `closePanel`, "Đã hiểu" chỉ ẩn thông báo, không báo khi cùng pha).

## Ảnh kiểm (`plans/reports/assets-261005-relaunch/`, không commit)

`2-5b-sound-{390-light,390-dark,1440-light,390-vi-light}`, `2-5b-scenes-{390-light,390-dark,1440-light,1440-dark}`, `2-5b-clocks-{390-light,390-dark,1440-light}`, `2-5b-arcade-{390-light,390-dark,1440-light,1440-dark,390-ja-light}`, `2-5b-game-1440-dark`, `2-5b-arcade-phase-notice-390-light`, `2-5b-focus-arcade-card-1440-light`.
Chrome DevTools MCP (context `relaunch-2-5b`, 390×844×2 mobile và 1440×900): `scrollWidth` bằng chiều rộng viewport ở sound, scene, timer, arcade (sáng/tối, en/vi/ja). Vòng focus đo được `3px solid rgb(194,51,15)` (thẻ Arcade). Esc ở bảng Không gian: dialog đóng, canvas Aurora biến mất, `background-settings` về mặc định. Tab thật trong DOM: slider có `aria-valuetext` ("Lửa trại 50%", "Âm lượng chung 50%" ở bản vi). Console không có lỗi từ code của batch (chỉ một lỗi build của route dev `/dev/route-error-tmp` thuộc phiên khác). Lint trên các file của batch còn 1 warning cũ (`PresetIcon` trong `preset-chips.tsx`, `react-hooks/static-components`).

## Quyết định tự chọn

- `Slider` thuộc primitive 2.3b nhưng cần forward `aria-valuetext`: sửa 2 dòng, chỉ thêm (không đổi API cũ).
- Không có mini-player YouTube hiển thị sau 1E (`<YouTubeFloatingPlayer />` vẫn bị comment trong `app-providers.tsx`); hàng "đang phát" trong tab YouTube là chỗ hiện duy nhất. Không thêm lại iframe ẩn hay floating bar.
- Thông báo đổi pha chỉ hiện trong khung game; trang lưới Arcade dùng mini timer + ghi chú sẵn có (đổi theo pha) nên không cần thông báo riêng.
- Lỗi tải ảnh chuyển từ toast sang inline `role="alert"` (không để cả hai cho khỏi lặp).
- Khung chọn thẻ vẽ bằng phần tử riêng `-inset-2 border-4` (không dùng `outline`) để vòng focus (outline 3px, offset 1px) và khung "Đang dùng" cùng hiện được khi thẻ vừa chọn vừa focus.

## Không đụng / để lại

- **Chưa sửa**: `floating-player-bar.tsx`, `youtube-suggestions.tsx` (không ai render; còn chuỗi cứng tiếng Anh/Việt "Now Playing", "Gợi ý phù hợp…"). Nên xoá hoặc i18n khi quyết định có làm lại mini-player.
- `timer-settings.tsx` (phần thời lượng, switch quanh bộ chọn kiểu đồng hồ): để 2.5a/settings (đã thấy phiên khác restyle trong ảnh).
- Code của phiên khác: `HowItWorks.tsx` từng lỗi build tạm (`ArmchairIcon`), tự hết; `app-dock.test.tsx` đỏ thoáng qua khi 2.4a sửa dở.

## Follow-up

1. **2048**: ô trống và ô "2" gần như cùng màu với bàn cờ ở sáng (palette game đọc `--surface-raised/-hover`, bị 2.1 làm nhạt). Ngoài phạm vi (màu in-game) nhưng đáng chỉnh khi rà màu game.
2. `snapshot` của Chrome DevTools MCP luôn in `valuetext=""` cho slider Radix kể cả khi thuộc tính `aria-valuetext` đã có trong DOM (đã kiểm bằng `getAttribute`); đừng dùng snapshot đó để kết luận về valuetext.
3. Dark mode: bóng/viền thẻ sticker vẫn mờ (vấn đề chung đã nêu ở 2.3b).
4. Mini timer chỉ đọc store; nếu muốn "giới hạn chơi theo giờ nghỉ" (audit P2-12) thì cần thêm luật khoá/đếm ngược riêng (chưa làm, spec không yêu cầu).
5. Reduced motion: MCP không có công cụ emulate; dựa vào `useReducedMotion` ở overlay/sheet và khối CSS sẵn có.

## Câu hỏi còn mở

- Giữ tên thẻ mặc định "Giấy kem" bằng cách đổi giá trị khoá `scenes.names.pomodoro` (nhanh, khoá cũ) hay đổi tên khoá thành `scenes.names.paper`? Hiện chỉ có `background-settings.tsx` dùng khoá này.
