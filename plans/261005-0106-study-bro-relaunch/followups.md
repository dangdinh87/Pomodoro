# Follow-ups gom từ các batch (xử lý ở batch rà soát cuối hoặc phase 4)

| # | Việc | Nguồn | Gợi ý |
|---|---|---|---|
| 1 | `src/hooks/use-confetti.ts` còn bắn confetti cũ khi Skip ≥ 50% (trùng với SessionCelebration) | 2.4b | Bỏ hook hoặc chỉ giữ cho SessionCelebration |
| 2 | Index `(user_id, mode, created_at)` cho focus sessions | 1B | Migration ở phase 4 (DB hardening) |
| 3 | `AppearanceSettings` cũ trong `general-settings.tsx` là code chết; file có WIP thời tiết | 2.1 | Chỉ xoá khi WIP thời tiết đã commit, hoặc stage hunk riêng |
| 4 | `general-settings.tsx` còn 2 `t() \|\| fallback` (test đang whitelist file này) | 1D | Như #3 |
| 5 | Comment cũ ở `src/stores/audio-store.ts:42` | 1F | **Xong (4a)**: dọn 2 comment cũ khi store lên v4 |
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
| 21 | Lệnh ⌘K "Skip" bấm nút theo aria-label (dễ gãy) | 2.4a | **Xong (4a)**: nút và ⌘K cùng gọi `requestTimerSkip()` (`features/timer/lib/request-skip.ts`) |
| 22 | `app-home.tsx` (WIP thời tiết) còn ghi cứng `data-theme="dark"` — vô hại vì selector là `:root[data-theme]` | 2.4a | Dọn khi WIP thời tiết commit |
| 23 | Mobile: thẻ YouTube (sàn 200×200 theo ToS) che nửa dưới thẻ timer | 2.7 | Mobile: đặt player trong luồng trang dưới thẻ timer (không overlay), hoặc trong khay trên tab bar có chừa chỗ — **Xong (visual-fixes, 17bd71e)**: dưới 768px thẻ nằm trong luồng dưới thẻ timer |
| 24 | Thẻ YouTube `z-40` bị panel/dialog `z-50` che khi mở | 2.7 | Cân nhắc: khi panel mở, đưa player vào góc panel hoặc chấp nhận (ghi lý do) — **Xong, quyết giữ z-40 (17bd71e)**: lý do ghi ở design-system 7a |
| 25 | 404 lồng (`/vi/nope`) HTML là vỏ lỗi Next, UI VI dựng sau hydrate | 3a | Kiểm ở preview; noindex nên SEO không ảnh hưởng |
| 26 | File sót chưa xoá được (lệnh `rm` bị chặn quyền): `migrations/`, `supabase_schema.sql`, `fix_sessions_rls.sql`, `public/images/` (png 3,9 MB + `file.svg`); đã grep 0 tham chiếu | 4a | Chủ dự án cho phép rồi chạy `git rm -r migrations supabase_schema.sql fix_sessions_rls.sql public/images` |
| 27 | `.Jules/palette.md` vs `.jules/palette.md` trùng tên trên đĩa không phân biệt hoa thường; chỉ khác 3 dòng trống, sửa bằng `git rm --cached .Jules/palette.md` | 4a | Một commit riêng khi phiên khác đã commit xong `.Jules/palette.md` |
| 28 | `NEXT_PUBLIC_FEATURE_HISTORY` chỉ ẩn UI, không chặn `/api/history` và `/api/stats` (`feature-gate.ts` chưa từng được nối, đã xoá) | 4a | Nối cờ vào 2 route hoặc bỏ cờ |
| 29 | Video gợi ý `04RM0CQPLHQ` trong `src/data/youtube-suggestions.ts` trả 404 thumbnail | 4a | Thay bằng video còn sống — **Xong (1787696)**: thay bằng `rUxyKA_-grg` |
| 30 | Xoá `migrations/`, `supabase_schema.sql`, `fix_sessions_rls.sql`, `public/images/` (0 tham chiếu) — **bị bộ kiểm quyền chặn**, không lách | 4a | Chủ dự án tự chạy `git rm -r …` hoặc cấp quyền |
| 31 | `.Jules/palette.md` vs `.jules/palette.md` va chạm hoa/thường | 4a | `git rm --cached .Jules/palette.md` (chủ dự án quyết) |
| 32 | Video gợi ý YouTube `04RM0CQPLHQ` trả 404 thumbnail | 4a | Kiểm và thay id trong danh sách gợi ý/preset — **Xong (1787696)** |
| 33 | First-load JS `/[lang]` 318 KB gzip, guide/privacy/terms 209 KB gzip (ngân sách mục tiêu ≤ 200 KB cho app, trang nội dung nên < 120 KB) | build-check | Batch perf: phân tích chunk, lazy-load provider/motion/confetti/cmdk, trang nội dung không kéo provider của app |
| 34 | `instrumentation.js.nft.json` vẫn kéo 177 file PGlite (20 MB) | build-check | Instrumentation không import db ở production; import động chỉ khi local |
| 35 | Build in "Better Auth Base URL not set" ×7 | build-check | `baseURL` fallback từ `SITE_URL` khi không có `BETTER_AUTH_URL` |
| 36 | Permissions-Policy ở HEAD là `geolocation=()`; hunk `geolocation=(self)` nằm trong WIP thời tiết | build-check | Commit cùng tính năng thời tiết |
