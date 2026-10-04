# Batch 1E: sửa lỗi chức năng P2 (2026-10-05)

Nhánh `feat/design-system`, làm tuần tự, mỗi task một commit qua `commit-own.py`. Không đụng `src/components/ui/**`, sound catalog/presets hay phần thời tiết. Locale JSON và `next.config.ts` chỉ stage hunk của mình.

## Kết quả theo task

| # | Task | Commit | Nội dung |
|---|---|---|---|
| 1 | Siết tự nối pha | `c2223f6` | Bỏ `MAX_IDLE_PHASES`/`idlePhases`. `mayAutoChain(finished, attendedSinceFocusStart)`: focus luôn nối sang nghỉ; nghỉ ngắn chỉ nối sang focus nếu có tương tác từ lúc focus trước **bắt đầu**; nghỉ dài không bao giờ nối. Một focus + nghỉ không ai chạm: dừng ở màn bắt đầu, không ghi thêm. Cờ "có người" reset khi một focus mới bắt đầu (tự chạy hoặc bấm tay, nhận ra bằng `timeLeft >= workDuration`); resume giữa phiên không reset. Bấm Skip ở nghỉ dài vẫn không tự chạy. |
| 2 | Mix âm nền (P2-1, P2-16) | `5789149` | Lưu `activeAmbientSounds` (id + volume) và `ambientPaused`; `merge` lọc âm không còn trong catalog, volume 1..100. Sau reload slider hiện lại ngay, `ambientRestore='autoplay'`; `useAmbientRestore` (gắn trong `AudioCleanupProvider`) phát ở `pointerdown`/`keydown` đầu tiên hoặc khi timer bắt đầu, tối đa 3 lần thử rồi bỏ các âm không phát được. Mix đã pause thì chờ nút play (`togglePlayPause` bắt đầu mix). `onRehydrateStorage` gọi `setVolume/setMute`. `AudioManager`: map `pendingAmbient` theo id (double click/kéo slider dùng chung một lần phát), cờ huỷ khi stop lúc đang tải, dọn `Audio` khi `play()` bị từ chối. `playAmbient` của store đọc mix SAU `await` (không mất/lặp mục). Nhãn "Mixed Ambient (N sounds)" thành `count` + `audio.ambient.mixedLabel` en/vi/ja và helper `playingTitle`. |
| 3 | Scene Esc/overlay/Back (P2-2, P2-17) | `c7a9012` | `BackgroundSettings` nhận `ref` với `cancel()`; modal gọi nó khi `onOpenChange(false)`. Thêm hoàn tác khi unmount nếu chưa Lưu/Huỷ (bắt cả Back, đóng panel từ ngoài). `DialogTitle` sr-only + `aria-describedby={undefined}` cho cả modal scene và timer. |
| 4 | Esc thoát toàn màn hình (P2-9) | `8a603c7` | `app-dock` nghe `fullscreenchange`, `isFocusMode = Boolean(document.fullscreenElement)`; `isFullscreen` suy ra từ `isFocusMode`; đồng bộ lúc mount. Nút bấm chỉ gọi request/exit, state do sự kiện cập nhật. |
| 5 | Panel lỗi chunk (P2-17) | `f196b77` | `lazyPanel` có state `failed` + `PanelError` (nút "Try again" dùng `errors.boundary.retry`) và `PanelBoundary` bắt lỗi render của panel. Key mới `shell.panelError.{title,description}`. `preloadPanelsWhenIdle` bỏ qua khi `navigator.connection.saveData` (hover/focus vẫn tải khi cần). |
| 6 | `isWebGLAvailable` (P2-18) | `baf444d` | Cache kết quả cả vòng đời trang, `WEBGL_lose_context.loseContext()` ngay sau khi dò (lỗi khi nhả không làm kết quả thành false). |
| 7 | Ảnh nền tự tải (P2-11) | `e254f21` | `lib/custom-background/image-processing.ts` (kiểm tra, `fitWithin`, nén canvas WebP, rơi về JPEG, 3 mức chất lượng, trần 3 MB), `image-store.ts` (IndexedDB mỏng, trả `ok/quota/unavailable`; danh sách tên nhỏ trong localStorage). Nền lưu `custom:<id>` thay vì base64 (hết lưu hai lần). `useCustomBackgrounds` viết lại (lưu IDB trước, rồi mới xoá ảnh cũ; ghi danh sách lỗi thì rollback). Hết dung lượng báo toast `customImages.storageFull` (en/vi/ja), không còn "thành công giả". `BackgroundRenderer` đọc blob qua `useCustomImageUrl`, ảnh mất thì tự về nền mặc định. Migration một lần các ảnh base64 cũ sang IDB khi `BackgroundProvider` khởi tạo (lỗi thì giữ nguyên bản cũ). |
| 8 | Outbox bỏ phiên (P2-6) | `2a1170f` | `updateQueue` đếm số mục bị loại do > 24 giờ hoặc > 20 mục, `onSessionsDropped(listener)`; hook `useOutboxDropNotice` (gắn trong `useTimerEngine`, trước effect flush) hiện một toast `timer.outbox.dropped` (id cố định). Cooldown 10 phút để hàng đợi luôn đầy không toast mỗi phiên; drop xảy ra trước khi có listener thì giao lại khi đăng ký. |
| 9 | Redirect + error | `c776d1c` | `/leaderboard`, `/chat` → `/` (308) cạnh `/timer`, `/tasks`; `(main)/error.tsx` `homeHref="/"` (nhãn vẫn "Go to timer" vì `/` là timer). Test không có chuỗi redirect. |
| 10 | GA (P2-7) | `52dbfbd` | `ga-id.ts` (`/^(G|GTM)-[A-Z0-9]+$/`, trim). `ga.tsx`: `GoogleAnalytics` render theo loại ID: `G-` gtag.js + `config {send_page_view:false}`; `GTM-` snippet GTM chuẩn + `<noscript><iframe>`; ID sai thì không render gì. `GATracking` gửi `page_view` một lần mỗi route (gtag: chờ `window.gtag` tối đa 10 giây; GTM: container tự báo lần tải đầu, route sau đẩy `dataLayer` event `page_view`). Layout gốc chỉ còn `<GoogleAnalytics />`; tracker gỡ khỏi `(main)/layout.tsx` (giờ chạy toàn cục, kể cả guide/privacy/terms vì gtag không còn tự gửi). `.env.example` có chú thích. |

