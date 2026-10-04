# Batch 1A: ghi phiên đúng và đủ (2026-10-05)

Nhánh `feat/design-system`, làm theo TDD (test đỏ trước), commit nhỏ qua `commit-own.py`.

## Kết quả theo task

| Task | Commit | Nội dung |
|---|---|---|
| 1. Khách luôn được ghi (P0-2) | `b643e24` | `recordSession` gọi `ensureSession()` (dùng lại helper của tạo việc/tag) khi chưa có user. Đăng nhập ẩn danh dùng chung 1 promise nên nhiều phiên cùng lúc chỉ đăng nhập 1 lần. Đăng nhập lỗi: item ở lại outbox với `userId: null`, `flush` thử lại (cả `flush` tự đăng nhập khách nếu có item không chủ). Engine flush thêm khi auth vừa xong mà không có user (`shouldFlushOnAuthChange`). |
| 2. Rate limit khách (P1-7) | `eb39b34` | `auth.ts` max 5 thành 30 / 10 phút / IP. Client: `ensureSession` ném `TooManyRequestsError` khi 429, `createTask` ném khi POST /api/tasks trả 429, toast `errors.tooManyRequests` (en/vi/ja) thay cho "Failed to create task". |
| 3. +1 pomodoro chỉ khi trọn phiên (P1-3) | `65675ce` | Client gửi `completedFullSession: true` chỉ ở engine khi hết giờ tự nhiên (kể cả catch-up trong 15 phút). Skip, đổi/bỏ việc, stop gửi false. Server chỉ `+1 actualPomodoros` khi cờ true và mode work; `timeSpentMs` luôn cộng. Cờ không phải boolean thì 400. |
| 4. Idempotency + giờ thật (P2-3, P2-6) | `4191404` (schema+migration), `9029a57` (route+client) | Cột `client_session_id text` nullable + unique index `(user_id, client_session_id)`. Client gửi id của outbox item làm `clientSessionId` và `endedAt` ISO (engine truyền `deadlineAt`). Server: trùng id thì 200 `{duplicate:true}`, không đụng counter. `created_at` = `endedAt`. Trần 24h nằm trong transaction sau `pg_advisory_xact_lock(hashtext(user_id))`. |
| 5. Đổi việc giữa phiên (P2-8) | `407c181` | `switchActiveTask(next, record)` ở `src/lib/timer/switch-active-task.ts`, lộ qua `useSessionRecorder().switchActiveTask`. Dùng ở `task-selector.tsx` (9 chỗ `setActiveTask`) và `task-management.tsx` (focus, stop, done, delete). Xoá `recordPartialSession` cũ. |
| 6. Kiểm copy | không đổi | "Every finished session is logged" (landing) và "Everything you did as a guest is kept" (Tài khoản) nay đúng. Phiên khách được ghi, và item outbox của khách được chuyển sang tài khoản thật khi đăng nhập (xem dưới). Giữ nguyên en/vi/ja. |

Migration: `drizzle/0002_add_client_session_id.sql` (tạo bằng `pnpm db:generate --name add_client_session_id`, theo kiểu đặt tên của 0001).

Yêu cầu bổ sung từ coordinator: hook `useSessionRecorder` đã invalidate theo prefix `['stats']`, `['tasks']`, `['history']` sau khi ghi thành công, khớp key mới của 1B (`['stats', tz, ...]`, `['history', ...]`). Thêm test `use-session-recorder.test.tsx` khoá hành vi này. Hai lỗi 1B báo (7 test route đỏ, TS2349 ở `use-tasks.test.tsx`) là trạng thái dở của tôi giữa chừng; đã sửa và commit, hiện xanh.

## Quyết định tự chọn

