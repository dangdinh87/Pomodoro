# Audit tính năng & UX — Study Bro v2 (nhánh `feat/design-system`)

Ngày: 2026-10-05 · Phạm vi: chức năng/UX (không bàn giao diện, đã có spec rebrand Sticker pop). Tính năng thời tiết đang làm dở ở session khác → chỉ ghi "đang làm".

## 0. Cách làm & lưu ý môi trường

- Chạy app thật ở `http://localhost:3001` (Chrome DevTools, context riêng `feature-audit`), 1440×900 (viewport thực 1440×727) và 390×844. Đi hết các panel, chạy phiên, bỏ qua, đổi mode, thêm/xong việc, đổi cài đặt, reload, đăng nhập bằng mã OTP, chuyển dữ liệu khách → tài khoản, đổi ngôn ngữ VI.
- Để test hết phiên mà không đợi 25 phút: chèn `deadlineAt` gần vào `localStorage.timer-storage` trước khi reload (đi đúng nhánh engine thật).
- **Lúc bắt đầu, cổng 3001 không có server nào** → đã chạy `pnpm dev -p 3001` (vẫn đang chạy, không tắt). DB là PGlite local (`.pglite/`, không có `DATABASE_URL`). Đã tạo 1 tài khoản test local `audit-261005@example.com` + 2 việc + 3 phiên.
- Đọc code song song bằng 2 sub-agent (dữ liệu; trải nghiệm). Mọi kết luận dưới đây có bằng chứng: file:line, ảnh trong `assets-261005-feature-audit/`, hoặc log mạng. Mục nào chỉ đọc code mà chưa chạy được thì ghi *(đọc code)*.
- Repo chỉ đọc. File duy nhất được ghi là báo cáo này + thư mục ảnh.

## 1. Tóm tắt

Phần lõi đã chạy được: timer (đếm theo mốc deadline), panel, task, thống kê, scene shader, đăng nhập OTP, chuyển dữ liệu khách → tài khoản. Có 2 lỗi P0:

1. **9/40 âm môi trường là file câm.** Trong đó có White noise, Pink noise, Birds, Coffee shop, Library, nên preset Cafe/Library/Cozy hỏng.
2. **Phiên timer của khách bị bỏ im lặng** khi khách chưa tạo việc nào. Thống kê và streak trống, đăng nhập sau cũng không lấy lại được, trong khi trang chủ hứa "Every finished session is logged".

Có 8 lỗi P1. Nặng nhất:

- Ngày thống kê tính theo UTC. Phiên học trong khoảng 00:00–07:00 giờ VN bị tính sang hôm trước.
- Auto-start mặc định bật cả hai chiều, nên app tự cày phiên khi người dùng đi vắng.
- Mỗi đoạn focus, kể cả 70 giây, đều cộng +1 pomodoro.
- Dialog "hoàn thành việc" hiện key i18n thô.
- Không có chỗ chỉnh chuông báo.
- Chuông và thông báo không chắc kêu khi tab ẩn hoặc trên điện thoại.
- Phím R xoá tiến độ mà không hỏi.

Tiến độ plan v2: phase 00–03 xong; 04, 05, 06, 10, 11 làm dở; 07, 08, 09 chưa bắt đầu.

## 2. Bảng tính năng

