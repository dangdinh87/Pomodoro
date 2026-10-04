# Phase 4b: hạ tầng sẵn sàng deploy và gia cố

Ngày 2026-10-05, nhánh `feat/design-system`. Không push, không merge, không deploy. Không thêm dependency. Mỗi mục làm TDD (test đỏ rồi xanh), đã kiểm chứng đột biến cho phần OTP (bỏ hook/rule thì test đỏ).

## Commit

| Mục | Hash | Nội dung |
|---|---|---|
| 1 | `5254aee` | `db-migrate.yml`, `drizzle.config.ts` + `src/db/migration-target.ts`, README (Deploy checklist, mục Database/Env viết lại) |
| 2 | `cbc314c` | `onRequestError`, reporter, `/api/client-error`, boundary báo lỗi |
| 3 | `509a715` | Giới hạn OTP theo IP và theo email, thông báo 429 en/vi/ja |
| 4 | `0b1ed95` | `/api/csp-report`, report-uri/report-to, host Open-Meteo (chỉ 4 hunk của tôi trong `next.config.ts`) |
| 5 | `9edd38c` | Migration `0003_db_hardening`, biên đầu vào, trần 2000 việc |
| 7 | `9407e94` | `.env.example` |
| 6 | `2e24905` | Ratchet lint/coverage, rule icon, test khoá workflow |

Khoảng 130 test mới/sửa. Gate trên working tree: type-check 0 lỗi, i18n 1366 key khớp, lint 0 lỗi, `pnpm test` 166/167 file xanh; 5 test đỏ duy nhất là `weather-mood.test.ts` (WIP thời tiết, như dặn).

## Đã làm

1. **Migrate có kiểm soát.** `db-migrate.yml`: chạy khi push `master` có đổi `drizzle/**` hoặc `workflow_dispatch`; không có trigger PR/fork; `if: github.ref == refs/heads/master` (chạy tay từ nhánh khác cũng bị chặn); concurrency `db-migrate`, không cancel giữa chừng; `environment: production`; Node 22, pnpm 10 như `ci.yml`. `drizzle.config.ts` ném lỗi khi `CI` mà thiếu `DATABASE_URL`, hoặc URL có `-pooler` (DDL không đi qua pgbouncer). Local không `CI` vẫn dùng PGlite (`drizzle-kit check` đã thử cả hai chế độ).
2. **Theo dõi lỗi, không dependency.**
   - `src/lib/observability/`: `error-reporter.ts` (một dòng JSON `app_error` + gửi Sentry nếu có `SENTRY_DSN`), `sentry.ts` (parse DSN, envelope, timeout 2 s, không bao giờ ném lỗi).
   - Chỉ đọc message, name, digest, route (mẫu route, không query), method, stack frames. Không đụng header/cookie/body. Scrub email, `Bearer`, query string, và phần `params:` mà drizzle gắn vào "Failed query" (có tiêu đề task). Stack bỏ dòng đầu (lặp message).
   - `instrumentation.ts` xuất `onRequestError`. `serverError()` cũng báo lỗi, vì mọi handler tự bắt lỗi nên Next không gọi `onRequestError` cho chúng (không có phần này thì Sentry gần như mù với lỗi API). Dùng `after()` để gửi sau response.
   - Client: `RouteError` và `global-error.tsx` gọi `reportClientError` (dedupe, `credentials: omit`, chỉ path không query) rồi POST `/api/client-error`: guard same-origin + JSON, cap 8 KB đọc theo stream, 20 báo cáo/phút/IP, 204/400/403/413/429.
