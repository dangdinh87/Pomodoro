---
phase: 02
title: "Dữ liệu & đăng nhập"
status: pending
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
