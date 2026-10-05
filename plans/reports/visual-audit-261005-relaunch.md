# Audit giao diện + UX + a11y — Study Bro relaunch (Sticker pop)

**Ngày:** 2026-10-05 · **Nhánh:** `feat/design-system` (cây làm việc có WIP thời tiết + phiên `review-fixes` song song đang sửa `youtube-controller.ts`) · **Dev server:** `localhost:3001`
**Đã quét:** 13 route (`/`, `/vi`, `/ja`, 3 guide, privacy, `/vi/privacy`, terms, `/ja/terms`, `/nope`, `/vi/nope`, `/en/guide`) ở 390 + 1440 · 9 panel `?panel=` × light/dark × 390/1440 (thêm `/vi`, `/ja` cho home + settings) · home 360×740, 1366×768, 768×1024, 1920×1080 · ⌘K, `?`, reset confirm, ăn mừng phiên, YouTube mini player, đổi ngôn ngữ khi timer chạy, banner gợi ý ngôn ngữ, một lượt reduced-motion · Lighthouse mobile `/` + `/vi`, trace hiệu năng.
**Tài khoản:** khách (anonymous) trong context Chrome riêng `final-audit` + Chrome headless sạch (puppeteer). Dữ liệu thử: 1 phiên 25 phút tạo bằng cách bơm `deadlineAt` (đã ghi vào tài khoản khách của context đó); 1 task thử đã xoá lại.
**Ảnh:** `plans/reports/assets-261005-final-audit/` (không commit). Probe thô: `crawl/findings.json`, `panels/*/findings.json`, `lighthouse-en|vi/report.html`.