| # | Tính năng | Trạng thái | Nằm ở | Ghi chú/lỗi chính |
|---|---|---|---|---|
| 1 | 3 mode, preset 25/5 · 50/10 · 52/17 · 90/20, tuỳ chỉnh (1–120 phút) | Xong | `features/timer/*`, `components/settings/timer-settings.tsx`, `timer-presets.ts` | Copy nói tối đa 60 phút (P2-14) |
| 2 | Tự chuyển nghỉ/tập trung | Xong, **mặc định bật cả 2** | `stores/timer-store.ts:82-83` | Lặp vô hạn khi vắng (P1-2) |
| 3 | Nghỉ dài sau N phiên, chấm chu kỳ | Xong | `session-cycle.tsx` | `sessionCount` không reset theo ngày (P3) |
| 4 | Plan mode (chuỗi bước tuỳ chỉnh) | **Code chết** (chỉ có store) | `timer-store.ts:48-73,342-391` | Không UI |
| 5 | Chuông hết phiên | Một phần | `lib/timer/alarm.ts` | Có 5 file chuông nhưng không có UI chọn/âm lượng (P1-5) |
| 6 | Thông báo hệ thống | Một phần | `lib/timer/notifications.ts` | Chỉ desktop + khi tab ẩn, chữ tiếng Anh cứng, không SW (P1-6) |
| 7 | Tiêu đề tab đếm ngược | Xong | `use-page-title.ts` | |
| 8 | Đồng bộ nhiều tab | Xong (storage event + claim) | `use-timer-engine.ts:111-131`, `completion-claim.ts` | |
| 9 | Đồng hồ 2D (số, kim, flip) + 3D (flip3d, tomato, orbit, solid) | Xong / thiếu so plan | `features/timer/components/clocks/*` | Thiếu đồng hồ cát, orb, split-flap, hành tinh |
| 10 | Scene: 10 shader + ảnh + ảnh của tôi | Xong | `features/scenes/*`, `components/settings/background-*` | Esc không hoàn tác preview (P2-2); ảnh base64 trong localStorage (P2-11) |
| 11 | Scene theo thời tiết | **Đang làm** (session khác) | `hooks/use-weather-sync.ts`, `lib/weather/*` | Không audit |
| 12 | Mixer âm môi trường (40 âm, 9 preset, lưu mix) | Một phần | `lib/audio/*`, `components/audio/*`, `stores/audio-store.ts` | **9 file câm (P0-1)**; mix mất sau reload (P2-1) |
| 13 | YouTube (dán link + 55 gợi ý) | Một phần | `hooks/use-youtube-player.ts`, `components/audio/youtube/*` | iframe ẩn (P1-8), không có player hiển thị |
| 14 | Việc: thêm nhanh, ước lượng, ưu tiên, tag, hạn, list/board, lọc, tìm | Xong | `components/tasks/*`, `hooks/use-tasks.ts`, `api/tasks/*` | Lọc phía client trên 1 trang 100 việc (P2-7) |
| 15 | Template việc | Một phần | `use-templates.ts:33-38` | Template chính là task gắn cờ (P2-5) |
| 16 | Kéo thả sắp xếp | Một phần | `use-task-dnd.ts` | Chỉ ở Board |
| 17 | Thùng rác/khôi phục | **Code chết** | `use-tasks.ts:324-341` | UI chỉ xoá cứng, không có Undo |
| 18 | Gắn việc ↔ phiên, đếm `actual` | Một phần | `api/tasks/session-complete/route.ts:49-56` | +1 cho mọi đoạn (P1-3) |
| 19 | Thống kê: hôm nay/tuần/tháng, biểu đồ 7 ngày, heatmap 12 tuần, streak, phiên gần đây | Một phần | `features/stats/*`, `api/stats`, `api/history` | Ngày theo UTC (P1-1); khách chưa có session thì không có gì (P0-2) |
| 20 | Xuất CSV / báo cáo tuần | **Thiếu** | — | Chỉ có export JSON của tài khoản |
| 21 | Arcade 10 game | Xong | `features/panels/arcade-panel.tsx`, `components/entertainment/*` | Không giới hạn theo giờ nghỉ, không thấy timer (P2-12) |
| 22 | Cài đặt: Chung / Giao diện / Tài khoản | Xong | `features/panels/settings-panel.tsx` | Thiếu: chuông, thông báo, sáng/tối, mục tiêu ngày |
| 23 | Góp ý | Xong (chỉ ghi DB) | `api/feedback` | Không ai được báo (P2-15) |
| 24 | Đăng nhập: OTP email, Google (theo env), khách ẩn danh, chuyển dữ liệu khách | Xong (đã chạy thử) | `lib/auth*.ts`, `move-guest-data.ts` | Rate limit 5 khách/10 phút/IP (P1-7) |
| 25 | Export JSON / xoá tài khoản | Xong cho tài khoản thật | `api/account/*` | Khách ẩn danh không có nút (P2-13) |
| 26 | Command palette ⌘K | Xong (ít lệnh) | `app-shell/command-palette.tsx` | Thiếu thêm việc, đổi scene, mute, skip |
| 27 | Phím tắt Space/R/T/S/B/C/H/G | Xong | `use-timer-hotkeys.ts`, `use-panel-hotkeys.ts` | Không có `?` (bảng phím tắt), R không hỏi (P1-4) |
| 28 | Focus mode (toàn màn hình) | Xong | `app-shell/app-dock.tsx:99-125` | Thoát bằng Esc thì state kẹt (P2-9) |
| 29 | PWA | Một phần | `public/manifest.json` | Không service worker/offline; `start_url` qua redirect |
| 30 | i18n VI/EN/JA | Xong (1225 key ×3, khớp 100%) | `src/i18n/locales/*` | 5 key thiếu ở gốc, toast cứng tiếng Anh (P1-6b, P2-3) |
| 31 | Feature flag | Chỉ có `history` (mặc định ON) | `config/feature-flags.ts` | `feature-gate.ts` là code chết |
| 32 | Landing SSR, /guide, /privacy, /terms, FAQ JSON-LD, sitemap, llms.txt | Xong | `app/(landing)/*`, `app/(main)/page.tsx` | /pricing, /bang-xep-hang, /phuong-phap-pomodoro trả 404 |
| 33 | XP, level, freeze, huy chương, league, bạn bè | **Thiếu** (phase 07) | — | Chỉ có streak đếm từ phiên |
| 34 | Free/Pro, SePay | **Thiếu** (phase 08) | — | |
| 35 | Mascot nhiều trạng thái, trợ lý AI | **Thiếu** (phase 09) | `public/mascot/wolf_cute.*` | Chỉ là ảnh tĩnh ở empty state; `lib/prompts/bro-ai-system.ts` là code chết |
| 36 | Tour người dùng mới | **Thiếu** (phase 10) | — | |

