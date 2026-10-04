# Batch 2.7: mini player YouTube hiển thị + dọn sau rebrand

Ngày 05/10/2026, nhánh `feat/design-system`. Ảnh: `plans/reports/assets-261005-relaunch/2-7-*.png` (không commit).

## Commit

| Hash | Nội dung |
|---|---|
| `9d1e1c5` | #1 Bỏ confetti cũ khi Skip, xoá `use-confetti.ts` |
| `964266a` | #8 Cà chua trên nền giấy kem vẽ lại |
| `387b5c4` | Việc thêm: thẻ timer vừa một màn hình thấp (biến `--stage-*`, khung SSR đổi cùng) |
| `68e98cf` | #16 Hộp đăng nhập hết bị cắt viền/bóng |
| `2679062` | #18 / P1-8 Mini player YouTube hiển thị, `onError`, gỡ iframe ẩn và code chết |
| `5e0f55d` | Mini player cách thanh tab/dock ~10px |
| `e78909f` | #19 Cài đặt hẹn giờ + chuông theo Sticker pop |
| `c856352` | `docs/design-system.md` (mục 7a mới, gỡ 2 việc nợ đã xong) |

## 1. Mini player YouTube (P1-8, #18)

- **Kiến trúc**: `stores/youtube-player-store.ts` (trạng thái dùng chung) + `lib/audio/youtube-controller.ts` (một player duy nhất, đẩy trạng thái từ sự kiện IFrame API, **không còn polling 800ms**) + `hooks/use-youtube-player.ts` (mặt tiền cho panel Âm thanh: `play`, `togglePlayback`, `stopPlayback`, `playerState`) + `components/audio/youtube/youtube-mini-player.tsx` (gắn một lần trong `AppProviders`, trong `MotionConfig`).
- **Hiển thị**: iframe chỉ được tạo trong `#youtube-player-slot` của thẻ. Không có container ẩn/ngoài màn hình; không phát được nếu thẻ không có trên trang (báo lỗi `playerFailed`, không rơi về iframe ẩn). Đóng = `stopVideo` + `destroy` + xoá iframe, nên lúc không phát thì **không có iframe nào**.
- **Điều khiển**: phát/tạm dừng, trước/sau (chỉ playlist; `nextVideo`/`previousVideo`), tắt tiếng + thanh âm lượng (ghi thẳng vào âm lượng chung `audio-store`, player nghe lại qua `subscribe` nên Âm thanh nền và YouTube cùng một núm), thu gọn/mở rộng, đóng (dừng hẳn, xoá `currentlyPlaying`). Tiêu đề lấy từ oEmbed như cũ.
- **Lỗi** (`onError`): 100 → "video đã bị gỡ/riêng tư"; 101/150 → "chủ video không cho phát ngoài YouTube"; còn lại → `cannotPlay`. Toast i18n 3 ngôn ngữ, dừng và xoá player. Đã thử thật: `jfKfPfyJRdk` và `5qap5aO4i9A` trả 101/150 trong Chrome của MCP, toast VI hiện đúng ("Chủ video không cho phát ngoài YouTube. Bạn thử video khác nhé.").
- **Quyết định ToS** (cần chủ dự án biết):
  1. Tài liệu IFrame API ghi viewport **≥ 200×200 px** (khuyến nghị 480×270 cho 16:9). Đề bài ghi 200×112, nên dùng **200×200** làm sàn cho cả hai trạng thái (vẫn thoả "≥ 200×112"). Mở rộng: 16:9 rộng tối đa 416px (điện thoại 368px). Thu gọn: iframe đúng 200×200, thẻ rộng 205px. Đã đo trên trình duyệt: iframe 200×200 thu gọn, 411×226 mở rộng.
  2. **Thu gọn không tạm dừng**, vì thu gọn vẫn giữ video ở sàn 200×200 và không bị che. Thu gọn chỉ bỏ tiêu đề, âm lượng. Slot không có border/padding riêng (border-box sẽ ăn mất 2×2.5px của 200px; đã bắt được lỗi này khi đo, có test).
  3. `z-40`: trên dock, dưới panel/dialog `z-50`. Hệ quả: khi mở Sheet Âm thanh trên điện thoại (full rộng) thẻ nằm dưới nó. Panel do người dùng mở và đóng lại được, nên coi là chấp nhận; nếu muốn tuyệt đối thì nâng z-index nhưng thẻ sẽ đè lên nội dung panel.
  4. Bỏ timeout 5 giây "không phát được thì dừng" (lỗi thật giờ đến từ `onError`). Trình duyệt chặn autoplay thì player ở trạng thái "tạm dừng", người dùng bấm play ngay trên thẻ.
  5. Video kết thúc = "tạm dừng" (bấm play phát lại), không tự đóng thẻ.