- **`endedAt` ngoài `[now-7d, now+5min]` thì dùng now** (đọc "else use now" theo nghĩa đen), không kẹp vào biên. Thiếu hoặc không parse được cũng dùng now. Trong cửa sổ, đặt đúng `endedAt`.
- **`clientSessionId` sai định dạng** (không khớp `[A-Za-z0-9_-]{8,64}`) bị bỏ qua (coi như null) thay vì 400, để không mất phiên; phiên đó không có idempotency.
- **Cửa sổ trần 24h neo theo `endedAt`**: tổng `created_at` trong `(endedAt-24h, endedAt]`. Nếu neo theo "now" thì phiên lùi ngày (đã dùng `created_at = endedAt`) sẽ né được trần.
- **Skip khi đã >=50% vẫn chỉ ghi thời gian, không +1 pomodoro** (theo đề bài task 3 và Global Constraints). Đếm local `completedSessions`/`sessionCount` của timer giữ nguyên như cũ.
- **Phiên cuối của một pomodoro đã đổi việc giữa chừng** vẫn +1 cho việc đang chọn lúc hết giờ.
- **Chọn việc khi chưa có việc nào**: không ghi, không reset baseline, nên thời gian đã chạy tính cho việc vừa chọn (cùng pomodoro). Trước đây `handleFocus` reset baseline và mất đoạn đó; cũng tránh tạo phiên 3 giây không việc mỗi lần "bấm Start rồi mới chọn việc". Bỏ chọn (việc thành null) thì ghi đoạn cho việc cũ rồi reset baseline.
- **Item outbox của khách khi đăng nhập thật**: thêm cờ `guest` ở item. Sau khi khách đăng nhập tài khoản thật, `flush` chuyển item đó sang user mới (server đã chuyển dữ liệu cũ nên unique id vẫn khớp, retry chỉ ra `duplicate`). Không có cái này, item đang chờ retry sẽ kẹt dưới id khách đã bị xoá rồi hết hạn sau 24h.
- **`flush` không tạo khách vì item lạ**: chỉ đăng nhập ẩn danh khi có item `userId === null`, không phải mọi item tồn đọng.
- Toast 429 chỉ ở tạo việc (use-tasks). Ghi phiên bị 429 (đăng nhập khách) im lặng giữ trong outbox vì phiên kết thúc không nên bật toast mỗi lần. `use-tags` vẫn hiện chuỗi lỗi gốc của Better Auth (ngoài phạm vi).

## Advisory lock với PGlite

`pg_advisory_xact_lock(hashtext(...))` chạy được trên PGlite (test riêng `PGlite supports the per-user advisory lock...` xanh), không cần fallback. PGlite một kết nối nên tự tuần tự hoá transaction; test song song (8 POST x 4h) chỉ chứng minh logic trần, còn lock thật chỉ có tác dụng trên Neon. Ở prod, Neon dùng `Pool` (neon-serverless) nên `db.transaction` tương tác được; chưa chạy thử thật trên Neon.

## Test

- Mới/đổi: `session-recorder.test.ts` (33 test), `route.test.ts` (22 test, trước đó 6), `use-tasks.test.tsx` (+3), `use-timer-engine.test.tsx` (cập nhật payload), `timer-controls-skip.test.tsx` (mới, 1), `switch-active-task.test.ts` (mới, 7), `use-session-recorder.test.tsx` (mới, 3).
- Cổng cuối: `pnpm test` 50 file / 372 test xanh; `pnpm type-check` sạch; `pnpm lint` 0 lỗi (93 warning có sẵn); `pnpm i18n:check` OK (1226 key).

## Chưa làm / ghi chú

- **Kiểm chạy thật trên :3001 không làm**: không có dev server, và ổ đĩa `/System/Volumes/Data` chỉ còn khoảng 0,9 GB (lúc bắt đầu 18 GB, bị tiến trình khác ăn, không phải test của tôi) nên không khởi động `pnpm dev` (< 5 GB theo luật). Cần chạy lại bằng tay khi có chỗ: DB local `.pglite` phải áp migration 0002 (`pnpm db:migrate` hoặc cơ chế migrate lúc khởi động của dự án).
- **Thông báo khi outbox phải bỏ item** (P2-6 "báo khi phải bỏ": quá 24h, quá 20 mục, quá 5 lần) chưa làm: không có trong 6 task, cần thêm key i18n. Có thể tăng `MAX_AGE_MS` lên gần 7 ngày nay đã có `endedAt` thật.
- Hộp thoại skip còn câu "less than 50%..." cả khi tiến độ >=50% (đã có từ trước); không đụng vì thuộc batch timer UX (1C).
- Không viết test cho `auth.ts` (rate limit config), vì file `server-only` nối DB; thay đổi là một hằng số.

## Câu hỏi còn mở

- Skip sau >=50% có nên +1 pomodoro (audit P1-3 nói có, plan nói chỉ hết giờ tự nhiên)? Đang theo plan.