## 3. Lỗi theo mức độ

### P0 — hỏng / mất dữ liệu

**P0-1. 9 âm môi trường là file câm**

- Các file: `birds`, `night-crickets`, `fireplace`, `white-noise`, `pink-noise`, `library`, `coffee-shop`, `coworking`, `cat-purring`.
- Mỗi file đúng 36.710 byte, giống hệt `silence.mp3`. Đo bằng `ffmpeg volumedetect` cho max −84,3 dB; còn `light-rain.mp3` cho −6,7 dB.
- Tham chiếu: `lib/audio/sound-catalog.ts:85,93,101,155,171,182,190,198,241`. Ba preset Cafe, Library, Cozy (`data/sound-presets.ts:16,78,88`) phát ra im lặng, trong khi UI hiện là đang phát.
- **Sửa:** thay bằng file thật. Nếu chưa có thì ẩn khỏi catalog và preset ngay. Thêm test CI để bắt file < 50 KB.

**P0-2. Phiên của khách bị bỏ im lặng**

- `lib/timer/session-recorder.ts:125`: `if (!user && !isLoading) return 'skipped'`. Phiên ẩn danh chỉ được tạo khi khách ghi dữ liệu lần đầu (tạo việc hoặc tag).
- Chạy thử: khách hết 1 phiên thì có chuông và tự chuyển sang nghỉ, nhưng **không có POST nào** tới `/api/tasks/session-complete`. Panel Thống kê chỉ hiện "Sign in to view your stats" (ảnh `03-stats-guest-after-session.png`).
- Đăng nhập sau cũng không lấy lại được, vì phiên chưa từng được lưu.
- Copy đang hứa sai ở 2 chỗ: landing ghi "Every finished session is logged", và Tài khoản ghi "Everything you did as a guest is kept" (ảnh `14`).
- **Sửa:** gọi `ensureSession()` (đăng nhập ẩn danh) trong `recordSession` trước khi gửi. Hoặc lưu phiên vào hàng đợi local rồi nhập vào khi đăng nhập. Phải sửa cùng P1-7.

### P1 — thiếu chức năng lớn / sai dữ liệu

**P1-1. Ngày thống kê theo UTC, client lại gửi ngày local**

- Code: `api/stats/route.ts:11-15,27,46`, `api/history/route.ts:12-14`, `lib/stats/streak.ts:3`, `hooks/use-stats.ts:31-33`.
- Chạy thử: phiên lúc 00:31 ngày 5/10 (giờ VN) bị xếp vào cột CN 4/10. Lọc "Hôm nay" ra "0 phiên / No sessions in this range yet". Dòng tóm tắt hôm nay dưới timer không hiện. Heatmap tô ô CN, ô thứ Hai (hôm nay) trống (ảnh `06`).
- Ảnh hưởng: mọi người học khuya hoặc sáng sớm trước 07:00, kéo theo streak.
- **Sửa:** client gửi `tz` (IANA). Server group bằng `AT TIME ZONE tz` và cắt ngày lúc 04:00 như plan §5.2. Dùng chung cho stats, history, streak và tên file export.

**P1-2. Tự chạy cả nghỉ lẫn tập trung là mặc định → app tự cày phiên khi người dùng đi vắng**

