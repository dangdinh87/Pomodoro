---
phase: 02
title: "Dữ liệu & đăng nhập"
status: done (chờ DATABASE_URL Neon thật + key Resend/Google)
estimate: 4 ngày
depends_on: 01
---

# Phase 02 — Dữ liệu & đăng nhập

## Mục tiêu
Thay Supabase bằng **Neon Postgres + Drizzle** và **Better Auth**; khách dùng được ngay với dữ liệu local, đăng nhập thì đồng bộ. Không còn bất kỳ truy cập DB nào từ trình duyệt.

## Schema (Drizzle, `src/db/schema/*.ts` là nguồn sự thật)
| Nhóm | Bảng |
|---|---|
| Auth (Better Auth) | `user`, `session`, `account`, `verification` |
| Hồ sơ | `profiles` (handle, display_name, avatar, locale, timezone, leaderboard_visibility) |
| Cài đặt | `user_settings` (jsonb: timer, scene, clock, sound mix, hotkeys) |
| Việc | `tasks` (id, user_id FK, title, notes, status, priority, estimate, actual, due_date, order, tags text[]), `task_templates` |
| Phiên | `focus_sessions` (id, user_id, task_id, mode, planned_sec, started_at, last_heartbeat_at, ended_at, credited_sec, status, verified, invalid_reason, source) |
| Thống kê | `daily_stats` (user_id, local_date, focus_sec, sessions, xp) — bảng tổng hợp |
| Điểm & thưởng | `xp_ledger`, `streak_state`, `achievements`, `league_weeks`, `league_members`, `friendships`, `invites` (phase 07) |
| Thanh toán | `purchases`, VIEW `active_entitlements` (phase 08) |
| AI | `ai_usage` (phase 09) |

Tên bảng phiên là `focus_sessions` để không đụng bảng `session` của auth.

## Các bước
1. Tạo project Neon (prod + branch dev), `drizzle-kit` migrations, seed dữ liệu demo cho môi trường dev (dùng chung với harness).
2. Better Auth: Google + email OTP (gửi bằng Resend), plugin `anonymous` cho khách; trang/popup đăng nhập trong app; `useSession` thay `useAuth` + `auth-store`.
3. Chế độ khách: Dexie (IndexedDB) lưu việc, cài đặt, phiên; hàng đợi đồng bộ. Khi đăng nhập: tải lên việc + cài đặt (bản server thắng nếu trùng id), phiên khách nhập dưới dạng "chưa xác thực".
4. Viết lại toàn bộ API route (tasks, tags, templates, stats, history, feedback, account export/delete) trên Drizzle, validate bằng zod, kiểm quyền theo `user_id` trong session.
5. Gỡ 28 file import Supabase, gỡ `@supabase/*`, middleware mới cho Better Auth.
6. Harness: thay cookie Supabase giả bằng session Better Auth giả (hoặc route `/api/dev/login` chỉ bật ở dev) và cập nhật mock dữ liệu.

## Tiêu chí xong
- Khách: tạo việc, chạy phiên, tải lại trang vẫn còn; đăng nhập xong dữ liệu được gộp, không trùng.
- Không còn biến môi trường Supabase; `grep supabase src` rỗng.
- Thử ghi DB từ console trình duyệt: không có đường nào (chỉ có API server).

## Rủi ro
- Dữ liệu người dùng cũ: Supabase đã chết → **không chuyển được** trừ khi khôi phục được project. Plan mặc định: bắt đầu DB mới.
- Email OTP cần nhà cung cấp gửi mail (Resend free tier) và domain đã xác minh.

## Đã chốt
- Bắt đầu DB mới hoàn toàn (không chuyển dữ liệu cũ).
- Lý do chọn Neon thay vì Supabase mới: Supabase bản free tự tạm dừng sau 1 tuần không hoạt động và không có backup — đúng nguyên nhân project cũ chết; Neon free chỉ ngủ khi rảnh (thức lại ~0,3–0,5 s), 0,5 GB/project, 100 CU-giờ/tháng, có branching cho môi trường dev/preview; cùng nhà cung cấp với luyenphongvan.
- Gửi mã đăng nhập bằng Resend, giữ domain hiện tại.

## Kết quả (2026-10-02)
- **Drizzle + Postgres**: schema ở `src/db/schema.ts`, migration `drizzle/0000_init.sql`. `DATABASE_URL` có → Neon (`neon-serverless`, có transaction); không có → PGlite local ở `.pglite/` (tự migrate lúc server khởi động qua `src/instrumentation.ts`). DB tạo lười (lần query đầu) để `next build` không mở PGlite từ nhiều worker.
- **Better Auth 1.7**: email OTP (mã băm, 10 phút; local không có Resend thì in mã ra log), Google (chỉ hiện khi có `GOOGLE_CLIENT_ID/SECRET`), rate limit lưu DB. `/signup`, `/reset-password` → redirect `/login`.
- **Toàn bộ API** viết lại trên Drizzle, giữ nguyên JSON trả về (snake_case) nên client chỉ đổi lớp auth. Streak tính từ ngày có phiên (`src/lib/stats/streak.ts`), bỏ bảng streaks.
- Gỡ Supabase hoàn toàn (`grep -ri supabase src` rỗng), gỡ leaderboard cũ + cờ (phase 07 làm lại), gỡ subtask (`parent_task_id`, không còn UI).
- **Test chuyển sang Vitest 4** (Jest không nạp được PGlite — PGlite dynamic-import built-in của Node; cờ `--experimental-vm-modules` lại làm hỏng Phosphor). Test route chạy trên Postgres in-memory thật: 154/154 xanh.
- Harness chế độ `real` (không mock API): khách tạo việc → reload còn → ghi phiên → đăng nhập bằng mã → việc + phiên chuyển sang tài khoản. Chạy 2 lần trên build production, không lỗi.

### Lệch so với plan
- **Không dùng Dexie + hàng đợi đồng bộ.** Thay bằng plugin `anonymous`: khách có phiên ẩn danh **khi ghi lần đầu** (tạo việc/thẻ), không phải khi xem trang; đăng nhập thì `onLinkAccount` chuyển dữ liệu (`src/lib/auth/move-guest-data.ts`). Lý do: một đường dữ liệu duy nhất cho phase 04–07, không phải viết 2 lần (local + server). Timer vẫn chạy hoàn toàn phía client.
- Giới hạn `/sign-in/anonymous` 5 lần/10 phút/IP (mỗi lần tạo 1 dòng user).
- Phiên khách chưa có session vẫn **chưa** được ghi (session-recorder bỏ qua khách) — phase 04 làm phiên server-issued sẽ gọi `ensureSession()` khi bắt đầu phiên.

### Việc còn treo
- `DATABASE_URL` Neon: chủ dự án dùng tài khoản Neon khác → điền vào `.env.local` (dev) và Vercel env (prod), rồi `pnpm db:migrate`.
- `RESEND_API_KEY` + xác minh domain gửi mail; `GOOGLE_CLIENT_ID/SECRET` với redirect `<BETTER_AUTH_URL>/api/auth/callback/google`; `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` trên Vercel.
- Dọn user ẩn danh không hoạt động (cron) — phase 11.
- Ngày thống kê vẫn theo UTC → phase 07 chuyển sang ranh giới 04:00 giờ VN.