3. **OTP.** Rule IP 3 lần/10 phút cho `/email-otp/send-verification-otp` và `/email-otp/request-password-reset` (cùng gửi mã). Giới hạn theo email (3/10 phút, không phân biệt hoa thường) nằm trong `hooks.before` của Better Auth, **không** nằm trong `sendOtpEmail` như đề bài. Lý do: Better Auth chạy `sendVerificationOTP` qua `runInBackgroundOrAwait` (đã đọc `create-context.mjs:215`), nuốt mọi lỗi nên UI sẽ báo "đã gửi". Hook chạy trước khi tạo mã và trả 429 + `code: OTP_EMAIL_RATE_LIMITED`. Form đăng nhập hiện `login.errors.tooManyCodes` khi gặp 429. Lỗi gửi Resend giờ được báo qua reporter. Đã thử trên dev server: 3 lần 200, lần 4 trả 429 với code đó. Giới hạn nằm trong memory từng instance (ghi trong `otp-limits.ts`); cần thêm rule Vercel Firewall nếu muốn trần cứng.
4. **CSP.** `Reporting-Endpoints: csp-endpoint="/api/csp-report"`, `report-uri` và `report-to` trong CSP, `connect-src` thêm `api.open-meteo.com` và `geocoding-api.open-meteo.com`. Vẫn **Report-Only**. Endpoint nhận `application/csp-report`, `application/reports+json`, cap 16 KB, 60/phút/IP, bỏ nhiễu extension, log cấp warning. Kiểm tra bằng curl: header có đủ, POST mẫu trả 204.
5. **DB.**
   - Migration `drizzle/0003_db_hardening.sql`: 3 index (`focus_sessions(user_id, mode, created_at)`, `focus_sessions(task_id)`, `feedbacks(user_id)`) và 4 CHECK (`tasks.priority`, `tasks.status`, `focus_sessions.mode`, `feedbacks.type`). Danh sách giá trị là hằng dùng chung trong `schema.ts`, validator import lại nên không lệch. Test chứng minh migration chạy sạch trên PGlite, CHECK từ chối giá trị lạ, index tồn tại.
   - Biên: tag ≤ 32 ký tự (đổi `MAX_TAG_LENGTH` 50 thành 32, dùng chung với `/api/tags`; ô nhập UI đã 30) và ≤ 10 tag/task (trả 400 thay vì cắt im lặng); `display_order` phải là số nguyên trong 0..2147483647, ngoài khoảng trả 400 (PATCH và reorder); clone kẹp ở int4.
   - Trần 2000 việc/tài khoản (không tính việc đã xoá mềm) trả 409 `{code: TASK_LIMIT_REACHED, max}` ở `POST /api/tasks` và clone; client hiện `tasksUi.errors.limitReached` en/vi/ja.
   - Đề bài ghi "zod" nhưng repo không có zod (không phải dependency trực tiếp), nên validator viết tay đúng kiểu `feedback-schema.ts`.
6. **Ratchet** (đo trên bản checkout sạch của HEAD, không có WIP thời tiết):
   - Lint: **50 warning** (working tree 42 vì 4a đang xoá code chết). `ci.yml` đổi 189 thành `--max-warnings 50`; hạ tiếp khi 4a commit. `eslint.config.mjs` thêm ignore `coverage/**`.
   - Coverage: **51.32% statements / 45.61% branches / 51.32% functions / 51.8% lines**. Ngưỡng cũ 14/13/11/14 thành **50/44/50/50**.
   - Rule icon: `no-restricted-imports` (error) cấm import tên kết thúc `Icon` từ `@phosphor-icons/react/dist/ssr`; test chạy ESLint thật trên chuỗi mẫu (đúng, sai, re-export, đổi tên cục bộ).
   - Thêm `db-migrate-workflow.test.ts` khoá các tính chất an toàn của workflow (không PR, chỉ master, concurrency, secret).
7. **`.env.example`**: ghi đủ biến đọc trong code, gồm `DOMAIN_MOVE`, `SENTRY_DSN`, `NEXT_PUBLIC_SITE_URL`, `EMAIL_FROM`, cùng ghi chú Neon pooled/unpooled. Bản có sẵn đã sạch Supabase/MegaLLM/Spotify nên không còn gì để xoá. Biến do nền tảng đặt (`VERCEL`, `VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`, `CI`, `NODE_ENV`, `NEXT_RUNTIME`) chỉ liệt kê trong chú thích.

## Việc chủ dự án phải làm

**GitHub** (Settings, Secrets and variables, Actions; hoặc secret của environment `production`):
- `DATABASE_URL`: chuỗi kết nối Neon **unpooled** (không có `-pooler`).