- Code: `timer-store.ts:82-83`, engine `use-timer-engine.ts:203-234`.
- Chạy thử: hết nghỉ thì phiên tập trung tự bắt đầu, có POST ghi phiên nghỉ.
- Hậu quả: rời máy 2 tiếng sẽ có khoảng 4 phiên "hoàn thành" giả, `actual` của việc đang chọn tăng theo. Thống kê và streak bị thổi phồng, và sẽ thành lỗ chống gian lận cho XP sau này.
- **Sửa:** để mặc định `autoStartWork=false`. Dừng sau nghỉ dài. Nếu không có tương tác suốt cả một chu kỳ thì không tự bắt đầu nữa.

**P1-3. +1 pomodoro cho mọi đoạn work, kể cả đoạn ngắn**

- Code: `api/tasks/session-complete/route.ts:49-56`. Phía stats, `completedSessions` đếm mọi dòng work.
- Chạy thử: đoạn 70 giây làm việc hiện "1 of 1 Pomodoros" và lần sau bật dialog hoàn thành việc.
- Việc đổi task hoặc stop giữa phiên còn gửi các đoạn lẻ (`task-management.tsx:90-99`), mỗi đoạn lại +1.
- **Sửa:** client gửi cờ `completedFullSession` (hết giờ tự nhiên, hoặc skip khi đã ≥ 50%). Server chỉ +1 khi có cờ. Thời gian thì vẫn cộng vào `time_spent`.

**P1-4. R, nút ↺ và mục Reset trong palette xoá tiến độ không hỏi, không ghi**

- Code: `timer-store.ts:308-338`, `use-timer-hotkeys.ts:27-29`, `timer-controls.tsx:208`, `command-palette.tsx:68`.
- Lỡ bấm R ở phút 20 là mất 20 phút. Trong khi đó đổi mode thì có hỏi (`timer-mode-selector.tsx:35`), nên hai hành vi không nhất quán.
- **Sửa:** khi `timerHasProgress()` thì hiện confirm, kèm lựa chọn "Ghi phần đã làm".

**P1-5. Không có UI cho chuông**

- `alarmType` và `alarmVolume` chỉ được đọc ở `lib/timer/alarm.ts:9`. Không chỗ nào cho chọn, nên luôn là bell 70%, dù có 5 file chuông.
- Không tắt được chuông, không thử nghe được, không chỉnh âm lượng riêng.
- Cài đặt lại ghi "Focus and break lengths, clock style **and alerts**" (ảnh `12`).
- **Sửa:** thêm mục "Chuông & thông báo" vào Timer settings: chọn chuông, âm lượng, nút nghe thử, trạng thái quyền thông báo.

**P1-6. Báo hết phiên không chắc tới tay người dùng**

- (a) **Timer chạy trên main thread.** `setInterval` 250 ms ở `use-timer-engine.ts:285`, không dùng Worker, không đặt `setTimeout` đúng mốc, chuông không preload (`alarm.ts:12`).
  - Theo cơ chế intensive throttling của Chrome: tab ẩn > 5 phút và không phát âm thì timer chỉ được gọi khoảng 1 lần/phút, nên chuông có thể trễ tới khoảng 60 giây *(đọc code + đặc tả Chrome)*.
- (b) **Mobile không có cảnh báo khi tắt màn hình.**
  - `new Notification()` không chạy trên Android, ở đó chỉ có `ServiceWorkerRegistration.showNotification`, mà app không có service worker.
  - Không có Wake Lock giữ màn hình sáng.
- (c) **Chữ thông báo tiếng Anh cứng** (`notifications.ts:20-23`). Ngoài ra 5 key i18n không có trong `en.json` nên hiện **key thô**:
  - `timerComponents.taskSelector.taskComplete.*` (`task-selector.tsx:240-269`), ảnh `19-raw-i18n-keys-task-complete.png`, nút còn tràn khỏi dialog.
  - `errors.fieldRequired` (`task-form-modal.tsx:108`).
  - Có 20 chỗ dùng `t('x') || 'fallback'`. Fallback này không bao giờ chạy vì `t()` trả lại chính key (`i18n-context.tsx:110-115`).
- **Sửa:**
  - Đặt `setTimeout` đúng mốc, hoặc chạy tick trong Worker; preload chuông.
  - Thêm Screen Wake Lock (tuỳ chọn) khi đang tập trung.
  - Làm SW tối thiểu + `showNotification` (phase 11).
  - Thêm các key còn thiếu và bỏ hẳn kiểu `|| 'fallback'`.

**P1-7. Giới hạn tạo khách 5 lần/10 phút/IP**