**Kết quả:** P0 **1** · P1 **2** (+ follow-up #23 còn tái hiện, mức P1) · P2 **10** · P3 **17**

**Đánh giá chung:** Bản relaunch nhìn đồng bộ và sạch: không tràn ngang ở mọi route/khung, không lộ key i18n, chữ đạt AA cả sáng lẫn tối, vòng focus rõ, CLS 0. Lỗi nặng nhất là **chip chế độ (Tập trung / Nghỉ dài) bấm không ăn ở tâm** trên mọi màn ≥ 768px vì vùng chữ của đồng hồ đè lên. Kế đến là hai bẫy bàn phím: panel Hẹn giờ mở ra focus vào "Đặt lại mặc định" (Space là xoá cài đặt), và tab ẩn trong panel Âm thanh vẫn nhận focus.

---

## Sửa ngay (P0/P1)

### P0-1. Bấm vào giữa chip "Focus" / "Long break" không đổi chế độ (desktop + tablet)
- **Hiện tượng:** Ở ≥ 768px, bấm vào tâm chip Focus hoặc Long break không có gì xảy ra; chỉ mép trên chip ăn. Short break ăn vì tâm nó nằm trên khe dấu `:`.
- **Đo:** Lưới 25 điểm/chip, tỉ lệ điểm trúng chip — 768×1024, 1366×768, 1440×900, 1920×1080: Focus **40%**, Long break **40%**, tâm **BLOCKED** (cả `/`, `/vi`, `/ja`). Mobile 360: 60–76%, 390: 80–88% (nửa dưới chip bị chặn, tâm vẫn ăn).
- **Tái hiện:** 1. Mở `/` ở 1440×900. 2. Bấm giữa chip "Long break" → vẫn Focus 25:00 (đã thử 3 lần bằng click thật; Short break thì đổi ngay). 3. `document.elementFromPoint(tâm chip)` trả về `span[data-clock-cell]`.
- **Bằng chứng:** ![](assets-261005-final-audit/p0-mode-chips-blocked-1440.png) (chấm đỏ = điểm bấm rơi vào chữ số đồng hồ) · ![](assets-261005-final-audit/home-1366-light.png)
- **Nguyên nhân:** `src/features/timer/components/clocks/digital-clock.tsx:43-56` + `clock-digits.tsx:23,37` — số 160px font Baloo 2 với `leading-none`: hộp chữ (ascent+descent của font) tràn lên ~40px trên line box, phủ hàng chip ở trên (khoảng cách chỉ `--stage-gap`). Hit-test của Chrome theo hộp chữ, không theo box của span.
- **Đề xuất sửa:** thêm `pointer-events-none select-none` cho `<span data-clock-digits>` (đồng hồ chỉ để xem; `role="timer"` không cần nhận chuột). Thêm `relative z-10` cho hàng chip làm lớp bảo hiểm. Kiểm lại cả analog/flip/3D trong `components/clocks/`.
- **Ảnh hưởng:** mọi người dùng desktop/tablet, mọi locale. Đường vòng chỉ có ⌘K "Switch to…" hoặc bấm đúng mép trên chip.

### P1-1. Mở panel Hẹn giờ rồi bấm Space là mất toàn bộ cài đặt, không hỏi, không hoàn tác
- **Hiện tượng:** ≥ 640px, panel Hẹn giờ mở ra với focus nằm trên nút "Reset to defaults". Space/Enter (Space cũng là phím Start quen tay) reset ngay độ dài phiên, auto-start, chuông, âm lượng chuông; chỉ hiện toast "restored to defaults" không có Undo.
- **Tái hiện:** 1. 1440×900, đổi Focus time thành 26. 2. Esc, bấm `C` mở lại panel. 3. Bấm Space → Focus time về 25, toast hiện.
- **Bằng chứng:** ![](assets-261005-final-audit/timer-panel-reset-focus-1440-dark.png)
- **Nguyên nhân:** `src/components/settings/timer-settings.tsx:285` (nút reset là phần tử focus được đầu tiên trong header) · `timer-settings-modal.tsx:11` (`DialogContent` không có `onOpenAutoFocus`) · `timer-settings.tsx:135-141` (`resetToDefaults` chạy thẳng).
- **Đề xuất sửa:** `onOpenAutoFocus={(e) => { e.preventDefault(); closeRef.current?.focus() }}` (hoặc focus tiêu đề/vùng nội dung); và cho reset đi qua `AlertDialog` xác nhận hoặc toast có nút "Hoàn tác" (lưu `prevSettings`).
- **Ảnh hưởng:** cùng gốc ở panel Không gian: focus mặc định rơi vào "Save changes" (`background-settings.tsx:184`, nút luôn bật kể cả khi chưa đổi gì) → Space lưu và đóng panel. Hại ít hơn nhưng nên sửa cùng chỗ.

### P1-2. Panel Âm thanh: tab đang ẩn vẫn nhận focus và vẫn được trình đọc màn hình đọc
- **Hiện tượng:** Đang ở tab YouTube, Tab từ nút tab nhảy vào 75 control vô hình của tab Ambient (opacity 0) trước khi tới nội dung thật; ở tab Ambient thì 20 control vô hình của YouTube nằm giữa danh sách âm và Master volume. Người dùng bàn phím mất dấu focus cả chục lần Tab; trình đọc màn hình đọc cả hai tab cùng lúc.
- **Tái hiện:** 1. `?panel=sound`, chọn tab YouTube. 2. Focus tab "YouTube", bấm Tab → `activeElement` = nút "Scroll right" của Ambient, opacity hiệu dụng 0.
- **Bằng chứng:** ![](assets-261005-final-audit/p1-sound-hidden-pane-focus-390.png)
- **Nguyên nhân:** `src/components/audio/audio-sidebar.tsx:99-119` — pane không active chỉ có `absolute opacity-0 pointer-events-none`, không `inert`/`hidden`; pane YouTube còn bọc `pointer-events-auto` (dòng 117).
- **Đề xuất sửa:** thêm `inert={currentTab !== 'ambient'}` / `inert={currentTab !== 'youtube'}` (React 19 hỗ trợ prop `inert`) và `aria-hidden` tương ứng; bỏ `pointer-events-auto` ở wrapper trong. Giữ fade bằng opacity như cũ.

### (Follow-up #23 — còn tái hiện, mức P1) Thẻ YouTube che nút Start trên mobile, kể cả khi thu gọn
- 390×844: bản mở rộng che từ progress bar đến hết nút Start; bản thu gọn 200×200 (tối thiểu ToS) **vẫn** che tâm nút "Start break" và nút Reset — `elementFromPoint(tâm Start)` = `IFRAME`.
- ![](assets-261005-final-audit/youtube-mini-collapsed-390.png) · ![](assets-261005-final-audit/youtube-mini-390-light.png)
- Gợi ý giữ như #23: mobile đặt player trong luồng trang dưới thẻ timer, hoặc khay trên tab bar có `padding-bottom` tương ứng cho stage.

---

## Nên sửa (P2)

| # | Vấn đề | Chỗ (route/theme/khung) | File | Đề xuất |
|---|---|---|---|---|
| 1 | Banner gợi ý ngôn ngữ che nội dung: 360 che Tomo + bong bóng; `/ja/guide` 390 che H1; 1440 góc dưới trái che chữ bài viết. Comment trong code nói "không che timer" nhưng có che. Ảnh: `vi-home-360-light.png`, `crawl/shots/390w_ja_guide.png`, `ja-terms-1440-dark.png`, `suggestion-banner-390.png` | `/vi`, `/ja`, `/ja/guide`, `/ja/terms`, `/` (trình duyệt vi) · sáng/tối · 360/390/1440 | `src/components/layout/language-suggestion.tsx:62` | Mobile: render trong luồng (không `fixed`) ngay dưới top bar, đẩy stage xuống; desktop: đặt trong header hoặc chừa `padding-bottom` cho vùng đọc. Chữ banner ở 360 bị bóp 4 dòng → cho nút xuống dòng dưới chữ |
| 2 | Tasks: nút "···" (Manage tags) chồng lên nút đóng X của sheet; bấm nửa dưới-trái của X là mở menu. Ảnh: `tasks-header-overlap-1440-dark.png` | `?panel=tasks` · 1440 (cũng sát ở 390) | `src/components/tasks/task-management.tsx:178` + `src/components/ui/sheet.tsx:67` (`OverlayClose` absolute right-4 top-4) | Chừa `pr-12` cho `PageHeader` trong sheet, hoặc đưa X vào hàng header |
| 3 | Ô chọn ngôn ngữ không có tên truy cập (Lighthouse `button-name`); ở footer `/vi` còn bị cắt thành "Tiếng…". Ảnh: `vi-footer-lang-select-390.png` | footer mọi trang (vi bị cắt) + Settings → Language | `src/components/layout/language-switcher.tsx:20` (`w-[140px]`, không `aria-label`); `src/components/settings/general-settings.tsx:73` (file đang có WIP thời tiết) | `aria-label={t('…language')}` hoặc nối `<Label htmlFor>`; đổi `w-[140px]` → `w-auto min-w-[140px]` |
| 4 | Ô nhập cỡ 15px → iOS Safari tự phóng to khi focus (đã đo: email đăng nhập, ô thêm việc nhanh; các ô dùng chung `Input` sẽ dính theo) | mọi form · mobile | `src/components/ui/input.tsx:15` (`text-[0.9375rem]`) | `text-base md:text-[0.9375rem]` |
| 5 | Đăng nhập: email sai định dạng (`abc@x`, server trả `400 INVALID_EMAIL`) lại báo "Couldn't send the code. Try again in a minute." — sai hướng dẫn. Ảnh: `login-invalid-email-390.png` | `?panel=login` | `src/components/auth/login-form.tsx:54` | Map `sendError.code === 'INVALID_EMAIL'` → khoá i18n "Email không hợp lệ", đặt `aria-invalid` cho ô email |
| 6 | Thẻ "đang phát" YouTube trong panel không hiện tên video: lúc dừng ghi "Sound settings", lúc phát ghi "Now playing". Ảnh: `youtube-panel-open-390.png` | `?panel=sound` tab YouTube | `src/components/audio/youtube/youtube-input-section.tsx:81` | Hiện `playingTitle(currentlyPlaying, t)` (đã có ở mini player) |
| 7 | Settings: đổi tab giữ nguyên vị trí cuộn → mở Appearance ở giữa trang (mất mục Theme mode ở trên). Ảnh: `settings-390-appearance.png` | `?panel=settings` · 390 | `src/features/panels/settings-panel.tsx:25` (setActive) + `:55` (`<main>` cuộn) | Reset `scrollTop = 0` của `<main>` khi `active` đổi |
| 8 | Logo "Study Bro" xuống 2 dòng ở 360 khi có pill streak + pill phiên. Ảnh: `ja-home-360-light.png` | top bar app · 360 | `src/components/brand/logo.tsx:27` (thiếu `whitespace-nowrap`), `src/features/app-shell/app-status-bar.tsx:75` (`min-w-0`) | `whitespace-nowrap` cho wordmark; < 380px dùng `variant="mark"` khi có pill |
| 9 | Ô dock "Full screen" có aria-label "Enter focus mode" (vi: "Bật chế độ toàn màn hình") khác chữ hiển thị → lỗi WCAG 2.5.3 (Lighthouse `label-content-name-mismatch`), người dùng giọng nói gọi "Full screen" không được | dock mobile mọi locale | `src/features/app-shell/app-dock.tsx:172` | Cho aria-label chứa nguyên chữ hiển thị, hoặc bỏ aria-label và dùng nhãn hiển thị |
| 10 | **[weather WIP]** "Detecting your area…" đứng mãi khi `/api/weather/locate` trả `{"location":null}` (local luôn null); tính năng bật sẵn mặc định và gọi locate 2 lần (1 lần `ERR_ABORTED`). Ảnh: `settings-390-general-2.png` | Settings → Weather sync | `src/components/settings/weather-settings.tsx:90`, `src/stores/weather-store.ts:43` | Trạng thái riêng "Không xác định được khu vực — tìm thành phố"; cân nhắc mặc định tắt |

---

## Chải chuốt (P3)

- Nhãn dock mobile 11px (< 12px); "Full screen" và vi "Âm thanh / Không gian / Thống kê" xuống 2 dòng còn ô khác 1 dòng — `app-dock.tsx:44`.
- Tablist Settings ở 390 tràn 8px (scrollWidth 316 > 308): tab "Account" đang chọn chạm viền khay, bóng sticker bị cắt — ảnh `settings-390-account.png`.
- Chế độ nghỉ: thẻ timer giữ chiều cao nên trống ~100px dưới nút (ô chọn việc + cà chua phiên bị ẩn) — `home-1366-light.png`, `vi-home-360-light.png`.
- Stats với khách mới (chưa có phiên) báo "Sign in to view your stats" trong khi landing hứa "dùng không cần tài khoản" — `stats-panel.tsx:81`; nên là empty state Tomo "Xong phiên đầu để xem thống kê". Tiêu đề panel "History" lệch nhãn dock "Stats".
- en.json trộn chính tả: "Colour" (dòng 474) cạnh "Color palette" (458).
- Thẻ game Arcade có tên truy cập lẫn chữ của hình preview ("2 4 8 16 2048 Slide…", "fo cus Typing Sprint") — thêm `aria-hidden` cho `GamePreview` (`arcade-panel.tsx:145,211`).
- Pill timer trong Arcade dùng ký hiệu ⏸ làm trạng thái "đang dừng" → trông như nút bấm.
- Sơ đồ chu kỳ landing: "15–30" vỡ 2 dòng ở 390 (`HowItWorks.tsx:24`).
- Top bar: pill phiên hiện "0" rồi mới nhảy "1" và pill streak chèn vào sau khi tải.
- Skip link của layout app dùng kiểu cũ (`rounded-md ring-2`, không viền sticker) khác layout landing — `src/app/[lang]/(main)/layout.tsx:11`.
- Console dev: "Encountered a script tag while rendering React component" khi đổi ngôn ngữ phía client và ở trang 404 — `ThemeProvider` (next-themes) bị mount lại theo layout `[lang]` (`theme-provider.tsx:11`, `app-providers.tsx:26`). Thêm cảnh báo "Missing Description … DialogContent" ×2.
- Dark mode: thẻ so với nền chỉ 1.19:1, viền `#0B0705` trên `#2E221C` 1.3:1 → cạnh sticker và viền chip gần như mất (đúng spec 3.2 nhưng nhìn phẳng) — `home-1440-dark.png`.
- Bo góc lệch token: 6/8/10/11/14px xuất hiện cạnh bộ 12/20/28/pill (probe `design:radius-drift` trên home + guide).
- Settings dialog lồng `complementary` + `main` thứ hai và `h1` bên trong `h2` sr-only.
- Theme mode: "System" rớt xuống dòng riêng ở 390.
- Thư viện YouTube mặc định chọn "Vietnamese chill" cho cả UI en/ja; một mục có tiêu đề Unicode in đậm toán học hiển thị bằng font serif dự phòng.
- Góp ý: gửi rỗng báo lỗi đúng chỗ nhưng focus không chuyển về ô nội dung. Đăng nhập: sau lỗi, khung dialog hiện viền focus xanh mặc định của trình duyệt.

---

## Follow-up cũ: còn tái hiện?

| # | Kết quả |
|---|---|
| 12 Reduced motion | **Đạt**: bật `prefers-reduced-motion`, không còn animation chạy (chỉ transition 0.01s), màn ăn mừng không có canvas confetti |
| 13 IconTile sliders trùng | **Còn**: Timer and scene, Language, Weather sync cùng ô butter sliders (`settings-390-language.png`) |
| 16 Login cắt viền | **Đạt** ở 390 sáng/tối |
| 17 Chưa chụp terms/404 ja/login dark | **Đã chụp**: `ja-terms-1440-dark.png`, `crawl/shots/*nope*`, `panels/login/shots/390w-dark-fold.png` — không lỗi mới |
| 20 2048 ô trống gần màu bàn cờ | **Còn** (giữ theo luật) — `arcade-2048-play-390-light.png` |
| 23 YouTube che timer mobile | **Còn**, xem mục P1 ở trên (kể cả bản thu gọn) |
| 24 YouTube z-40 dưới panel | **Còn**: iframe nằm dưới sheet Âm thanh khi panel mở |
| 25 404 lồng SSR là vỏ lỗi Next | **Còn**: `/vi/nope` HTML `<title>` tiếng Anh, status 404 + `noindex` đúng |
| 29/32 Thumbnail `04RM0CQPLHQ` 404 | **Còn**: 4/4 lượt mở panel Âm thanh |

---

## Đã kiểm và ĐẠT

- Không tràn ngang: 13 route × 390/1440, 9 panel × 390/1440 × sáng/tối, home 360/768/1366/1920 (`scrollWidth = viewport`).
- Không lộ key i18n, `undefined`, `NaN`; quét chữ hiển thị + aria-label + placeholder của 10 màn × vi/ja: không sót tiếng Anh (chỉ "Email" ở vi, chấp nhận được).
- Tương phản AA: probe chữ trên home, landing, guide, terms, panel ở sáng và tối đều ≥ 4.5:1 (≥ 3:1 chữ lớn). Lighthouse mobile: A11y 94 (`/`) / 95 (`/vi`), Best practices 96, SEO 100.
- Hiệu năng (dev, chỉ tham khảo): `/` LCP 355 ms, CLS 0.00; `/vi` với CPU ×4 + Fast 4G LCP 681 ms, CLS 0.00.
- `/en/guide` → 308 `/guide`; `/nope`, `/vi/nope` trả 404 + `noindex`.
- Focus: thứ tự Tab trên home hợp lý (top bar → bong bóng → chip → điều khiển → dock → landing), vòng focus 3px màu accent thấy rõ ở sáng/tối; reset confirm focus mặc định vào "Cancel"; ⌘K, `?`, Esc đóng đúng; Radix giữ focus trong dialog.
- Icon button đều có tên (trừ 2 combobox ngôn ngữ ở P2-3).
- Đổi ngôn ngữ qua ⌘K khi timer đang chạy: chuyển `/vi` → `/`, timer vẫn chạy tiếp, title tab đổi theo.
- Ăn mừng phiên: modal sticker nghiêng, Tomo party, "+25 min", streak, focus vào "Take a break".
- YouTube: video không cho nhúng báo toast rõ ("The owner doesn't allow…"); video khác phát, thu gọn/đóng player chạy đúng.
- Form góp ý báo lỗi tại chỗ (`aria-invalid`, mô tả gắn `aria-describedby`); từ tiếng Việt dài không ngắt vẫn xuống dòng trong thẻ việc, Board cuộn ngang có snap.
- Sticker pop: không có `text-white` trên nền màu (chỉ trên lớp phủ đen của thumbnail), không gradient tím, không glow, không icon Sparkles.

## Chưa kiểm được
- Fullscreen thật (headless), âm thanh/chuông, thông báo trình duyệt, iOS Safari thật (chỉ emulate).
- Một phiên 25 phút chạy thật (đã bơm deadline); nên pill phiên/streak chỉ kiểm hiển thị, không kiểm ghi nhận server.
- Follow-up #1 (confetti khi Skip ≥ 50%) và #22 chưa thử.

## Câu hỏi còn treo
- Banner gợi ý ngôn ngữ: muốn giữ dạng nổi (fixed) hay cho vào luồng trang? Quyết định này ảnh hưởng cách sửa P2-1.
- Weather sync có nên bật mặc định không (P2-10, thuộc phiên thời tiết)?
