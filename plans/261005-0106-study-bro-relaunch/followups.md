# Follow-ups gom từ các batch (xử lý ở batch rà soát cuối hoặc phase 4)

| # | Việc | Nguồn | Gợi ý |
|---|---|---|---|
| 1 | `src/hooks/use-confetti.ts` còn bắn confetti cũ khi Skip ≥ 50% (trùng với SessionCelebration) | 2.4b | Bỏ hook hoặc chỉ giữ cho SessionCelebration |
| 2 | Index `(user_id, mode, created_at)` cho focus sessions | 1B | Migration ở phase 4 (DB hardening) |
| 3 | `AppearanceSettings` cũ trong `general-settings.tsx` là code chết; file có WIP thời tiết | 2.1 | Chỉ xoá khi WIP thời tiết đã commit, hoặc stage hunk riêng |
| 4 | `general-settings.tsx` còn 2 `t() \|\| fallback` (test đang whitelist file này) | 1D | Như #3 |
| 5 | Comment cũ ở `src/stores/audio-store.ts:42` | 1F | Dọn ở phase 4 |
| 6 | Kiểm `/opengraph-image` trên Vercel preview (font đọc từ `assets/fonts`) | 2.2 | Kiểm khi CI build / preview |
| 7 | `card.jpg` (lộ tên/email) còn trong lịch sử git | 2.2 | Cần chủ dự án quyết viết lại lịch sử (force-push) — ghi vào báo cáo cuối |
| 8 | Doodle cà chua trên nền giấy kem giống giọt nước | 2.2 | Vẽ lại hình nhỏ trong SVG doodle |
| 9 | 7 âm môi trường cần bản thu thật (birds, night-crickets, fireplace, library, coffee-shop, coworking, cat-purring); WIP thời tiết đang tham chiếu 3 âm trong số đó → 5 test `weather-mood.test.ts` đỏ | 1D, 1F | Báo chủ dự án / phiên thời tiết |
| 10 | Throttle tab ẩn > 5 phút chưa đo trên trình duyệt thật; Service Worker cho thông báo Android; mở khoá audio iOS | 1C | Phase PWA sau |
| 11 | GA ID prod phải là `G-…` hoặc `GTM-…` sạch (`.env` local đang dính dòng) | 1E | Việc chủ dự án |
| 12 | Reduced-motion chưa kiểm trên trình duyệt thật (chỉ có test) | 2.1, 2.4b | Kiểm ở batch rà soát cuối bằng emulate `prefers-reduced-motion` |
| 13 | Nhóm trong `general-settings` và `weather-settings` cùng IconTile sliders màu butter; cần truyền `icon`/`tone` riêng | 2.5a | Sau khi WIP thời tiết được commit |
| 14 | Heatmap theo `--accent-solid` (bộ màu người dùng) thay vì cứng cà chua — **đã quyết giữ** (mặc định vẫn là cà chua) | 2.5a | Ghi vào design-system doc |
| 15 | Không dùng bí danh icon kiểu `ArmchairIcon`: `modularizeImports` làm build lỗi mà tsc không bắt | 2.6 | Thêm lint rule/kiểm trong CI build (phase 4) |
| 16 | `DialogPanel id="login"` có `overflow-y-auto` cắt viền thẻ; đang tạm `m-1.5` | 2.6 | Sửa gốc ở panel host (rà soát cuối) |
| 17 | Chưa chụp `/terms`, 404 tiếng Nhật, login dark | 2.6 | Rà soát cuối |
| 18 | **P1-8 YouTube vẫn phát qua iframe ẩn** (rủi ro ToS); `floating-player-bar.tsx` bị comment trong `app-providers.tsx`, `youtube-suggestions.tsx` không ai render, còn chuỗi cứng | audit, 2.5b | Batch 2.7: mini player hiển thị, thu gọn được, `onError` |
| 19 | `timer-settings.tsx` + `bell-notifications*` chưa batch nào restyle chủ động (chỉ ăn theo `SettingsSection`) | 2.5a, 2.5b | Batch 2.7 |
| 20 | 2048: ô trống gần trùng màu bàn cờ ở chế độ sáng (màu in-game) | 2.5b | Bỏ qua (luật: không đổi màu trong game) |