- `lib/auth.ts:29`, giới hạn lưu trong bộ nhớ theo từng instance.
- Wi‑Fi trường học hoặc CGNAT nhà mạng VN: từ khách thứ 6 sẽ không tạo được việc đầu tiên, chỉ thấy toast tiếng Anh chung chung "Failed to create task" (`use-tasks.ts:292`) *(đọc code)*.
- Khi đã sửa P0-2 thì giới hạn này sẽ chặn luôn việc ghi phiên.
- **Sửa:** nâng lên khoảng 30–50, báo riêng khi gặp 429, và cho ghi local làm phương án dự phòng.

**P1-8. YouTube phát qua iframe ẩn, không có player hiển thị**

- `use-youtube-player.ts:58-65` để iframe `display:none` ở −9999px. `FloatingPlayerBar` bị comment ở `app-providers.tsx:95`.
- Rủi ro vi phạm điều khoản YouTube; plan §6 đã yêu cầu "YouTube chỉ ở mini player hiển thị".
- Không có `onError`, chỉ dựa vào timeout 5 giây.
- **Sửa:** dùng mini player hiển thị được (thu gọn được), bắt `onError`.

### P2 — lỗi vừa / UX gãy

| # | Lỗi | Bằng chứng | Sửa |
|---|---|---|---|
| P2-1 | Mix âm môi trường mất sau reload. Chỉ còn master 50%, các slider về 0, `savedAmbientState: []` | Chạy thử: Rain preset → reload → không âm nào bật, không có request media | Lưu mix, khôi phục slider; phát lại ở lần tương tác đầu hoặc khi bấm Start |
| P2-2 | Đóng modal Scene bằng Esc/overlay/Back không hoàn tác preview. Nền chưa lưu (Nebula) vẫn hiện, trong khi `localStorage` vẫn là aurora | Ảnh `20-scene-esc-no-revert.png`; `background-settings-modal.tsx:22-24` | `onOpenChange(false)` gọi `cancel()` |
| P2-3 | Toast tiếng Anh cứng khi UI đang là VI/JA ("Task created successfully"); nút "Close" của sheet cũng tiếng Anh; toast YouTube tiếng Việt cứng; "Mixed Ambient (N sounds)" | Ảnh `18-vi-english-toast.png`; `use-tasks.ts:290-391`, `use-templates.ts:70-85`, `use-youtube-player.ts:281,342,385`, `audio-store.ts:231` | Đưa vào i18n; bỏ toast thành công cho thao tác nhỏ |
| P2-4 | Dock bị cắt khi viewport cao ≤ ~760 px (laptop 1366×768, 1440×900 có thanh trình duyệt) | Đo: viewport 727, đáy dock ở 740 (ảnh `01`); `app-dock.tsx:122` dùng `absolute` trong section `min-h-dvh` | Dock `fixed`, hoặc co đồng hồ theo chiều cao (`clamp` theo `dvh`) |
| P2-5 | Template thực chất là task gắn `is_template`: vẫn hiện trong list và TaskSelector, focus vào được (actual tăng), xoá task là mất luôn template | `use-templates.ts:33-38`, `api/tasks/route.ts:57` *(đọc code)* | Lưu template thành bản sao; lọc template khỏi list |
| P2-6 | Ghi phiên không có idempotency key; `created_at` là lúc upload (phiên offline bị xếp sai ngày); hàng đợi > 24 giờ hoặc > 20 mục bị xoá im lặng | `session-recorder.ts:30-31,85-92`; `session-complete/route.ts` *(đọc code)* | Gửi `clientId` + `endedAt`; unique `(user_id, client_id)`; báo khi phải bỏ |
| P2-7 | Lọc, đếm, tìm chạy phía client trên 1 trang (100 việc); TaskSelector chỉ lấy 50, việc đang focus ngoài 50 dòng đó sẽ tự bị bỏ chọn | `task-management.tsx:37,67-85`, `task-selector.tsx:34-37,64-70` *(đọc code)* | Lọc phía server; lấy việc active theo id |
| P2-8 | Đổi hoặc bỏ chọn việc giữa phiên không ghi đoạn trước: đoạn đó tính cho việc mới, hoặc mất | `task-selector.tsx:77,91-99`, `task-management.tsx:129` *(đọc code)* | Gom về một helper `switchActiveTask` luôn ghi đoạn trước |
| P2-9 | Thoát toàn màn hình bằng Esc: `isFocusMode` vẫn true, dock bị ẩn | `app-dock.tsx:99-116` (không nghe `fullscreenchange`) *(đọc code)* | Nghe `fullscreenchange` |
| P2-10 | Timer settings phải bấm Save; Esc/X huỷ không hỏi; "Reset to defaults" báo toast nhưng không lưu. Các panel khác thì lưu ngay, nên không nhất quán | `timer-settings.tsx:189-193`; ảnh `11` | Lưu ngay như Settings, hoặc hỏi khi còn thay đổi chưa lưu |
| P2-11 | Ảnh nền tự upload (≤ 2 MB) lưu base64 vào `localStorage` **hai lần**, dễ vượt quota; lỗi bị nuốt mà vẫn báo thành công | `use-custom-backgrounds.ts:68`, `background-context.tsx:131` *(đọc code)* | Chuyển sang IndexedDB, resize ảnh, báo lỗi |
| P2-12 | Arcade che kín timer, không hiện giờ nghỉ còn lại, không giới hạn theo giờ nghỉ; hết nghỉ thì phiên tập trung tự chạy trong lúc vẫn đang chơi | Ảnh `17`; `arcade-panel.tsx:312` | Mini timer trong arcade; khi đổi mode thì dừng game và hiện thông báo |
| P2-13 | Khách ẩn danh không export/xoá được qua UI (API thì hỗ trợ); export chỉ JSON, thiếu feedback và cài đặt local | `account-settings.tsx:36-55`, `api/account/export/route.ts:30-46`; chạy thử export: `{account,tasks,sessions,tags}` | Mở export/xoá cho khách; có CSV (xem mục 5) |
| P2-14 | Copy mâu thuẫn: landing, FAQ, guide (3 ngôn ngữ) nói "tập trung tối đa 60 phút, muốn 90 phút thì chạy 2 phiên", nhưng app có preset 90/20 và cho tới 120 | `en/vi/ja.json:1095,1164,1241` vs `timer-presets.ts:4,21` | Sửa copy |
| P2-15 | Góp ý chỉ ghi DB: không email/Slack, không trang admin; rate limit trong bộ nhớ theo instance | `api/feedback/route.ts:9-23` | Gửi mail qua Resend hoặc webhook khi có góp ý |
| P2-16 | Master volume/mute không áp lại sau reload: UI hiện "Muted" nhưng vẫn có tiếng; double-click hoặc kéo slider có thể tạo `Audio` thừa kêu mãi | `audio-manager.ts:211-212,426-445`, `audio-store.ts:664-720` *(đọc code)* | `onRehydrateStorage` → `setVolume/setMute`; giữ map pending theo id |
| P2-17 | Lỗi tải chunk của panel làm skeleton hiện mãi; dialog Scene/Timer thiếu `DialogTitle` (lỗi console) | `panel-loaders.tsx:43`; `background-settings-modal.tsx:26`, `timer-settings-modal.tsx:9` | Error boundary + nút thử lại; thêm `DialogTitle` sr-only |
| P2-18 | `isWebGLAvailable()` tạo WebGL context mỗi lần gọi mà không giải phóng. Picker có 4 preview 3D + đồng hồ + scene, nên mobile có thể chạm trần context | `use-clock-palette.ts:85-92` *(đọc code)* | Cache kết quả + `WEBGL_lose_context` |
| P2-19 | Cả 3 file locale (~228 KB) vào bundle client | `i18n-context.tsx:4-6` | Tải động theo ngôn ngữ |

