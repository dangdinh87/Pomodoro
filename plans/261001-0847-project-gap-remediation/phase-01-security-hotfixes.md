# Phase 01: Security hotfixes

## Context links
- Report §1: [review-261001-0847-project-gap-analysis.md](../reports/review-261001-0847-project-gap-analysis.md)
- Plan: [plan.md](plan.md)

## Overview
- Date: 2026-10-01 | Priority: P0 | Status: pending | Effort: ~1d

## Key insights
- Mọi API đều đã dùng `getUser()` và lọc theo `user_id` (tốt). Lỗ hổng nằm ở: input validation, giới hạn chi phí, redirect, config Next.
- Data user không lộ chéo qua API. Rủi ro lớn nhất là **chi phí LLM** và **gian lận leaderboard**.

## Requirements
1. Chặn open redirect ở `auth/callback`.
2. Giới hạn chi phí `/api/chat`: rate limit theo user, cap số message (20) và độ dài (4k ký tự), đặt `max_tokens`.
3. Validate `session-complete`: `mode` thuộc enum, `durationSec` là số nguyên trong khoảng 1–14400.
4. Xoá `NEXT_PUBLIC_MEGALLM_API_KEY` khỏi `.env.example` và `.env`. Kiểm Vercel env, rotate key nếu cần.
5. Thêm security headers. Whitelist `images.remotePatterns`.
6. Escape `q`, whitelist `dateField`, clamp `limit`/`page` trong `api/tasks`.
7. Feedback: validate input, rate limit theo IP. Ẩn `error.message` nội bộ khỏi response.

## Architecture
- Thêm `src/lib/api/validate-request-body.ts`, dùng zod (1 dependency, thay cho validate tay rải rác).
- Rate limit: bảng `api_rate_limits(user_id|ip, bucket, count, window_start)` + RPC `check_rate_limit()`. Tránh thêm hạ tầng ngoài. Thay thế: Vercel Firewall rate-limit rule cho `/api/chat` và `/api/feedback`.
- Headers khai báo trong `next.config.js` `headers()`. CSP cho phép GA, Supabase, YouTube.

## Related code files
- `src/app/auth/callback/route.ts:20-27`
- `src/app/api/chat/route.ts:62-216`
- `src/app/api/tasks/session-complete/route.ts:19-31`
- `src/app/api/tasks/route.ts:70-100`, `src/app/api/tasks/task-schemas.ts:122,184`
- `src/app/api/feedback/route.ts`, `src/app/api/conversations/**`, `src/app/api/tags/route.ts`
- `next.config.js`, `.env.example`

## Implementation steps
1. callback: `const target = new URL(next, origin); redirectTo = target.origin === origin ? target : new URL('/timer', origin)`.
2. chat:
   - Lấy `messages.slice(-20)`, mỗi message cắt còn 4000 ký tự, thêm `max_tokens`.
   - Gọi rate limit 30 request/giờ/user. Vượt thì trả 429.
   - Trả lỗi chung chung cho client, log chi tiết ở server.
3. chat: kiểm `conversations.id = X AND user_id = user.id` trước khi ghi. Đọc history từ DB, chỉ nhận message user mới nhất.
4. session-complete: zod schema `{taskId: uuid|null, durationSec: int 1..14400, mode: enum}`. Sai thì trả 400.
5. tasks:
   - Bỏ ký tự `,()` khỏi `q` (hoặc escape theo PostgREST).
   - `dateField` chỉ nhận `created_at|updated_at|due_date`.
   - `limit` ≤ 100.
   - `parent_task_id` phải là UUID và thuộc user.
6. feedback: zod (message ≤ 2000, email hợp lệ, rating là int 1–5) + rate limit theo IP.
7. Xoá `API_ROUTE_TOKEN` (fail-open, dead).
8. `next.config.js`:
   - `headers()`: CSP, `frame-ancestors 'none'`, nosniff, Referrer-Policy, Permissions-Policy.
   - `remotePatterns`: chỉ `lh3.googleusercontent.com`, `*.supabase.co`, `i.ytimg.com`, chỉ https.
9. Env: xoá `NEXT_PUBLIC_MEGALLM_API_KEY`. Chạy `vercel env ls` để kiểm.

## Todo list
- [ ] Open redirect fix + test
- [ ] Chat caps + rate limit + ownership check + generic errors
- [ ] session-complete zod validation + test
- [ ] tasks query sanitize/whitelist/clamp + parent ownership
- [ ] feedback validation + rate limit
- [ ] Bỏ API_ROUTE_TOKEN
- [ ] Security headers + remotePatterns whitelist
- [ ] Gỡ NEXT_PUBLIC_MEGALLM_API_KEY, kiểm Vercel, rotate nếu cần

## Success criteria
- `/auth/callback?code=x&next=/%5Cevil.com` redirect về `/timer`.
- Request chat thứ 31 trong 1 giờ nhận 429. Payload 100 message bị cắt còn 20.
- `durationSec: 1e9` nhận 400.
- securityheaders.com đạt ít nhất A trên preview deploy.

## Risk assessment
- CSP quá chặt làm vỡ YouTube embed, GA hoặc ảnh avatar. Bắt đầu bằng `Content-Security-Policy-Report-Only` 1–2 ngày.
- Thu hẹp `remotePatterns` làm vỡ ảnh custom background từ URL ngoài. Cần grep chỗ dùng `next/image` với src động trước.

## Security considerations
- Rotate MegaLLM key nếu từng có mặt trên Vercel với tiền tố `NEXT_PUBLIC_`.
- Không log nội dung message chat (PII). Chỉ log metadata.

## Next steps
Phase 03 dùng schema session-complete mới. Phase 04 thêm test cho các fix này.