## Quyết định tự chọn

- **Task 1:** nghỉ sau focus vắng người vẫn tự chạy (chỉ focus kế bị chặn). Bấm Start không tính là "có người" cho chu kỳ đó; di chuột/phím sau đó thì có. Người bỏ đi sau Start: focus 1 + nghỉ 1 rồi dừng (ghi 2 mục, không ghi thêm).
- **Task 2:** mix được khôi phục hiện slider ngay nhưng im lặng cho tới cử chỉ đầu (vài trăm ms trong thực tế). Âm do tính năng thời tiết tự bật cũng nằm trong mix được lưu (không phân biệt).
- **Task 7:** giữ trần file đầu vào 2 MB (không đổi chữ "2 MB" ở 3 ngôn ngữ). `fake-indexeddb` chưa cài nên tự viết fake IDB nhỏ (kiểu event handler) để test lớp mỏng, gồm cả lỗi quota. Ảnh dán từ URL vẫn chỉ lưu link (không tải về).
- **Task 8:** chỉ báo mất do tuổi/đầy hàng đợi, đúng yêu cầu. Mục bị bỏ vì thử lại 5 lần hoặc bị server từ chối vĩnh viễn chưa báo.
- **Task 10:** `.env` local đang bị dính dòng (`GTM-…GROQ_API_KEY=…`) nên giờ **không có GA** ở local (đúng mục đích validate). Production cần ID sạch.

## Test