### P3 — chi tiết

- `sessionCount` không bao giờ reset: hôm sau mở app vẫn thấy "Phiên 4/4" (`timer-store.ts:230`). Nên reset theo ngày.
- "Show 1 completed tasks" sai số nhiều (ảnh `07`).
- Nút "Tập trung" trên task chỉ chọn việc chứ không bắt đầu timer, nhãn dễ hiểu nhầm.
- Không có `?` (bảng phím tắt) dù plan phase 03 có; palette thiếu "Thêm việc", "Đổi scene", "Mute", "Skip", "Toàn màn hình"; ⌘K hiện cả trên Windows (`app-status-bar.tsx:60`).
- Sound panel: nút icon và slider không có tên cho trình đọc màn hình (`audio-sidebar.tsx:124`, các slider `valuetext=""`).
- Cài đặt Giao diện: tiêu đề "Appearance" lặp hai lần; không có lựa chọn sáng/tối/theo hệ thống (plan phase 03).
- Danh sách phiên cắt ở 50 dòng mà không báo; phiên < 30 giây hiện "0 phút".
- Manifest: `start_url: "/timer"` và shortcut `/tasks` đi qua redirect 308 (`public/manifest.json`). Nên dùng `/` và `/?panel=tasks`.
- Code chết:
  - `components/animate-ui/**` (tabs, buttons, ripple, icons)
  - `components/focus/streak-tracker.tsx`
  - `ui/animated-icons`, `animated-list`, `loader`, `radio-group`, `scroll-area`, `table`
  - `config/feature-gate.ts`, `app-shell/open-panel-button.tsx`, `lib/prompts/bro-ai-system.ts`
  - `audio/youtube/floating-player-bar.tsx`, class `YouTubePlayer` trong `audio-manager.ts:99-204`
  - plan mode trong `timer-store.ts`, `showClock`, `fadeInOut`, favorites/recentlyPlayed
