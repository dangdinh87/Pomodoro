# Sửa các phát hiện audit giao diện cuối (Study Bro relaunch)

**Ngày:** 2026-10-05 · **Nhánh:** `feat/design-system` · **Nguồn:** `plans/reports/visual-audit-261005-relaunch.md` + followups #23, #24, #32
**Kiểm:** `pnpm type-check` sạch · `pnpm lint` 0 lỗi · `pnpm i18n:check` 1372 khoá OK · `pnpm test` 1767 xanh, 5 đỏ là `weather-mood.test.ts` (WIP thời tiết, bỏ qua theo yêu cầu)
**Trình duyệt:** Chrome DevTools MCP, context `visual-fixes`, 360/390/768/1024/1366×657/1440, en/vi/ja, sáng + tối (bộ tối đặt bằng `localStorage.theme`). Ảnh sau sửa: `plans/reports/assets-261005-final-audit/after-*.png` (không commit).

## P0 / P1

| Phát hiện | Cách sửa | Commit | Kiểm bằng |
|---|---|---|---|
| **P0** chip Focus / Long break bấm không ăn ở ≥ 768px | Chữ số đồng hồ `pointer-events-none select-none` (hộp glyph Baloo 2 tràn ~40px lên hàng chip, Chrome hit-test theo hộp glyph); hàng chip `relative z-10` làm lớp bảo hiểm cho mọi kiểu đồng hồ | `641a8a3` | Lưới 25 điểm/chip: trước 5/25, sau **25/25** ở 360, 768, 1024, 1440 (en/vi/ja); click thật "Long break" ở 1440 đổi chế độ. Test: class của `ClockDigits` + hợp đồng nguồn trong `stage-layout.test.ts` (jsdom không có hit-test) |
| **P1** panel Hẹn giờ focus vào "Đặt lại mặc định" (Space xoá cài đặt) | `focusContentOnOpen` (overlay-parts): focus vào chính hộp thoại (có tên), Tab đi từ đầu. Cùng gốc ở panel Không gian (focus vào "Lưu") đã sửa chung. "Đặt lại mặc định" giờ mở AlertDialog xác nhận (focus mặc định vào Huỷ), copy 3 ngôn ngữ `timerSettings.resetConfirm.*` | `806e7c2` | Chrome: mở `?panel=timer` focus = dialog, Space không làm gì, Tab tới nút, Enter ra hộp xác nhận với Huỷ có focus. Test: modal timer + scene focus dialog, reset phải xác nhận, Huỷ/Space không reset |
| **P1** tab ẩn ở panel Âm thanh vẫn nhận focus/SR đọc | `inert` + `aria-hidden` cho pane không active; bỏ `pointer-events-auto` thừa. Giữ mount (YouTube pane giữ state) | `1c4e505` | Chrome: từ tab YouTube bấm Tab → vào ô nhập YouTube, không còn nhảy vào 75 control ẩn. Test: pane ẩn có `inert`, controls ẩn biến khỏi cây `getByRole` |
| **P1 #23** thẻ YouTube che Start trên mobile | Thẻ gắn trong `EnhancedTimer` (không còn ở `AppProviders`). Dưới `md`: `max-md:relative` trong luồng, ngay dưới thẻ timer, rộng bằng thẻ timer; từ `md`: `md:fixed` góc dưới trái như cũ. Sàn 200×200 giữ nguyên (min inline trên slot). Stage cao thêm, trang cuộn | `17bd71e` | 390×844 có video đang tải: `elementFromPoint(tâm Start)` = chính nút, slot 355×200, thẻ ở y 610–917 (dưới thẻ timer 64–594); cuộn 175px thì thẻ nằm trọn trên thanh tab. Desktop 1440 không đổi |
| **#24** thẻ `z-40` dưới panel `z-50` | **Quyết giữ**, ghi lý do trong `docs/design-system.md` 7a: scrim chỉ tối 40% nên thẻ vẫn thấy; panel phải (Âm thanh, Thống kê) không chạm góc dưới trái; nâng thẻ lên trên panel sẽ che chính nội dung panel Việc. Panel Âm thanh có sẵn thẻ đang phát để điều khiển | `17bd71e` | Chrome 1440 mở Âm thanh khi đang phát: thẻ vẫn thấy ở góc trái |
| P2 thẻ đang phát ghi "Sound settings" | Hiện tên video (oEmbed) ở cả hai trạng thái; dòng trên vẫn nói Đang phát/Tạm dừng. Ảnh bìa lỗi rơi về khung (`YouTubeThumbnail`) thay vì icon vỡ | `1787696` | Chrome: "Paused / Những Bản Piano Cover…". Test `youtube-input-section.test.tsx` |
| **#32** id gợi ý `04RM0CQPLHQ` (404) | Bỏ mục đó, thêm Lofi Girl "beats to sleep/chill to" (`rUxyKA_-grg`) vào nhóm Lofi. Đã curl cả 53 id còn lại: thumbnail 200 + oEmbed 200, chỉ còn `jfKfPfyJRdk` (livestream) không có ảnh tĩnh → được fallback mới đỡ | `1787696` | `curl` thumbnail 200 + oEmbed 200 cho id mới; test dữ liệu |