- **Chrome dimming**: `[data-mini-player]` mờ 50% khi timer chạy + chuột đứng yên (`html[data-chrome-idle]`), vẫn nhìn thấy và bấm được (đo: opacity 1 → 0.5, pointer-events auto). Không dùng `data-chrome` vì nó ẩn hẳn.
- **Reduced motion**: lối vào chỉ trượt (`y`), `MotionConfig reducedMotion="user"` tắt; mờ dần dùng CSS nên bị luật toàn cục tắt.
- **Xoá**: `floating-player-bar.tsx`, `youtube-suggestions.tsx` (đã grep: không ai render), `YouTubePlayer` + `parseYouTubeUrl` + `playYouTube` trong `audio-manager.ts` (`AudioManager.play` với type youtube giờ trả `false`), `metadata` của `AudioSource`, đoạn dọn iframe YouTube trong `AudioCleanupProvider` và `globalAudioCleanup`, chuỗi cứng tiếng Việt/Anh của mấy file đó.
- **Test** (`youtube-mini-player.test.tsx`, 12 ca; `youtube-utils.test.ts`, 6 ca): iframe nằm trong thẻ hiển thị, mọi ancestor không `hidden`/`display:none`/`-9999px`; không có `#youtube-global-container`; sàn 200×200 ở cả hai trạng thái, slot không border/padding; thu gọn không đổi iframe và không pause; không có thẻ thì không tạo iframe; lỗi 101 → toast + `stopped` + iframe/thẻ biến mất + `currentlyPlaying` sạch; đóng → `stopVideo` + `destroy`, không toast; phát lại sau khi đóng; play/pause; theo trạng thái khi bấm pause ngay trên YouTube; prev/next chỉ với playlist (`listType: 'playlist'`); theo âm lượng/mute của audio store. Bảng mã lỗi test theo từng mã.
- **Xác minh trên :3001** (ảnh `2-7-youtube-mini-*`): video Rick Astley `dQw4w9WgXcQ` tải trong thẻ, giao diện YouTube thật, tiêu đề oEmbed, thời lượng 3:34; desktop mở rộng/thu gọn, điện thoại VI mở rộng/thu gọn, tối + mờ. **Không phát ra hình/tiếng được**: trong Chrome của MCP player đứng ở trạng thái 3 (đệm) ở 0:00, không phải do code (iframe và API chạy, `onError` hoạt động); chưa kiểm tiếng thật.

## 2. Cài đặt hẹn giờ + chuông (#19)