- Dependency thừa: `@react-three/drei`.
- `.env` còn key cũ (Supabase, Spotify, `NEXT_PUBLIC_MEGALLM_API_KEY`).
- `public/backgrounds-source` (~175 MB) vẫn nằm trong git.

## 4. Tiến độ plan v2

| Phase | Trạng thái | Đã có | Còn thiếu |
|---|---|---|---|
| 00 Nền móng | **Xong** | Merge, dọn code | Xoá lịch sử git (chờ quyết) |
| 01 Framework | **Xong** | Next 16, React 19, TW4, zustand 5 | — |
| 02 Data & auth | **Xong ở local** | Drizzle/PGlite, Better Auth OTP/Google/ẩn danh, chuyển dữ liệu khách (đã chạy thử) | Neon prod: `.env.local` chỉ có `NEON_DATABASE_URL`, code đọc `DATABASE_URL` (xem câu hỏi); dọn user ẩn danh; ngày theo UTC |
| 03 App một trang | **Xong phần lớn** | Dock, panel, `?panel=`, Back/Esc, ⌘K, redirect 308, landing SSR | `?` phím tắt, palette đủ lệnh, bottom sheet kéo trên mobile, sáng/tối cho stage, dock bị cắt (P2-4) |
| 04 Timer v2 & phiên xác thực | **Một phần (~30%)** | Engine theo deadline, claim chống trùng nhiều tab, outbox thử lại, notification cơ bản, tiêu đề tab | `/api/focus/*` token HMAC + beat + finish, cờ verified, Worker, Media Session, ghi phiên cho khách (P0-2), giải thích phút được tính |
| 05 Đồng hồ 2D/3D | **Một phần (~60%)** | 3 kiểu 2D + 4 kiểu 3D, tải lười, fallback về số | Đồng hồ cát, orb, split-flap có tiếng, hành tinh, cà chua "chín dần", tự về 2D khi máy yếu |
| 06 Âm thanh & scene | **Một phần (~40%)** | 10 scene shader (dừng khi tab ẩn, reduced-motion, context lost), mixer mp3, YouTube | Âm procedural/Tone.js (đang dùng mp3, 9 file câm), scene trọn gói (âm + đồng hồ + màu), crossfade/ducking/Media Session, player YouTube hiển thị; thời tiết đang làm |
| 07 XP/streak/huy chương/league | **Chưa bắt đầu (~5%)** | Streak đếm từ phiên (UTC) | Sổ cái XP, level, freeze, 10 họ huy chương, league tuần, bạn bè, `/bang-xep-hang` |
| 08 Free/Pro & SePay | **Chưa bắt đầu** | — | Entitlement, `/pricing`, webhook SePay, paywall mềm |
| 09 Mascot & AI | **Chưa bắt đầu (~5%)** | 1 ảnh sói tĩnh ở empty state | Trạng thái mascot, trợ lý VietAPI, quota |
| 10 Onboarding/nội dung/SEO | **Một phần (~45%)** | /guide, FAQ JSON-LD, sitemap/robots/llms.txt, 3 ngôn ngữ đủ key | Tour 3 bước, bài `/phuong-phap-pomodoro`, OG riêng từng trang, sửa copy (P2-14) |
| 11 PWA/hiệu năng/QA | **Một phần (~10%)** | Manifest + icon, Vercel Analytics | Serwist/offline, thông báo qua SW, ngân sách JS ≤ 200 kB, Lighthouse, checklist ra mắt |

## 5. Tiện ích còn thiếu — xếp theo giá trị/công sức (dev một người, giữ YAGNI)