## P2

| # | Phát hiện | Cách sửa | Commit | Kiểm |
|---|---|---|---|---|
| 1 | Banner gợi ý ngôn ngữ che nội dung | **Thanh trong luồng trang** (không `fixed`) đặt trên cùng `[lang]/layout`, chữ một hàng, nút xuống dòng dưới khi hẹp. Thanh công bố chiều cao `--lang-banner-h`; stage một màn hình trả lại đúng chiều cao đó (`section[data-timer]`, khung xương, `--stage-t`), dock được nâng tương ứng, nên thanh + stage vừa một viewport và thẻ không chạm dock | `c8b1db9` | 360×740 `/vi`: thẻ 160–634, dock 645–732, không che Tomo/bong bóng; 390 `/ja/guide` thấy H1; 1366×657 `/ja` thẻ 121–565 < dock 589; tối `ja/terms`. Test: không fixed/absolute, biến CSS đặt/gỡ, hợp đồng CSS |
| 2 | "···" Việc đè nút đóng | `PanelBody` cho header `pr-10` | `e32b7f9` | Chrome 1440: ··· 606–646, X 670–702, không giao nhau |
| 3 | Ô chọn ngôn ngữ không tên, "Tiếng…" bị cắt | Footer: `aria-label` = `common.language`, `min-w-44`. Cài đặt: file `general-settings.tsx` đang WIP nên **không đụng**, sửa gốc: `SettingsRow` cấp id nhãn qua context, `SelectTrigger` dùng làm `aria-labelledby` (đủ cho mọi Select trong hàng cài đặt) | `2206c32` | Chrome: footer 390 vi "Ngôn ngữ"/"Tiếng Việt" 176px không cắt; Cài đặt: combobox có labelledby "Ngôn ngữ hiển thị"; snapshot en `combobox "Language"`. Test 3 ngôn ngữ |
| 4 | Ô nhập 15px, iOS phóng to | Luật `@layer base` trong globals thua utility `text-[0.9375rem]`; sửa ở nguồn: `Input`, `Textarea`, ô thêm việc nhanh có `pointer-coarse:text-base` | `67cb422` | Chrome (touch) email đăng nhập `16px`. Test class |
| 5 | Email sai báo "thử lại sau" | Kiểm `x@y.z` tại chỗ + map `400 INVALID_EMAIL`; `aria-invalid`, `aria-describedby`, `noValidate` (bong bóng trình duyệt sai ngôn ngữ); copy `login.errors.invalidEmail` 3 ngôn ngữ | `15f7904` | Chrome 390 vi `abc@x` → "Địa chỉ email chưa hợp lệ. Bạn kiểm tra lại nhé." Test `abc@x`, `abc`, `a b@c.d`, `@x.com`, map server, vi/ja |
| 6 | Thẻ đang phát không có tên video | Xem dòng trên | `1787696` | |
| 7 | Cài đặt đổi mục giữ vị trí cuộn | `scrollTop = 0` khi đổi mục | `140cf1f` | Test cuộn về 0, cùng mục thì giữ |
| 8 | Logo xuống 2 dòng ở 360 | `whitespace-nowrap`; khi có pill chuỗi thì dưới 380px chỉ còn Tomo (`sr-only` giữ tên cho SR) | `140cf1f` | Test; không dựng được pill chuỗi trong context khách trống nên **chưa chụp** trường hợp có pill |
| 9 | Nhãn ô Full screen khác chữ hiển thị (WCAG 2.5.3) | Tên truy cập chứa chữ hiển thị: en "Enter/Exit full screen", ja "全画面にする/を終了", vi chữ hiển thị đổi "Phóng to" → "Toàn màn hình" | `c8b1db9` | Snapshot `button "Enter full screen"`. Test 3 ngôn ngữ |
| 10 | Weather "Detecting your area…" kẹt | **Không sửa** (phiên thời tiết). Ghi lại: `/api/weather/locate` trả `{"location":null}` ở local, bật sẵn mặc định, gọi 2 lần; cần trạng thái "không xác định được" + tìm thành phố, cân nhắc mặc định tắt (`weather-settings.tsx:90`, `weather-store.ts:43`) | — | — |

## P3

