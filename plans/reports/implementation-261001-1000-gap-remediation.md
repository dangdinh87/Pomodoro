# Báo cáo triển khai: khắc phục lỗ hổng (Phase 01, 03, 04, 06 + một phần 05, 07)

- **Ngày:** 2026-10-01.
- **Nhánh:** `fix/security-and-quality-gates`, tách từ `master` @ `f3031c9`, chạy trong worktree riêng (`../Pomodoro-gap-remediation`).
- **Đầu vào:** [review-261001-0847-project-gap-analysis.md](review-261001-0847-project-gap-analysis.md) và [plan](../261001-0847-project-gap-remediation/plan.md).
- **Cách làm:**
  - Main agent và 5 agent triển khai chia nhau theo quyền sở hữu file, không chồng lên nhau.
  - 6 reviewer đọc độc lập, mọi phát hiện High và Critical đều đã sửa.
  - Phối hợp với session `feat/design-system`: nhánh đó giữ phần visual, nhánh này làm phần UX và chức năng.

## Kết quả kiểm chứng (chạy thật)

| Check | Trước | Sau |
|---|---|---|
| `pnpm type-check` | 129 lỗi (20 ở code chạy) | **0** |
| `pnpm lint` | exit 1, 3 error | **exit 0**, 189 warning (CI chặn ở mức 189, chỉ được giảm) |
| `pnpm test` | 1 test fail, 5 file test | **29 suite / 227 test pass** |
| Coverage (toàn `src`) | ~2.8% thật | **14.3%**. Ngưỡng CI: 14/13/11/14 |
| `pnpm i18n:check` | ja thiếu 10 key | **1159 key khớp** trên en/vi/ja |
| `ignoreBuildErrors` / `ignoreDuringBuilds` | `true` | **đã gỡ** |
| CI | không có | GitHub Actions: type-check, lint, i18n, test+coverage, build. Có dependabot. |
| `pnpm build` | n/a | **pass**, không còn cờ ignore (xem mục "Build & smoke test") |

## Phase 01: Bảo mật

