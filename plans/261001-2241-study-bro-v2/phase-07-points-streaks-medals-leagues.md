---
phase: 07
title: "Điểm, streak, huy chương, league"
status: pending
estimate: 5 ngày
depends_on: 04
---

# Phase 07 — Điểm, streak, huy chương, league

## Mục tiêu
Hệ thưởng chính xác, công bằng, có lý do rõ ràng cho từng điểm. Luật đầy đủ ở `plan.md` §5.

## Dữ liệu
- `xp_ledger(id, user_id, source_type, source_id, kind, amount, created_at, reverses_id)` — chỉ ghi thêm; unique `(source_type, source_id, kind)`.
- `daily_stats(user_id, local_date, focus_sec, sessions, xp)` — cập nhật trong cùng transaction với bút toán.
- `streak_state(user_id, current, longest, freezes, last_day)`; `streak_days` nếu cần lịch sử freeze.
- `achievements(user_id, family, tier, earned_at)` — cấp khi điều kiện đạt, không thu hồi trừ khi đảo bút toán gian lận.
- `league_weeks`, `league_cohorts`, `league_members(user_id, week, cohort_id, tier, xp_week, result)`.
- `friendships(user_id, friend_id, created_at)`, `invites(code, owner_id, uses)`.
- Materialized view `leaderboard_weekly`, `leaderboard_monthly`, `leaderboard_all_time` (chỉ người công khai), làm mới 10 phút/lần; dòng của người đang xem tính trực tiếp (mẫu luyenphongvan).

## Các bước
1. Hàm `awardForSession(sessionId)` idempotent: tính XP theo công thức, ghi ledger + daily_stats + streak + kiểm tra huy chương trong một transaction.
2. Job đầu tuần (Vercel Cron, thứ Hai 04:05 giờ VN): chốt league tuần cũ, thăng/hạ, chia nhóm tuần mới (~30 người cùng hạng, ưu tiên người hoạt động gần nhau).
3. Job hằng ngày 04:05: áp freeze tự động, chốt streak.
4. UI: vòng level + streak trên thanh trạng thái; sheet Thống kê (heatmap, giờ theo ngày, huy chương); sheet League (nhóm tuần, bạn bè, đếm ngược kết thúc tuần); trang công khai `/bang-xep-hang`; hồ sơ `/u/[handle]`.
5. Ăn mừng: hiệu ứng khi lên level/đạt huy chương (GSAP, ≤ 1,5 s, tắt được, reduced-motion = tĩnh) + mascot vui.
6. Trang "Cách tính điểm" + lý do cho từng phiên không được tính.
7. Đồ thưởng: khung hồ sơ, skin đồng hồ, trang phục mascot mở theo level/huy chương (không bán bằng tiền).

## Tiêu chí xong
- Test: gửi `finish` hai lần → một bút toán; phiên chồng nhau; đổi múi giờ; ranh giới 04:00; freeze tự dùng; thăng/hạ hạng.
- Dữ liệu seed 200 người dùng giả → league chia đúng, bảng xếp hạng ra đúng thứ tự, có xử lý hoà.

## Rủi ro
- League ít người lúc mới ra mắt → nhóm nhỏ hơn hoặc gộp hạng khi < 10 người; ẩn league khi chưa đủ người, chỉ hiện bảng bạn bè.
- Áp lực tâm lý → không thông báo dồn dập; nút ẩn mình khỏi bảng công khai.