Mới/đổi: `auto-chain.test.ts`, `use-timer-engine.test.tsx` (chuỗi tự chạy viết lại, + resume giữa phiên), `audio-store-restore.test.ts`, `audio-manager.test.ts`, `use-ambient-restore.test.tsx`, `playing-title.test.ts`, `background-settings-modal.test.tsx`, `timer-settings-modal.test.tsx`, `app-dock.test.tsx` (+4), `panel-loaders.test.tsx`, `use-clock-palette.test.ts`, `image-processing.test.ts`, `image-store.test.ts`, `use-custom-backgrounds.test.tsx`, `use-custom-image-url.test.tsx`, `background-renderer.test.tsx`, `session-recorder-drops.test.ts`, `use-outbox-drop-notice.test.tsx`, `next-redirects.test.ts`, `(main)/error.test.tsx`, `ga-id.test.ts`, `ga.test.tsx`.

Cổng cuối:
- `pnpm type-check` sạch.
- `pnpm lint` 0 lỗi / 89 warning (trước batch 93).
- `pnpm i18n:check` OK (1276 key).
- `pnpm test`: 96 file xanh, **1 file đỏ ngoài phạm vi**: `src/lib/weather/weather-mood.test.ts` (5 test, "points to a real scene and real ambient sounds"): preset thời tiết (WIP phiên khác) tham chiếu âm đã bị ẩn khỏi `soundCatalog.ambient` bởi commit `c416c7b` của batch 1D. 920/925 test xanh.

## Kiểm chạy thật (dev :3001, Chrome DevTools, context `relaunch-1e`)

- `curl -sI` `/leaderboard` và `/chat`: `308 Permanent Redirect`, `location: /`; trình duyệt điều hướng về `/`.
- Mix: bấm preset Rain, `audio-storage-v2` có `light-rain 60`, `thunder 20`. Reload: hai slider về 60 và 20, **chưa có lệnh `play()` nào** trước cử chỉ; sau `pointerdown` đầu tiên phát đúng 2 lần (volume 0.3 và 0.1 = âm lượng riêng × master 50%). Đặt `isMuted:true` + master 30 rồi reload: các âm khởi động với volume 0.
- Scene: chọn Nebula (có canvas, localStorage vẫn là mặc định), nhấn Esc: dialog đóng, canvas biến mất, nền về mặc định.
- Modal scene và timer: `aria-labelledby` trỏ tới tiêu đề ("Scene", "Timer settings"), không có `aria-describedby`; mở/đóng không có error/warn console (chỉ còn issue cũ "form field should have id" và CSP report-only của Vercel Analytics).
- Với `.env` hiện tại không có script GA nào trên trang.
- Ảnh (không commit): `plans/reports/assets-261005-relaunch/1e-mix-restored-before-gesture.png`, `1e-scene-preview-nebula.png`, `1e-scene-esc-reverted.png`.

## Chưa kiểm chạy thật / hạn chế

- Thoát toàn màn hình bằng Esc thật (Chrome headless không vào fullscreen), lỗi chunk panel, tải ảnh thật qua file input + quota thật, `saveData`, GA với ID hợp lệ: chỉ có test đơn vị.
- Chrome của DevTools không chặn autoplay, nên nhánh "trình duyệt từ chối lần đầu" chỉ được test bằng mock.
- Không cập nhật bảng trạng thái trong `plan.md` (file đang có sửa đổi chưa commit của phiên khác).
- Chưa có cơ chế đồng bộ mix giữa các tab.

## Câu hỏi còn mở

- Production đặt `NEXT_PUBLIC_GA_ID` là `G-…` hay `GTM-…`? Nếu GTM, CSP Report-Only chỉ cho `script-src` googletagmanager.com; tag bên trong container có thể cần thêm origin khi chuyển sang enforce.
- Có muốn nâng trần ảnh tải lên 2 MB lên cao hơn (ảnh điện thoại thường 3-8 MB) giờ khi đã nén? Cần đổi chữ "2 MB" ở 3 ngôn ngữ.