| Lỗ hổng | Cách sửa | Test |
|---|---|---|
| Open redirect qua `/\evil.com` và dot-segment (`/.//evil.com`, `/a/..//evil.com`, `/%2e//`) ở auth callback, login, signup | `src/lib/safe-redirect.ts`: so origin rồi chặn path bắt đầu `//` hoặc `/\` | ✓ |
| `/api/chat` không giới hạn chi phí | Hai lớp quota/giờ (in-memory chống burst + đếm message trong DB). Message cuối phải là user. Cap 20 message, 24k ký tự lịch sử (user 4k, assistant 8k), `max_tokens` 2048. Lỗi upstream được che. Kiểm quyền sở hữu `conversationId`. | ✓ |
| `session-complete` gian lận được leaderboard, NaN | Schema: mode thuộc enum, 1 ≤ `durationSec` ≤ 4h. Tổng 24h cuộn không vượt 24h. Chỉ nhận task của chính user. | ✓ |
| PostgREST filter injection qua `q`, `tag`, `dateField`; `limit`/`page` không giới hạn | Lọc ký tự `,()"\%*`. `tag` bỏ `,{}"\`. Whitelist `dateField`. Clamp `limit` ≤ 100, `page` ≤ 10k. | ✓ |
| `parent_task_id` của user khác, vòng A→B→A | Check UUID, quyền sở hữu, phát hiện vòng (tối đa 10 cấp). PATCH/DELETE task không tồn tại trả 404. | ✓ |
| Feedback spam / giả `user_id` | Schema (độ dài, email, rating nguyên). Rate limit theo IP. `user_id` lấy từ session. | ✓ |
| Lộ `error.message` nội bộ | Trả thông báo chung ở tasks, tags, conversations, messages, chat | ✓ |
| Tags, conversations, messages không validate | Kiểm độ dài, kiểu. `model` phải nằm trong whitelist. | ✓ |
| Leaderboard: tên public lấy từ email, `limit` vô hạn | Tên mặc định `User` (cắt 50 ký tự), avatar chỉ nhận https. `limit` ≤ 100. Chỉ select các cột cần. | — |
| Không có security headers. Image proxy mở (`**`) | `X-Frame-Options DENY`, nosniff, Referrer-Policy, Permissions-Policy. CSP ở chế độ **Report-Only**. `remotePatterns` chỉ gồm Google avatar, YouTube, Supabase. | — |
| `API_ROUTE_TOKEN` fail-open (code chết) | Xoá | — |
| `.env.example` sai, có `NEXT_PUBLIC_MEGALLM_API_KEY` | Viết lại theo các biến thật | — |

**Chuyển sang Phase 02 (cần DB):**
- Cần một bảng đếm usage cho chat bền vững. Hiện xoá conversation sẽ làm giảm số đếm trong DB; lớp in-memory chỉ chặn được một phần.
- Kiểm tổng 24h và insert session cần nằm trong cùng một RPC có lock. Hiện POST song song vẫn lọt qua.

## Phase 03: Ghi dữ liệu timer/tasks đúng

- **Duration:** lưu `lastSessionTimeLeft` vào persist (version 1, có `migrate`/`merge`, bỏ `@ts-ignore`). Duration ghi đúng sau khi reload.
- **Hết giờ khi tab đóng:**
  - Trong 15 phút: ghi phiên và chuyển phase.
  - Quá 15 phút: chuyển phase im lặng, không cộng thống kê.
  - Không còn kẹt ở 00:00.
- **Nhiều tab:** claim một lần cho mỗi completion qua localStorage. Đồng bộ trạng thái qua `storage` event, không bị ping-pong.
- **Ghi phiên tin cậy** (`src/lib/timer/session-recorder.ts`):
  - Outbox: ghi vào queue trước, gửi với `keepalive`, nhận ack mới xoá.
  - Mỗi item gắn `userId`, retry khi gặp 5xx/401/mạng, tối đa 5 lần, queue tối đa 24h/20 item.
  - Không ghi đè queue khi đang flush. Guest thì bỏ qua.
- **Optimistic update cho tasks:** sửa sai query key, rollback mọi snapshot. Toast thành công chuyển sang `onSuccess`. Không refetch đè khi còn mutation khác. `total` cập nhật lạc quan.
- **Âm báo:** helper `playAlarm` dùng chung (`/sounds/alarm.mp3` không tồn tại). Notification khi tab ẩn, chỉ xin quyền khi user bấm Start.

**Hoãn:**
- Idempotency phía server (cần cột `client_session_id`).
- Partial session vẫn cộng `actual_pomodoros` (cần sửa RPC ở Phase 02).
- Plan mode trong engine (hiện không có UI dùng).

## Phase 04: Quality gates

- Thêm `@types/jest`. tsconfig dùng es2020.
- Jest:
  - bỏ qua `.kilo` và `.claude` (trước đây test bị chạy 2 lần);
  - mock `next/navigation`;
  - tính coverage trên toàn `src`.
- ESLint thêm `next/typescript`. Sửa 20 lỗi type. Xoá 2 file chết là `focus-mode.tsx` và `layout/navigation.tsx`.

## Phase 06: UX/chức năng (lớp visual thuộc `feat/design-system`)

- **Feature flags** (`src/config/feature-flags.ts`, `feature-gate.ts`):
  - `chat` và `leaderboard` mặc định tắt: ẩn khỏi nav, trang trả 404, toàn bộ API liên quan trả 404.
  - `history` mặc định bật.
  - GlobalChat được dynamic import.
- **Trang bị bỏ:** `/progress` (placeholder) và `/focus` redirect 301 về `/history`; streak chuyển sang History.
- **Tài khoản** (tab Account trong Settings):
  - Đổi mật khẩu: phải nhập mật khẩu hiện tại; tài khoản OAuth bị ẩn form.
  - Export JSON: rate limit 3/giờ, có kiểm Origin.
  - Xoá tài khoản:
    - Xác nhận bằng email. Yêu cầu `Content-Type: application/json` và Origin khớp host.
    - Dùng service role, báo rõ khi xoá được một phần.
    - Không có `SUPABASE_SERVICE_ROLE_KEY` thì trả 503.
- **Error boundary:**
  - `error.tsx` cho `(main)`, `(landing)`, `(auth)`, cùng `global-error.tsx`.
  - `loading.tsx` cho tasks và history.
- **SEO:**
  - Bỏ canonical gốc. Mỗi trang được index (`/`, `/timer`, `/guide`, `/privacy`, `/terms`) có canonical và `og:url` riêng qua `buildPageMetadata`.
  - Bỏ hreflang giả.
  - Sitemap gồm 5 trang. Robots chỉ chặn `/api/` và `/auth/`; trang app và auth dùng `noindex`.
  - Copy SEO không còn quảng cáo các tính năng đang tắt.
- **i18n SSR:**
  - Cookie `app.lang`, middleware negotiate từ `Accept-Language`.
  - `<html lang>` và `server-translations` render server đúng ngôn ngữ (landing giờ là trang dynamic).
  - Bổ sung 10 key `ja`. Localize các chuỗi còn hardcode. Thêm script `i18n:check` chạy trong CI.
- **a11y:**
  - `MotionConfig reducedMotion="user"`, kèm khối CSS reduced-motion (vẫn giữ spinner).
  - `TimerLiveAnnouncer` báo start, pause, hết phase, mỗi 5 phút và lúc còn 1 phút; xử lý đúng số ít/số nhiều.
  - Digital clock dùng `role="timer"`, không đọc từng giây.
  - Skip link.
- **PWA:**
  - Có icon 192/512, maskable và apple-touch.
  - Manifest Study Bro, `start_url` là `/timer`.
  - Xoá `sw.js` hỏng (không có service worker, chỉ cài đặt được).

## Phase 05 / 07 (một phần)

- Viết lại README và `.env.example` theo stack thật.
- Cập nhật `llms.txt`.
- Đã chốt quyết định về các tính năng ẩn (xem plan.md).
- Việc dọn dependency không dùng, gộp `framer-motion` vào `motion`, xoá file rác: để lại sau khi `feat/design-system` merge (nhánh đó đã gỡ `framer-motion`, `lucide` và `tabler`).

## Ghi chú khi merge với `feat/design-system`

- **`package.json` và lockfile:** nhánh này thêm `@types/jest` và script `i18n:check`. Nhánh kia thêm Phosphor, gỡ `lucide`, `tabler`, `framer-motion` và `tsparticles`. Merge xong chạy `pnpm install`.
- **File nhánh này xoá mà nhánh kia restyle:** `focus-mode.tsx`, `navigation.tsx`, `(main)/progress`, `(main)/focus`. Khi merge giữ bản xoá.
- **Conflict nhỏ dự kiến:**
  - `src/app/layout.tsx`: font (bên kia) với metadata và `lang` (bên này).
  - `app-sidebar.tsx`, `(main)/layout.tsx`, `settings/page.tsx` (tab Account), `app-providers.tsx`.
  - File locale: chỉ chèn thêm key.
- **Cập nhật 10:14:** `feat/design-system` thay sidebar bằng top app bar và bottom tab bar (AppShell). Nav được gom vào `src/config/app-navigation.ts`. Khi merge:
  - `app-sidebar.tsx`: lấy bản xoá.
  - Lọc nav bằng `isFeatureEnabled` qua field `flag`.
  - `(main)/layout.tsx` mới phải giữ skip link `#main-content` và chỉ tải GlobalChat (dynamic) khi flag chat bật.
  - History: lấy bản heatmap của nhánh kia, bỏ phần chèn `StreakTracker`.
