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
2. **API phiên:** `POST /api/focus/start` → `{ id, serverStartAt, plannedSec }`; `POST /api/focus/heartbeat` (30 s; cộng tối đa 75 s/khoảng); `POST /api/focus/pause|resume`; `POST /api/focus/finish` (idempotency key) → `{ creditedSec, verified, reason? }`.
3. **Một phiên đang chạy mỗi người:** khởi động phiên mới đóng phiên cũ, tab khác nhận thông báo qua BroadcastChannel và chuyển sang chế độ xem.
4. **Khách/offline:** phiên ghi local, nhãn "chưa xác thực".
5. **Thông báo:** Web Notifications khi hết phiên (xin quyền đúng lúc, sau phiên đầu tiên), tiêu đề tab hiện giờ còn lại, Media Session (tạm dừng từ màn khoá), âm báo tuỳ chọn.
6. **Giải thích:** toast + mục trong lịch sử: "Tính 13/25 phút: máy ngủ 12 phút."
7. Gắn việc: chọn việc trong popover (đã có), cộng `actual` khi phiên được xác thực.

## File chính
`src/features/timer/*` (engine, worker, store), `src/app/api/focus/*`, `src/db/schema/focus.ts`.

## Tiêu chí xong
- Test đơn vị cho công thức cộng phút (heartbeat đều, mất mạng, máy ngủ, hai tab, chỉnh giờ máy).
- Kịch bản harness: chạy phiên, ẩn tab, tạm dừng, hết giờ, chuyển nghỉ.

## Rủi ro
- Trình duyệt giãn timer ở tab ẩn → heartbeat 60 s vẫn trong ngưỡng 75 s; kiểm tra Safari iOS (tab ẩn có thể bị dừng hẳn → phiên không được cộng phần đó, phải giải thích rõ).
