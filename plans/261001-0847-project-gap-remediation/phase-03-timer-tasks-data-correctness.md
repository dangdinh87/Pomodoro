# Phase 03: Timer & tasks data correctness

## Context links
- Report §3: [review-261001-0847-project-gap-analysis.md](../reports/review-261001-0847-project-gap-analysis.md)
- Plan: [plan.md](plan.md) | Plan cũ liên quan: [260203-2311-timer-logic-fixes](../260203-2311-timer-logic-fixes/)

## Overview
- Date: 2026-10-01 | Priority: P1 | Status: pending | Effort: ~1.5d

## Key insights
- Engine đã đếm theo timestamp (`deadlineAt`), nên chạy ở tab nền không bị lệch giờ. Đây là điểm tốt.
- Gốc của các bug: dùng 1 field `lastSessionTimeLeft` cho cả baseline lẫn tổng thời gian, và không lưu nó khi persist.
- Ghi session theo kiểu fire-and-forget: không check `res.ok`, không idempotency.

## Requirements
1. Duration ghi đúng: elapsed thật của phiên, kể cả khi reload giữa chừng.
2. Hết giờ khi tab đóng: lần mở sau phải ghi session và chuyển mode, không kẹt ở 00:00.
3. Nhiều tab: chỉ 1 tab ghi session và phát chuông.
4. Ghi session tin cậy: check `res.ok`, retry, queue offline, idempotency key. Guest: không POST, nhắc login.
5. Tasks: sửa optimistic update. Toast thành công đặt ở `onSuccess`.
6. Sửa `/sounds/alarm.mp3` (404). Gửi Notification khi tab ẩn.

## Architecture
- `timer-store`: thêm `sessionStartedAt` và `accumulatedMs` (vào persist, có `version` + `migrate`). Bỏ các `@ts-ignore`.
- `src/lib/timer/session-recorder.ts` (mới):
  - `recordSession({id: uuid, mode, durationSec, taskId})` → POST.
  - Lỗi thì đẩy vào queue localStorage, flush khi `online`/`visibilitychange`.
  - Server dedupe theo `id`: cột `client_session_id` unique.
- `src/lib/timer/timer-tab-coordinator.ts` (mới): BroadcastChannel `timer`. Tab giữ "leader" (lock qua `navigator.locks` nếu có) mới ghi session và phát chuông.
- Notification: xin quyền khi user bấm Start lần đầu, không xin lúc tải trang.

## Related code files
- `src/stores/timer-store.ts:295-340`
- `src/app/(main)/timer/hooks/use-timer-engine.ts:110-170`
- `src/app/(main)/timer/components/timer-controls.tsx:93,122-160,207`
- `src/components/tasks/task-management.tsx:123,162,227`
- `src/hooks/use-tasks.ts:216-365`
- `src/app/api/tasks/session-complete/route.ts`

## Implementation steps
1. Viết test cho từng bug trước (TDD):
   - Reload 50 phút, phiên vẫn được ghi 50 phút.
   - Hết giờ khi đã đóng tab.
   - Optimistic update.
2. Store: thêm `sessionStartedAt`/`accumulatedMs`, `version: 1` + `migrate`, bỏ hack trong `onRehydrateStorage`.
3. Rehydrate với `deadlineAt` đã qua: ghi session (duration = cấu hình của mode), chuyển mode, `timeLeft` = duration của mode mới.
4. Partial session (unfocus/đổi task): gửi `elapsed` thật. Chỉ tăng `actual_pomodoros` khi `mode=work` và phiên hoàn tất.
5. `session-recorder` + idempotency (migration thêm `client_session_id` unique).
6. `timer-tab-coordinator`: chỉ leader ghi và phát chuông. Pause/resume đồng bộ qua BroadcastChannel.
7. `use-tasks`: thay `getQueryData/setQueryData(['tasks'])` bằng `getQueriesData/setQueriesData({queryKey:['tasks']}, old => ({...old, tasks}))`. Toast thành công chuyển sang `onSuccess`.
8. `timer-controls.tsx:93`: dùng chung helper `playAlarm(alarmType, volume)` với engine.
9. Notification + nháy title khi tab ẩn. Xoá plan mode chết (YAGNI) hoặc giữ nếu sắp có UI.

## Todo list
- [ ] Test tái hiện các bug
- [ ] Store fields + version/migrate
- [ ] Rehydrate xử lý deadline đã qua
- [ ] Sửa partial session
- [ ] session-recorder + queue + idempotency
- [ ] Tab coordinator
- [ ] Sửa optimistic update + toast
- [ ] Helper alarm + Notification
- [ ] Gỡ plan mode chết

## Success criteria
- Test mới pass. Ghi bằng tay: 2 tab, reload và offline đều ra đúng 1 session, đúng duration.
- `tasks` toggle/xoá/reorder cập nhật UI ngay. Lỗi thì rollback và không hiện toast thành công.

## Risk assessment
- Đổi persist schema có thể làm mất state timer đang chạy của user lúc deploy. `migrate` phải giữ `mode`, `settings`, `deadlineAt`.
- Có trình duyệt không hỗ trợ `navigator.locks`. Fallback là tab nào nhận BroadcastChannel trước thì làm leader.

## Security considerations
- `client_session_id` validate là uuid. Server vẫn clamp duration (phase 01).

## Next steps
Phase 07: dữ liệu đúng rồi mới làm streak UI, weekly report, export.