| Mục | Kết quả | Commit / lý do |
|---|---|---|
| Nhãn dock 11px | **Sửa** 12px; đo ja 360: không nhãn nào tràn cột 48px | `14a8f95` |
| Tablist Cài đặt tràn 8px (en 390) | **Sửa** `px-3` dưới sm | `b3fd023` |
| Stats khách mới đòi đăng nhập; tiêu đề "History" lệch "Stats" | **Sửa**: màn trống Tomo "Chưa có phiên nào / Bắt đầu tập trung" + nút "Đăng nhập để xem thống kê" vẫn một chạm; tiêu đề thành Stats/Thống kê/統計 | `923c92b` |
| en "Colour" lệch "Color" | **Sửa** | `14a8f95` |
| Thẻ Arcade lẫn chữ preview | **Đã đạt sẵn**: SVG preview có `aria-hidden="true"`; audit đọc `textContent` | — |
| "15–30" vỡ dòng landing | **Sửa** `nowrap` + `min-w-12` | `14a8f95` |
| Skip link layout app kiểu cũ | **Sửa**: một `SKIP_LINK_CLASS` dùng chung 2 layout | `b3fd023` |
| Cảnh báo "Missing Description" ×2 | **Sửa** `aria-describedby={undefined}` cho panel host | `c34372d` |
| Settings lồng `main`/`aside`/`h1` | **Sửa** thành div/p/h3 | `b3fd023` |
| Theme mode "System" rớt dòng ở 390 | **Sửa** ẩn icon chip dưới 420px (cần 319px, có 284) | `14a8f95` |
| Thư viện YouTube mặc định "Vietnamese chill" cho en/ja; tiêu đề Unicode đậm | **Sửa** en/ja mở ở Lofi, vi ở Chill VN; "𝐏𝐥𝐚𝐲𝐥𝐢𝐬𝐭" → "Playlist" | `bbfd0b3` |
| Góp ý gửi rỗng không focus; đăng nhập lỗi hiện viền focus xanh mặc định | **Sửa** cả hai: focus ô đầu tiên sai; đăng nhập lỗi trả focus về ô (ô disabled lúc gửi làm focus rơi ra khung) | `923c92b`, `858734a` |
| Thẻ timer ở chế độ nghỉ trống ~100px | **Bỏ qua**: thẻ giữ chiều cao có chủ đích để chuyển chế độ không giật (CLS 0) | — |
| Pill phiên "0" → "1", pill chuỗi chèn sau khi tải | **Bỏ qua**: dữ liệu về sau hydrate; muốn hết dịch phải đặt chỗ trước hoặc SSR số liệu | — |
| Pill timer Arcade dùng ⏸ | **Bỏ qua**: thực tế là icon Pause phosphor `aria-hidden` cạnh giờ, đã có `labelPaused` cho SR; đổi thành chữ cần thêm copy 3 ngôn ngữ, giá trị thấp | — |
| Cảnh báo dev "script tag" của next-themes khi remount layout | **Bỏ qua**: lỗi dev của thư viện + React 19, không ảnh hưởng prod | — |
| Dark: thẻ so với nền 1.19:1 | **Bỏ qua**: đúng spec (design-system 2.1), đã có `--control-edge` cho control | — |
| Bo góc lệch token (6/8/10/11/14px) | **Bỏ qua**: cần rà toàn bộ component, nên làm một batch riêng | — |
| IconTile sliders trùng (followup #13) | **Bỏ qua**: nằm trong `general-settings.tsx`/`weather-settings.tsx` (WIP thời tiết) | — |

## Lệch / lưu ý

- **Chuyển chỗ gắn mini player** từ `AppProviders` sang `EnhancedTimer`: cần thiết để thẻ nằm trong luồng dưới thẻ timer trên mobile. Hệ quả: chỉ còn ở trang chủ (đúng thực tế, `(main)` chỉ có trang chủ). Phiên perf đang sửa `enhanced-timer.tsx` song song; commit `17bd71e` chỉ stage hunk của mình, sau đó cả hai nằm trong HEAD.
- **Lần đầu mở trên điện thoại thẻ YouTube ló một phần trên thanh tab**, phải cuộn ~170px (390×844) để thấy trọn; không tự cuộn để khỏi giật stage. Muốn thấy trọn ngay thì phải bớt cao thẻ timer lúc đang phát (chưa làm, ghi trong design-system mục 13).
- **Thanh gợi ý ngôn ngữ làm trang dịch xuống một lần sau hydrate** (chỉ người có ngôn ngữ trình duyệt khác trang): đánh đổi để không che nội dung; stage đã trả lại chiều cao nên không tạo cuộn thừa.
- Vi phạm quy tắc `git diff --stat` một lần: chạy chung một lệnh với bước sửa `enhanced-timer.tsx` nên chỉ thấy diff của phiên perf sau khi đã sửa; chỉ thay chuỗi cục bộ trên bản đọc mới, và commit bằng `--shared`.

## Việc còn lại / câu hỏi

1. Dữ liệu gợi ý YouTube có 2 id trùng giữa các nhóm (`4xDzrJKXOOY` ở Lofi và "James Scholz 12 Hours" ở Pomodoro; `FjHGZj2IjBk` ở Cafe và Ambient "Blade Runner 2049") và nhóm Brainwaves chỉ có 1 mục. Nhãn và video không khớp, cần chủ dự án chọn lại video.
2. Livestream `jfKfPfyJRdk` không có ảnh tĩnh (404 mọi cỡ); hiện chỉ fallback khung "YT".
3. Weather sync: xem mục 10.
4. Chưa kiểm trên iOS Safari thật (chỉ emulate touch + `pointer: coarse`), chưa kiểm hàng pill chuỗi ở 360.
