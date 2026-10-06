# Phase 07: Product roadmap gaps

## Context links
- Report §4, §8: [review-261001-0847-project-gap-analysis.md](../reports/review-261001-0847-project-gap-analysis.md)
- Research: [researcher-261001-0846-competitor-analysis.md](../reports/researcher-261001-0846-competitor-analysis.md). Lưu ý: mục "PWA mostly done" trong đó là sai.
- Plan: [plan.md](plan.md) | Gamification plan cũ: [260205-1428-study-buddy-gamification](../260205-1428-study-buddy-gamification/)

## Overview
- Date: 2026-10-01 | Priority: P3 | Status: **blocked** (chờ quyết định sản phẩm) | Effort: TBD

## Key insights
- Dữ liệu phiên học phải đúng (phase 03) trước khi làm bất kỳ tính năng nào dựa trên thống kê.
- 4 tính năng đã code xong nhưng đang ẩn (Chat, History, Leaderboard, Progress). Quyết định số phận chúng rẻ hơn làm tính năng mới.

## Requirements (ứng viên, xếp theo giá trị × độ khả thi)
1. Quyết định 4 tính năng đang ẩn: bật lại sau khi phase 01–03 xong, hoặc xoá code.
2. Streak và mục tiêu ngày hiển thị ngay trên trang timer (bảng `streaks` đã có).
3. Notification nền khi hết giờ (Notification API, Service Worker nếu giữ PWA).
4. Export CSV (dùng chung endpoint với phase 06) và weekly summary email (Resend + Vercel Cron).
5. Tích hợp Google Calendar hoặc Todoist (OAuth) để import task.
6. Gamification: XP, level, badge. Plan cũ có sẵn.
7. Phòng học chung / body-doubling (Supabase Realtime presence). Effort lớn, làm sau cùng.
8. Focus mode thật cần browser extension. Nếu không làm extension thì xoá hẳn khỏi UI và README.

## Architecture
- Brainstorm từng tính năng riêng (skill `brainstorming`) trước khi lập plan con.
- Cron và email: Vercel Cron → route `/api/cron/weekly-summary` (bảo vệ bằng `CRON_SECRET`).

## Related code files
- `src/app/(main)/{chat,history,leaderboard,progress,focus}/**`, `src/components/layout/app-sidebar.tsx`
- `src/components/focus/*`, `src/app/api/{stats,history,leaderboard}`

## Implementation steps
1. User trả lời câu hỏi 3, 4, 5 trong plan.md.
2. Mỗi tính năng được chọn thì tạo plan con riêng `plans/<date>-<slug>/`.

## Todo list
- [ ] Quyết định feature ẩn
- [ ] Chọn top 3 tính năng cho quý tới
- [ ] Plan con cho từng tính năng

## Success criteria
- Mỗi tính năng có plan riêng, đo được (ví dụ: % user có streak ≥ 3 ngày).

## Risk assessment
- Làm tính năng mới khi nền móng chưa xong sẽ chồng thêm nợ kỹ thuật. Không bắt đầu trước phase 01–04.

## Security considerations
- OAuth tích hợp bên thứ ba: lưu token mã hoá, scope tối thiểu.
- Realtime presence: không lộ email hay `user_id`.

## Next steps
Chờ quyết định từ user.
