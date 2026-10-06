---
phase: 04
title: "Timer v2 & phiên xác thực"
status: pending
estimate: 3 ngày
depends_on: 02, 03
---

# Phase 04 — Timer v2 & phiên xác thực

## Mục tiêu
Timer chính xác, dễ chịu, và mọi phút được tính điểm đều do server xác thực (luật ở `plan.md` §5.6).

## Các bước
1. **Engine:** đếm theo mốc kết thúc (đã có), chạy trong Web Worker để không lệch khi tab ẩn; chế độ 25/5, 50/10, 52/17, 90/20, tuỳ chỉnh; tự chuyển nghỉ/tập trung (tuỳ chọn); chu kỳ nghỉ dài.
2. **API phiên — không ghi DB khi đang chạy (token ký, stateless):**
   - `POST /api/focus/start` → token HMAC (secret server) chứa `{ sid, uid, mode, plannedSec, startedAt, lastBeatAt, creditedSec, paused }` theo giờ server. **Không ghi DB.**
   - `POST /api/focus/beat` (60 s; tab ẩn có thể giãn) và `pause|resume`: server kiểm chữ ký, cộng `min(now − lastBeatAt, 75 s)` nếu không tạm dừng, trả token mới. **Không ghi DB.**
   - `POST /api/focus/finish` (token + idempotency key = `sid`): phút xác thực = `min(creditedSec, now − startedAt, plannedSec × 1,1)`; **một lần INSERT** `focus_sessions` (unique `sid` → gửi lại không nhân đôi) + cập nhật việc. Chỉ bước này chạm DB.
   - Token hết hạn sau `plannedSec × 2`; token cũ dùng lại bị chặn nhờ unique `sid` lúc finish.
3. **Một phiên đang chạy mỗi người:** trong trình duyệt dùng BroadcastChannel (tab khác chuyển sang chế độ xem). Phía server không giữ trạng thái: lúc finish từ chối phiên **chồng thời gian** với phiên đã ghi của cùng người (một truy vấn trên index `user_id, created_at`).
4. **Khách/offline:** phiên ghi local, nhãn "chưa xác thực".
5. **Thông báo:** Web Notifications khi hết phiên (xin quyền đúng lúc, sau phiên đầu tiên), tiêu đề tab hiện giờ còn lại, Media Session (tạm dừng từ màn khoá), âm báo tuỳ chọn.
6. **Giải thích:** toast + mục trong lịch sử: "Tính 13/25 phút: máy ngủ 12 phút."
7. Gắn việc: chọn việc trong popover (đã có), cộng `actual` khi phiên được xác thực.

## File chính
`src/features/timer/*` (engine, worker, store), `src/app/api/focus/*`, `src/db/schema/focus.ts`.

## Tiêu chí xong
- Test đơn vị cho công thức cộng phút (heartbeat đều, mất mạng, máy ngủ, hai tab, chỉnh giờ máy).
- Kịch bản harness: chạy phiên, ẩn tab, tạm dừng, hết giờ, chuyển nghỉ.

## Ngân sách DB (Neon free, 100 CU-giờ/tháng)
- Mỗi phiên tập trung: **1 INSERT + 1 UPDATE** lúc kết thúc; không có ghi định kỳ. Thống kê đọc qua react-query (staleTime 1–5 phút, không refetch khi focus tab).
- Không polling từ client; không cron chạy dày (dọn user khách: 1 lệnh DELETE/tuần).

## Rủi ro
- Trình duyệt giãn timer ở tab ẩn → heartbeat 60 s vẫn trong ngưỡng 75 s; kiểm tra Safari iOS (tab ẩn có thể bị dừng hẳn → phiên không được cộng phần đó, phải giải thích rõ).