Không đổi hành vi (1C, id chuông 1F; 39 test settings giữ nguyên, kể cả vai trò radio của cỡ đồng hồ). Đổi: `FilterChip`/`FilterChipGroup` cho mẫu có sẵn và cỡ đồng hồ (radio giữ `role="radio"`, bỏ `aria-pressed`); ô số có viền `--control-edge` + bóng nhỏ + bóng accent khi focus (như Select/Input), chữ số Baloo; mỗi nhóm một ô icon riêng (Thời lượng mint, Tuỳ chọn butter, Chuông peach, Đồng hồ lilac; xoá việc "mọi nhóm cùng ô sliders" của #13 cho phần này); đầu hộp thoại có ô icon mint, nút Đặt lại `secondary`, nút đóng tròn có viền; Âm lượng chuông dùng chip giá trị như âm lượng chung; trạng thái thông báo là `Badge`; nhãn ô số được xuống dòng (VI "Số phiên trước khi nghỉ dài") và ô thẳng hàng đáy. Đã chụp sáng, tối, VI, JA, 390px.

## 3. Confetti (#1)

Xoá `use-confetti.ts`, bỏ cuộc gọi trong `timer-controls.tsx`; test đỏ trước (Skip 60% gọi `canvas-confetti` 2 lần), xanh sau. Ăn mừng vẫn chỉ do `SessionCelebration`. Bỏ 3 mock cũ trong test.

## 4. Doodle cà chua (#8)

Cà chua tròn dẹt 16×13.6 + đài hình sao 5 cánh xanh + cuống, sáng dùng lá `#2E9B5E`, tối dùng bạc hà `#7BDCB5`. Độ mờ giữ nguyên (sáng 0.10, tối 0.07; comment cũ ghi ~6% nhưng giá trị thật của nhóm cà chua là 0.10, các hình khác 0.06/0.05). Ảnh phóng 4× sáng/tối.

## 5. Hộp đăng nhập bị cắt (#16)

`DialogPanel` có prop `bare` (vỏ trong suốt) thêm `p-2`: viền 2.5px và bóng 6px nằm trong padding box nên `overflow-y-auto` không cắt; bỏ `m-1.5` tạm trong `login-form.tsx`. Panel là chính một thẻ (Cài đặt, Góp ý, Arcade) giữ `p-0` và tràn mép. Test mới `panel-host.test.tsx` (đỏ trước). 2.4a đã commit nên `panel-host.tsx` sạch.

## 6. Thẻ timer vừa một màn hình thấp (việc thêm)

Section quanh thẻ chừa 160px (`pt-16` + `pb-24`) nên thẻ ≤ `100dvh - 160px`. `.stage-card` trong `globals.css`: `--stage-t = clamp(0, tan(atan2(100dvh - 640px, 180px)), 1)` (1 khi cao ≥ 820px, 0 ở 640px; `tan(atan2())` là cách chia hai độ dài trong calc). Các biến co theo: Tomo 72→52, khoảng dưới Tomo 16→8, khoảng dưới chip 20→8, chữ số 160→108, các khe 16→8, đệm thẻ 32→20 (từ `sm`), nút chính 56→48; gợi ý phím ẩn khi cao ≤ 700px. Thẻ thật và `app-home-skeleton.tsx` đọc **cùng** biến (skeleton viết lại cùng lồng nhau với thẻ thật); `stage-layout.test.ts` kiểm mọi biến được khai và skeleton đọc đủ biến của thẻ thật.

| Cỡ | Thẻ cao (trước → sau) | Thẻ / dock | CLS |
|---|---|---|---|
| 1366×657 | 639 → 460 | thẻ 83→543, dock 589 | 0 |
| 1366×768 | 639 → 593 | thẻ →664, dock 700 | 0 |
| 1440×789 | 639 → 612 | thẻ →685, dock 721 | 0 |
| 1440×900 | 639 → 641 (+2: gộp hai khe 14/16 thành một) | chữ số 160px như cũ | 0 |
| 390×664 | 528 (tràn 24px) → 465 | thẻ →549, khay tab 570 | 0 |

Section luôn đúng bằng viewport (không còn cuộn 143px ở 1366×657). CLS đo bằng `PerformanceObserver` (`layout-shift`, không có shift nào) từ HTML SSR sang app. `DigitalClock` đọc `--stage-digits` (fallback 160px khi không có thẻ, ví dụ thư viện kiểu đồng hồ trong cài đặt). Các kiểu đồng hồ khác (analog, flip, 3D) vốn co theo `vmin`/`vh`, chưa chụp ở 657px.

## Chưa làm / để lại

- **⌘K "Skip" gọi store action** (#21): không tầm thường. Logic bỏ qua nằm trong `TimerControls` (cần `useSessionRecorder`, hộp xác nhận cục bộ, `playAlarm`); tách ra là một việc riêng. `pressSkipButton` còn nguyên.
- **Điện thoại**: thẻ YouTube (kể cả thu gọn, 200×200 + thanh nút ≈ 305px cao) che nửa dưới thẻ timer ở 390px, gồm nửa trái nút Bắt đầu. Sàn 200×200 của YouTube không cho nhỏ hơn. Gợi ý cho phase sau: cho kéo thẻ, hoặc tự dời lên góc trên khi timer đang chạy. Đã ghi vào mục nợ của `docs/design-system.md`.
- Nút Đặt lại trong cài đặt hẹn giờ nhận focus đầu tiên khi mở (vòng focus đỏ ở ảnh): hành vi cũ của Radix, chưa đổi (nên `onOpenAutoFocus` như panel Âm thanh nếu muốn).
- #13 còn lại phần `general-settings`/`weather-settings` (chờ WIP thời tiết).
- Chưa kiểm tiếng YouTube thật và độ trễ `onError` ngoài mã 100/101/150.

## Kiểm tra cuối

- `pnpm type-check`: chỉ còn 6 lỗi trong `.next/types/validator.ts` (type sinh ra tham chiếu route `(main)`/`(landing)` mà phiên 3a vừa chuyển sang `[lang]`); không có lỗi ở code.
- `pnpm lint`: 0 lỗi (51 cảnh báo cũ). Lần chạy đầu thấy 2 lỗi do file của phiên khác đang sửa dở, chạy lại hết.
- `pnpm test`: 1292 pass; 5 fail đều ở `src/lib/weather/weather-mood.test.ts` (WIP thời tiết).
- `pnpm i18n:check`: 1361 khoá OK.
- Một lần chạy riêng `youtube-mini-player.test.tsx` lúc máy rất tải (72s) có 1 ca đỏ, chạy lại và trong suite đầy đủ đều xanh; chưa tìm ra ca nào (nghi do thời gian chờ).

## Ghi chú vận hành

- Trong lúc làm, dev server :3001 vài lần trả 404/500 và hiện khoá i18n thô vì phiên 3a đang chuyển route/i18n; ảnh cuối chụp sau khi nó ổn. Ảnh `2-7-timer-settings-before.png` (trước khi sửa) vẫn có khoá thô vì chụp lúc đó.
- Tôi chạy nhầm một lần `git reset -q` (chỉ index, không đụng working tree) lúc phiên 3a đang di chuyển file; nếu họ có rename đã stage thì giờ hiện thành `D` + `??`, nội dung không mất.