**Vercel** (Production; Preview dùng Neon branch riêng, không dùng chung URL production):
- Bắt buộc: `DATABASE_URL` (pooled), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL=https://studywithbro.com`, `RESEND_API_KEY`, `EMAIL_FROM` (domain đã verify trong Resend).
- Nên có: `SENTRY_DSN` (tạo project Sentry free, chỉ server, không prefix `NEXT_PUBLIC_`).
- Tuỳ chọn: `GOOGLE_CLIENT_ID/SECRET`, `NEXT_PUBLIC_GA_ID` (`G-…`), `DOMAIN_MOVE=1` chỉ khi domain mới đã chạy.
- Gỡ biến cũ: Supabase, MegaLLM, Spotify.

**Thứ tự lần deploy đầu:** chạy tay workflow "DB migrate" trên `master` trước, rồi mới merge. Chi tiết trong README mục "Deploy checklist".

## Cần biết / follow-up

1. **HEAD sạch đang đỏ 1 test** (không phải của 4b): `src/i18n/translation-keys.test.ts` báo thiếu `shell.panelError.title/description`. Commit `f196b77` đặt khối `panelError` nhầm chỗ (nằm trong `shell.panels`, nên key thật là `shell.panels.panelError.*`). Bản sửa đã có trong hunk locale chưa commit của working tree (dịch chuyển `openTimer`/`streak`/`panels` quanh dòng 1187). Ai đang giữ hunk đó (4a?) cần commit trước khi push, nếu không CI đỏ.
2. **Lần chạy đầu `db:migrate` trên Neon chưa kiểm được** (không có quyền, không có Postgres local). `drizzle-kit migrate` sẽ dùng driver `@neondatabase/serverless`. Chạy tay qua `workflow_dispatch` để xác nhận. Nếu lỗi WebSocket, phương án dự phòng là script `tsx` dùng `drizzle-orm/neon-serverless/migrator` (cùng driver với app).
3. **Đổi CSP sang enforce:** sau khi deploy và `/api/csp-report` không còn báo bất thường, đổi key `Content-Security-Policy-Report-Only` thành `Content-Security-Policy` ở `next.config.ts`. Nhớ thêm host của bất kỳ tính năng mới nào trước đó.
4. **Người dùng không biết khi Resend lỗi:** Better Auth nuốt lỗi gửi mã nên UI vẫn báo "đã gửi" (lỗi đã vào log/Sentry nhưng người dùng vẫn thấy thành công). Cân nhắc kiểm tra cấu hình Resend ở hook `before` hoặc thêm health check.
5. Các limiter (OTP, client-error, csp-report) nằm trong memory từng instance; thêm rule Vercel Firewall cho `/api/auth/email-otp/*`, `/api/client-error`, `/api/csp-report` nếu cần trần cứng.
6. Trần 2000 việc là trần mềm (đếm rồi mới chèn, không atomic). Việc xoá mềm không bị dọn nên bảng vẫn có thể phình; cần job dọn `is_deleted` cũ.
7. Chưa làm các mục P2-9 ngoài phạm vi: Action `pg_dump` hằng tuần và uptime monitor (chỉ ghi trong README). P2-10 (Neon branch cho Preview) là cấu hình ở Vercel.
8. `MAX_TAG_LENGTH` giảm từ 50 xuống 32: tag người dùng đã lưu dài hơn vẫn đọc được nhưng không thêm lại được. DB prod bắt đầu rỗng nên không ảnh hưởng.
9. README còn các đoạn cũ (Next 14, Supabase, Jest ở mục Tech stack/Scripts); tôi chỉ sửa mục Database/Env/Deploy. Nên dọn ở batch tài liệu.
10. Coverage báo `PARSE_ERROR` cho vài file có `import 'server-only'` (ví dụ `session-user.ts`, `send-otp-email.ts`) và loại chúng khỏi báo cáo; có từ trước, làm số coverage cao hơn thực tế một chút.
11. Còn 3 warning `no-explicit-any` trong `task-schemas.ts`; chưa dọn để giữ diff gọn.

## Câu hỏi chưa giải quyết

- Có muốn thêm Action `pg_dump` hằng tuần (P2-9) trong batch sau không?
- Neon plan nào (free hay Pro) để chọn cửa sổ PITR và có cần backup ngoài không?