- **Sau merge:**
  - Bọc `account-settings.tsx` bằng `SettingsSection`.
  - Restyle `route-error`, các file loading và account bằng token class.
  - Chuyển 14 file `framer-motion` còn lại sang `motion/react` để `MotionConfig` có hiệu lực.

## Build & smoke test

`pnpm build` dùng env giống CI: exit 0, type-check và lint chạy ngay trong build. Warning duy nhất là Supabase dùng Node API trong Edge middleware (có từ trước). Mọi trang đều là `ƒ` (dynamic) do đọc cookie locale; `robots`, `sitemap` và `/api/chat/models` là static.

Kết quả `pnpm start` rồi `curl`:

| Kiểm | Kết quả |
|---|---|
| Security headers trên `/timer` | CSP-Report-Only, XFO DENY, nosniff, Referrer-Policy, Permissions-Policy ✓ |
| `Accept-Language: vi-VN` / `ja-JP` | Set cookie `app.lang` (SameSite=Lax, 1 năm). `<html lang="vi">` / `"ja"` ✓ |
| Canonical và `og:url` của `/guide`, `/timer` | Trỏ đúng chính trang đó ✓ |
| `/progress`, `/focus` | 308 → `/history` ✓ |
| `/chat`, `/leaderboard`, `/api/leaderboard`, `/api/conversations` khi flag tắt | 404 ✓ |
| `/history` | 200 ✓ |
| `robots.txt` | Chỉ chặn `/api/` và `/auth/` ✓ |
| `sitemap.xml` | Đúng 5 trang indexable ✓ |
| `manifest.json`, các icon | 200. `sw.js` → 404 ✓ |
| `DELETE /api/account`: cross-origin, `text/plain` | 403 ✓ |

## Việc cần bạn làm

1. Xác thực Supabase (`/mcp` hoặc `supabase login`) để chạy Phase 02. Ưu tiên kiểm RLS live trên `tasks` và `sessions`.
2. Kiểm biến `NEXT_PUBLIC_MEGALLM_API_KEY` trên Vercel. `.vercel/project.json` chưa được link nên CLI không xem được. Nếu biến có ở đó: xoá và rotate key.
3. Trên Vercel:
   - Đặt `SUPABASE_SERVICE_ROLE_KEY` nếu muốn bật tính năng xoá tài khoản.
   - Đặt các cờ `NEXT_PUBLIC_FEATURE_*` nếu muốn bật chat hoặc leaderboard (sau Phase 02).
4. Theo dõi báo cáo CSP Report-Only trên console vài ngày rồi chuyển sang enforce.

## Câu hỏi chưa giải quyết

- Leaderboard có cố ý public cho anon và lộ `user_id` không (trước khi bật flag)?
- Supabase project có bật "Secure password change" không? UI đã xử lý bằng cách bắt đăng nhập lại bằng mật khẩu hiện tại.
- Có giữ tracking các thư mục AI tool không? Lưu ý `.Jules/` và `.jules/` trùng tên trên macOS: file `.Jules/palette.md` luôn hiện là modified, **không commit file này**.