| Hạng | Tiện ích | Giá trị | Công | Ghi chú |
|---|---|---|---|---|
| 1 | **Báo hết phiên chắc chắn**: hẹn đúng mốc/Worker, preload chuông, Wake Lock, SW `showNotification` | Rất cao | S–M | Là lời hứa cốt lõi của một app Pomodoro; gộp với P1-6 |
| 2 | **Mục tiêu ngày** (phút hoặc số phiên) + vòng tiến độ trên stage + streak dựa theo mục tiêu | Cao | S | Dữ liệu đã có (sau khi sửa P1-1); làm nền cho phase 07 |
| 3 | **Ghi chú/đánh giá nhanh sau phiên** ("đã làm gì", 1–5 sao) hiện trong lịch sử | Cao | S | Thêm cột `note`, `rating` vào `focus_sessions`; bỏ qua được |
| 4 | **Mini timer Picture-in-Picture** (Document PiP trên Chrome/Edge, dự phòng: canvas → video PiP) | Cao (dùng cạnh IDE, Zoom) | M | Đối thủ (Flocus, Pomofocus) chưa làm tốt; dễ PR |
| 5 | **Đồng bộ cài đặt theo tài khoản** (timer, âm, scene, ngôn ngữ) | Cao với người dùng nhiều máy | M | Bảng `user_settings` jsonb, 1 GET + PATCH debounce; trang chủ đang hứa "keep your data across devices" |
| 6 | **Xuất CSV + báo cáo tuần** (email chủ nhật qua Resend) | Trung bình–cao | S (CSV) / M (email) | CSV có thể để Free, báo cáo tuần để Pro theo plan |
| 7 | **Bảng phím tắt `?`** + palette đủ lệnh | Trung bình | XS | |
| 8 | **Lịch theo tháng** (bấm vào ngày xem các phiên) | Trung bình | S | Heatmap đã có, chỉ cần drill-down |
| 9 | **Offline/PWA đầy đủ** (Serwist, timer chạy offline, hàng đợi ghi) | Trung bình | M | Phase 11 |
| 10 | Việc lặp lại / việc hằng ngày | Trung bình | M | Để sau khi có mục tiêu ngày |
| 11 | Phòng học chung (body-doubling) | Cao nhưng tốn | L | Để sau phase 07 |
| 12 | Extension chặn web, widget hệ điều hành | Thấp với web app | L | **YAGNI**; nếu cần thì liên kết sang extension có sẵn |

## 6. Thứ tự sửa đề xuất

1. **Tuần này (1–2 ngày):**
   - P0-1: thay hoặc ẩn 9 file câm.
   - P0-2 + P1-7: khách luôn được ghi phiên.
   - P1-1: múi giờ/04:00.
   - P1-2: tắt auto-start focus mặc định, dừng khi không có tương tác.
   - P1-3: chỉ +1 khi phiên trọn vẹn.
   - P1-4: hỏi trước khi Reset.
   - P1-6c: thêm key i18n thiếu, bỏ `|| fallback`.
2. **Tiếp theo:**
   - P1-5 + P1-6 a/b: mục Chuông & thông báo, hẹn đúng mốc, Wake Lock.
   - P1-8: player YouTube hiển thị.
   - P2-1, P2-2, P2-3, P2-4.
3. **Sau đó:**
   - Phase 04 (phiên server có token) **trước** phase 07. Không làm XP/league khi phút học còn do client tự khai.
   - Song song làm các tiện ích hạng 2–4.

## 7. Câu hỏi chưa giải quyết

1. Giữ âm mp3 (cần mua hoặc thu thêm 9 file) hay chuyển hẳn sang procedural như plan §6? Câu trả lời quyết định cách sửa P0-1.
2. Có tính "1 pomodoro" cho phiên skip khi đã ≥ 50% không, hay chỉ khi hết giờ tự nhiên?
3. Có chặn arcade khi đang tập trung không?
4. Có đồng ý đổi mặc định auto-start focus thành **tắt** không? Thay đổi này ảnh hưởng người dùng cũ đã có `timer-storage`.
5. Prod: Vercel có biến `DATABASE_URL` không, hay chỉ có `NEON_DATABASE_URL` như `.env.local`? `src/db/index.ts:18-21` sẽ throw trên Vercel nếu thiếu `DATABASE_URL`.
6. Plan §5.6.6 muốn phiên khách được ghi local, nhãn "chưa xác thực". Hiện cách làm là khách ẩn danh trên server. Giữ hướng server (kèm nâng rate limit) hay thêm lớp local?
7. Tài khoản test local `audit-261005@example.com` và dữ liệu test trong `.pglite/` có cần xoá không? Dev server 3001 do audit khởi động: giữ hay tắt?
