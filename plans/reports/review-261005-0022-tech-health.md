# Review sức khoẻ kỹ thuật: Study Bro, nhánh `feat/design-system`

- **Ngày:** 2026-10-05 (Asia/Saigon). **Nhánh:** `feat/design-system` @ `ee9a8aa`. Nhánh đi trước `master` 31 commit và **chưa push** (không có upstream).
- **WIP chưa commit:** tính năng thời tiết do session khác đang làm, gồm `src/app/api/weather/*`, `src/lib/weather/*`, `src/hooks/use-weather-sync*`, `weather-settings.tsx`, `weather-store.ts`, locale JSON và `next.config.ts` (Permissions-Policy `geolocation=(self)`). Mỗi finding bên dưới ghi rõ nguồn: **[WIP]** hoặc **[commit]**.
- **Cách làm:**
  - Chạy 4 gate và coverage. Coverage xuất ra scratchpad, không ghi vào repo.
  - Lighthouse và performance trace qua Chrome DevTools MCP, trên `localhost:3001` (dev) và production.
  - `curl` header, DNS và whois; `pnpm audit --prod`.
  - Đọc toàn bộ `src/app/api/**`, `src/lib/auth*`, `src/db/*`, `drizzle/*`, config và CI.
- **Không kiểm được:** MCP của Vercel, Neon và Supabase chưa xác thực, nên không xem được env trên Vercel, không biết Neon đã migrate chưa, region Neon là gì. `pnpm build` không chạy (cấm). Đã thử build bản HEAD trong scratchpad nhưng `pnpm install --offline` thiếu gói trong store; bản copy đó đã xoá.

> **Đính chính đầu vào:** production **không** chạy ở `https://pomodorostudy.online`.
> - Tên miền này NXDOMAIN, và registry `.online` trả lời "Domain pomodorostudy.online is available for registration".
> - Bản `master` cũ chạy ở `https://www.pomodoro-focus.site`. Tên miền này hết hạn **2026-11-11** (Hostinger).

---

## 1. Kết quả gate

| Gate | Kết quả | Ghi chú |
|---|---|---|
| `pnpm type-check` | **0 lỗi** (exit 0) | Deps đã cài đủ |
| `pnpm lint` | **0 error, 94 warning** (exit 0) | 34 `no-explicit-any`, 16 `no-unused-vars`, 5 `exhaustive-deps`, 2 `no-empty-object-type`, 1 `no-img-element`… 1 warning nằm trong `coverage/` local (eslint chưa ignore). File WIP thêm 0 warning. CI vẫn cho phép tới `--max-warnings 189` |
| `pnpm test` (vitest) | **43 file / 274 test pass**, 88 s | WIP weather chiếm 4 file / 29 test. Phần đã commit: 39 file / 245 test |
| Coverage | **26.15% stmt / 22.3% branch / 22.33% fn / 26.15% line** | Ngưỡng CI mới 14/13/11/14. API route ~90–97%, `auth.ts`/`auth-client.ts` 0%, `timer-store` 51% |
| `pnpm i18n:check` | **1225 key khớp** en/vi/ja | Đã gồm key weather của WIP (+45 dòng mỗi locale) |
| `pnpm audit --prod` | 7 lỗ hổng: 3 high, 3 moderate, 1 low | Toàn bộ là transitive của tooling: picomatch (vitest), browserslist và @babel (styled-jsx), esbuild (drizzle-kit), baseline-browser-mapping (next). Không chạm runtime |
| `next build` | **Chưa kiểm** | Không được chạy local. CI có bước build, nhưng nhánh chưa push nên **CI chưa từng chạy trên 31 commit này** |
| CI (`.github/workflows/ci.yml`) | Có đủ type-check, lint (ratchet), i18n, test+coverage, build; có dependabot | Không có bước migrate DB |

**Lighthouse mobile** (category Performance không có trong tool, đo bằng trace thay thế):

| | A11y | Best Practices | SEO | LCP (Slow 4G, CPU 4×) | CLS |
|---|---|---|---|---|---|
| `localhost:3001/` (dev, chỉ tham khảo) | 91 | 96 | 100 | **7.0 s**: TTFB 1.36 s, render delay 5.64 s | 0.00 |
| Prod cũ `www.pomodoro-focus.site` | 87 | 100 | 100 | **0.83 s**: TTFB 124 ms, cache HIT ở hkg1 | 0.00 |

Phần tử LCP ở bản mới là `span.digit__num`, tức chữ số của timer, và chỉ render ở client.

---

## 2. Findings

### P0

**P0-1. Tên miền chuẩn `pomodorostudy.online` chưa được đăng ký. Toàn bộ SEO và email đang trỏ vào nó [commit]**
- **Bằng chứng:**
  - `dig` (cả resolver hệ thống lẫn 1.1.1.1) không trả về gì. NS của `.online` trả NXDOMAIN, `whois.nic.online` báo "available for registration".
  - Code mặc định trỏ vào tên miền này: `src/config/site.ts:6` (`SITE_URL`), `.env.example:10,24` (`EMAIL_FROM no-reply@pomodorostudy.online`), `public/llms.txt`, README và chính sách quyền riêng tư (3 locale, dòng 1307).
  - Trên local, `curl /` trả `<link rel="canonical" href="https://pomodorostudy.online"/>`; `/sitemap.xml` cũng toàn URL của tên miền chết.
- **Hậu quả nếu deploy nguyên trạng:**
  - Canonical, og:url, sitemap và JSON-LD trỏ vào tên miền không tồn tại, nên Google có thể bỏ index.
  - Resend không verify được domain gửi. `sendOtpEmail` ném lỗi trên Vercel (`src/lib/email/send-otp-email.ts`), nên **không ai đăng ký hay đăng nhập được bằng email**. Google sign-in là tuỳ chọn.
  - Người khác có thể mua mất tên miền.
- **Fix:** chọn một trong hai hướng:
  - (a) Mua `pomodorostudy.online` ngay, gắn vào Vercel project, verify DNS cho Resend, rồi mới deploy.
  - (b) Đặt `NEXT_PUBLIC_SITE_URL=https://www.pomodoro-focus.site`, `EMAIL_FROM` dùng domain đã verify, và giữ `DOMAIN_MOVE` tắt.
  - Dù chọn hướng nào, cần gia hạn `pomodoro-focus.site` (hết hạn 2026-11-11) để redirect 308 còn chạy đủ lâu.

**P0-2. Groq API key bị đưa ra trình duyệt và gửi sang Google (chỉ ở môi trường local) [không thuộc commit hay WIP: file `.env` local]**
- **Bằng chứng:**
  - `.env:14` thiếu một ký tự xuống dòng, nên hai biến dính vào nhau: `NEXT_PUBLIC_GA_ID=GTM-NXW9…GROQ_API_KEY=gsk_…`.
  - `src/app/layout.tsx:148,154` chèn biến này vào URL `gtag/js?id=` và vào inline script.
  - Trace mạng trên `localhost:3001` thấy request tới `https://www.googletagmanager.com/gtag/js?id=GTM-…GROQ_API_KEY=gsk_…`.
- **Phạm vi:** Production sạch: HTML prod chỉ có `GTM-NXW9Z4LK`. `git log -S` không thấy `gsk_`, `sk-meg` hay service role key trong lịch sử git.
- **Fix:**
  - Rotate Groq key ngay.
  - Xoá file `.env` cũ. Nó còn chứa `SUPABASE_SERVICE_ROLE_KEY`, Spotify secret, `MEGALLM_API_KEY` và `NEXT_PUBLIC_MEGALLM_API_KEY`, không biến nào còn được code dùng. Rotate các key đó nếu còn sống.
  - Validate định dạng GA ID (`/^G-[A-Z0-9]+$/`) trước khi render script.

### P1

**P1-1. Migration Neon không nằm trong bước deploy nào [commit]**
- `src/instrumentation.ts:4` ghi rằng Neon "migrated by `pnpm db:migrate` in the deploy step", nhưng bước đó không tồn tại:
  - `build` chỉ là `next build`;
  - `vercel.json` chỉ khai báo `regions`;
  - CI không có bước migrate.
- `drizzle.config.ts` đọc `DATABASE_URL`, trong khi `.env.local` chỉ có `NEON_DATABASE_URL`. Vì vậy `pnpm db:migrate` chạy local sẽ migrate PGlite chứ không phải Neon.
- **Fix:**
  - Trước lần deploy đầu, chạy `DATABASE_URL=<neon unpooled> pnpm db:migrate`.
  - Thêm một bước migrate có kiểm soát: GitHub Action trên `master`, hoặc Build Command riêng cho Production.

**P1-2. Nhánh chưa từng qua CI, và `next build` chưa được kiểm từ 10/01 [commit]**
- `git rev-parse @{u}` báo không có upstream; `origin/master` = `master` = `f3031c9`.
- 31 commit đã thay cả stack: Next 16, Drizzle, Better Auth, one-page app.
- **Fix:** push nhánh, mở PR vào `master` để CI chạy cả `pnpm build`. Merge chỉ khi xanh.

**P1-3. Nguy cơ hiệu năng `/` tụt mạnh so với prod cũ [commit]**
- **Prod cũ:** HTML tĩnh, cache HIT ở edge hkg1, LCP 0.83 s.
- **Bản mới có ba điểm làm chậm:**
  - `src/app/layout.tsx:104` gọi `cookies()`, nên **mọi route đều dynamic**, kể cả `/guide`, `/privacy`, `/terms`.
  - Function chạy ở `cle1` (`vercel.json`), xa người dùng Việt Nam. `/` còn gọi thêm `getSessionUser()`.
  - Timer chỉ render ở client (`app-home-client-only.tsx`, `ssr:false`), nên LCP phải chờ JS. Trace dev cho render delay 5.6 s (số dev chỉ để tham khảo).
- **Fix:**
  - SSR sẵn khung chữ số "25:00" trong placeholder để LCP vẽ ngay từ HTML.
  - Bỏ `cookies()` ở root layout (ngôn ngữ đặt theo URL segment hoặc phía client) để các trang landing chạy static/ISR.
  - Đo lại trên bản build prod với ngân sách phase-11: JS first load ≤ 200 kB.
  - Cân nhắc region `sin1`/`hkg1` kèm Neon `ap-southeast-1` nếu đa số người dùng ở Việt Nam.

**P1-4. Không có error tracking [commit]**
- Lỗi chỉ được ghi bằng `console.error`, ở `src/lib/api/responses.ts:10`, `src/components/shared/route-error.tsx:26` và `src/app/global-error.tsx:14`.
- Lần ra mắt này đổi cả DB lẫn auth, mà lỗi DB hay auth trên prod sẽ không ai thấy. Log runtime của Vercel giữ rất ngắn, nhất là ở gói Hobby.
- **Fix:** cài `@sentry/nextjs` (gói free), hoặc export `onRequestError` trong `instrumentation.ts` rồi gửi đi qua log drain.

**P1-5. Dời domain sau ngày ra mắt sẽ làm khách mất dữ liệu [commit]**
- Khách có session anonymous gắn cookie theo host, và cài đặt trong localStorage cũng theo origin.
- Nếu ra mắt trên `pomodoro-focus.site` rồi sau đó mới bật `DOMAIN_MOVE=1`, khách sẽ mất quyền vào dữ liệu server của họ và mất cài đặt local.
- **Fix:** ra mắt thẳng trên domain cuối và bật redirect ngay từ ngày đầu. DB bắt đầu rỗng nên lúc đó không có gì bị bỏ lại.

### P2

| # | Vấn đề | Bằng chứng | Fix |
|---|---|---|---|
| P2-1 | Gửi OTP chỉ bị giới hạn 3 lần/60 s theo IP, lưu trong memory của từng instance, không có giới hạn theo email. Kẻ xấu có thể dội email vào một địa chỉ và đốt quota Resend. [commit] | Rule mặc định của Better Auth (`dist/api/rate-limiter/index.mjs:314`); `src/lib/auth.ts:26-30` | Thêm `customRules['/email-otp/send-verification-otp']` (ví dụ 3 lần/10 phút), giới hạn theo email trong `sendOtpEmail`, thêm rule rate-limit ở Vercel Firewall hoặc Turnstile |
| P2-2 | Guest sign-in 5 lần/10 phút/IP sẽ chặn cả lớp học hay ký túc xá dùng chung NAT. User anonymous không bao giờ được dọn, trong khi Neon free chỉ có 0.5 GB. [commit] | `src/lib/auth.ts:29` | Nâng giới hạn; thêm cron xoá user anonymous không hoạt động quá 30 ngày (Vercel Cron) |
| P2-3 | `session-complete`: kiểm trần 24h nằm ngoài transaction, nên nhiều POST song song lọt qua. Không có idempotency key, nên outbox retry sau khi mất response sẽ tạo phiên trùng. [commit] | `src/app/api/tasks/session-complete/route.ts:26-31` so với `:44`; chính code thừa nhận ở `src/lib/timer/session-recorder.ts:13` | Thêm cột `client_session_id` unique và `ON CONFLICT DO NOTHING`; kiểm trần trong transaction kèm `pg_advisory_xact_lock(user)` |
| P2-4 | CSP mới ở Report-Only và không có `report-uri`/`report-to`, nên không ai đọc được report. `connect-src` thiếu `api.open-meteo.com` và `geocoding-api.open-meteo.com`, nên weather sẽ gãy khi chuyển sang enforce. [commit + WIP] | `next.config.ts:11-26`; `src/lib/weather/open-meteo.ts:7-8` | Thêm endpoint nhận report; thêm host open-meteo trước khi enforce |
| P2-5 | PGlite bị import tĩnh, nên WASM và data (~10 MB, ước lượng) bị trace vào mọi serverless function, làm cold start chậm hơn. [commit] | `src/db/index.ts:4,6`; `serverExternalPackages` | Chỉ `await import('@electric-sql/pglite')` trong nhánh local |
| P2-6 | A11y: trigger chọn ngôn ngữ ở footer không có tên; `text-ink-faint` không đạt tương phản: #71717a trên #0a0a0b = 4.09:1, light #8A95A0 ≈ 3:1, dùng ở 29 file; 5 nút chỉ có icon thiếu `aria-label`; nhãn "Close" của Dialog/Sheet viết cứng tiếng Anh; `/` không có `h1`. [commit] | `language-switcher.tsx:20`; `globals.css:241,281`; `preset-chips.tsx:166,172,211`; `youtube-pane.tsx:265,275`; `dialog.tsx:51`, `sheet.tsx:69`; Lighthouse `button-name`, `color-contrast` | Thêm `aria-label`; tăng sáng token (dark khoảng #8b8b94); i18n chữ "Close"; thêm h1 sr-only hoặc h1 thật cho phần SEO |
| P2-7 | GA: ID là container GTM (`GTM-NXW9Z4LK`) nhưng nạp bằng `gtag.js` và `gtag('config')`. Mỗi lần tải đầu gửi page_view 2 lần (inline config và `GATracker` lúc mount). Không có consent banner. [commit] | `layout.tsx:143-157`; `src/components/trackings/ga.tsx` | Dùng measurement ID dạng `G-…` (hoặc snippet GTM đúng chuẩn); tắt `send_page_view` ở config đầu; kiểm GA có nhận dữ liệu |
| P2-8 | `/api/stats` không truyền khoảng ngày thì kéo toàn bộ phiên của user lên rồi cộng bằng JS. Streak vẫn tính theo ngày UTC (open từ 10/01). [commit] | `src/app/api/stats/route.ts:11,40-44` | Aggregate bằng SQL `GROUP BY` ngày theo `Asia/Ho_Chi_Minh` hoặc timezone của user |
| P2-9 | Không có backup ngoài PITR của Neon (cửa sổ tuỳ gói), không có uptime monitor. [commit] | — | GitHub Action `pg_dump` hằng tuần; UptimeRobot gọi `/` và `/api/auth/ok` |
| P2-10 | Nếu Preview dùng chung `DATABASE_URL` với prod thì preview sẽ ghi vào dữ liệu thật. [cấu hình] | — | Dùng Neon branch cho môi trường Preview (Neon–Vercel integration) |
| P2-11 | Font: 3 họ, 7 weight, mỗi họ 2 subset, thành 12 file woff2 được preload ngay lúc first paint (~126 kB). [commit] | `layout.tsx:16-35`; danh sách request mạng | `preload:false` cho JetBrains Mono và Space Grotesk, hoặc giảm số weight |

### P3

- **Ratchet chất lượng đã cũ:**
  - Lint 94 warning nhưng CI vẫn cho phép 189. Hạ xuống 93 và thêm `coverage/**` vào `globalIgnores`.
  - Coverage thật 26/22/22/26 trong khi ngưỡng là 14/13/11/14. Nâng ngưỡng lên ~25/21/21/25.
- **Code chết** (không file nào import):
  - `ui/loader`, `ui/animated-icons`, `ui/animated-list`, `ui/scroll-area`, `ui/radio-group`, `ui/table`;
  - `animate-ui/components/buttons/ripple`, `animate-ui/icons/bot-message-square`, `animate-ui/icons/clock`;
  - `components/focus/streak-tracker`, `components/audio/youtube/index.ts`, `app-shell/open-panel-button`, `lib/prompts/bro-ai-system`, `config/feature-gate`.
  - Vì `feature-gate` không ai dùng, cờ `NEXT_PUBLIC_FEATURE_HISTORY` không chặn `/api/history` và `/api/stats`.
- **Dependency thừa:** `@react-three/drei` (0 import); `@radix-ui/react-scroll-area` và `@radix-ui/react-radio-group` (chỉ file chết dùng).
- **Di sản Supabase:** `supabase_schema.sql` (còn `DROP TABLE`), `fix_sessions_rls.sql`, `migrations/` (12 file, 2 file rỗng). Nên xoá.
- **Tài sản nặng:**
  - `backgrounds-source/` 175 MB, 26 file được track, file lớn nhất 21 MB.
  - `prebuild` encode AVIF bằng sharp ở **mọi** build CI và Vercel, vì output nằm trong `.gitignore`.
  - `public/images/content_1/pomodoro_explain.png` 3.9 MB không được dùng.
  - Bước prebuild ghi đè `public/mascot/wolf_cute.png` (1.6 MB), một file đang được track.
- **Thư mục trùng tên:** `.Jules/` và `.jules/` trùng tên trên ổ đĩa không phân biệt hoa thường, nên git luôn báo modified.
- **Redirect thừa:**
  - `manifest.json` để `start_url` và shortcuts là `/timer`, `/tasks`, đều phải đi qua 308.
  - Error boundary `homeHref="/timer"` (`src/app/(main)/error.tsx`).
- **Biên đầu vào:**
  - Độ dài từng tag của task không bị giới hạn (`task-schemas.ts:78-85`).
  - `display_order` không có trần, tràn int4 thành lỗi 500 thay vì 400 (`task-schemas.ts:229-234`, `reorder/route.ts:17`).
  - Không giới hạn số task mỗi user, không rate limit `POST /api/tasks`.
- **DB:**
  - Enum `mode`, `status`, `priority`, `type` chỉ kiểm ở TS, không có CHECK ở DB.
  - Thiếu index `focus_sessions(task_id)` và `feedbacks(user_id)`, nên `ON DELETE SET NULL` phải quét cả bảng.
- **Audit:** `pnpm update` hoặc dùng `pnpm.overrides` cho picomatch, browserslist và @babel/core.
- **Preload panel:** khi rảnh, app preload cả 5 panel (`panel-loaders.tsx:64-75`), tốn data trên mạng di động. Bỏ qua khi `navigator.connection.saveData`.
- **`.env.example`:** thiếu `DOMAIN_MOVE`.
- **[WIP]** `/api/weather/locate` bị gọi 2 lần mỗi lần tải. Có thể chỉ do StrictMode ở dev; cần kiểm trên bản build.

### Điểm tốt (giữ nguyên)

- **API:**
  - Mọi route đều kiểm `getSessionUser()` và lọc theo `userId`. Không thấy IDOR ở tasks, clone, reorder, templates, history, stats, tags, export, delete.
  - `serverError` trả thông báo chung, không lộ lỗi nội bộ.
  - Xoá và export tài khoản có `sameOriginJsonGuard`; export bị rate limit.
- **DB và dữ liệu:**
  - Schema Drizzle khớp snapshot `0001`. FK cascade đầy đủ, có index composite cho các query nóng.
  - `moveGuestData` chạy trong transaction và có test.
- **Scene và hiệu ứng:**
  - Scene WebGL giới hạn 30 fps (24 fps trên máy yếu), dừng khi tab ẩn hoặc khi panel mở, và vẽ 1 frame tĩnh khi bật reduced-motion.
  - 3D, game và panel đều được tải động.
- **Accessibility:** có skip link; landmark `main`, `header`, `footer`, `nav` đầy đủ; Dialog và Sheet của Radix có sẵn focus trap.

---

## 3. Đối chiếu finding ngày 2026-10-01

| Finding 10/01 | Trạng thái 10/05 | Bằng chứng |
|---|---|---|
| Schema `tasks`/`sessions` không tái tạo được | **Đã xử lý** | `drizzle/0000_init.sql` và `0001`, snapshot khớp `schema.ts`. Thư mục `migrations/` cũ còn sót (P3) |
| Open redirect ở `auth/callback` | **Không còn** | Route Supabase đã gỡ, callback do Better Auth xử lý |
| RPC `increment_task_pomodoro` SECURITY DEFINER | **Không còn** | Cập nhật trong transaction (`session-complete/route.ts:44-59`) |
| `/api/chat` không giới hạn chi phí | **Không còn** | Chat đã gỡ |
| `session-complete` không validate | **Đã xử lý**; còn race và thiếu idempotency | P2-3 |
| Bug timer làm sai dữ liệu | **Đã xử lý** | Outbox và claim; `session-recorder` coverage 95% |
| Optimistic update tasks sai query key | Đã xử lý theo báo cáo 10/01 | Không kiểm lại runtime |
| Build bỏ qua lỗi, không có CI, lỗi TS | **Đã xử lý** | tsc 0 lỗi, lint 0 error, có CI. Nhưng CI chưa chạy trên nhánh này (P1-2) |
| Không có security headers, image proxy mở `**` | **Đã xử lý trong code** | Header đủ trên local. Prod cũ chỉ có HSTS. CSP vẫn Report-Only (P2-4) |
| Canonical và hreflang sai | **Đã xử lý**, nhưng phát sinh lỗi mới | Canonical trỏ vào tên miền chưa đăng ký (P0-1) |
| `NEXT_PUBLIC_MEGALLM_API_KEY` | **Còn mở** | Vẫn nằm trong `.env` local, code không dùng. Thêm rò rỉ Groq (P0-2) |
| PostgREST filter injection | **Không còn** | Drizzle tham số hoá, có `sanitizeSearchTerm` |
| `parent_task_id` của user khác, vòng lặp | **Không còn** | Đã bỏ subtask |
| Feedback bị spam, giả `user_id` | **Đã xử lý** (best-effort) | Validate, rate limit IP trong memory, `user_id` lấy từ session |
| Lộ `error.message` nội bộ | **Đã xử lý** | `responses.ts` |
| Thiếu index | **Đã xử lý chính** | Còn `task_id` và `feedbacks.user_id` (P3) |
| Stats/history kéo hết rows | **Một phần** | History có limit; stats còn (P2-8) |
| Streak tính theo ngày UTC | **Còn mở** | `stats/route.ts:11` |
| Reorder N lệnh UPDATE không atomic | **Đã xử lý** | Có transaction, tối đa 500 |
| Leaderboard lộ dữ liệu | **Không còn** | Đã gỡ |
| PWA hỏng | **Một phần** | Icon và manifest ổn, chưa có service worker; `start_url` vẫn `/timer` (P3) |
| Thiếu error/loading boundary | **Đã xử lý** | |
| Không có quản lý tài khoản | **Đã xử lý** | Delete và export, cascade |
| Font thiếu subset tiếng Việt, không tôn trọng reduced motion | **Đã xử lý** | |
| Dependency thừa hoặc trùng | **Đã xử lý**; có thừa mới | `@react-three/drei` và 2 gói Radix (P3) |
| File rác bị track | **Một phần** | Đã hết `build.log` và `.py`; còn SQL Supabase, `migrations/`, `backgrounds-source` |
| README và `.env.example` sai | **Đã xử lý** | `.env.example` thiếu `DOMAIN_MOVE` |

---

## 4. Checklist sẵn sàng deploy

| Hạng mục | Trạng thái |
|---|---|
| Tên miền chuẩn đã đăng ký, trỏ về Vercel, có SSL | ❌ `pomodorostudy.online` chưa đăng ký (P0-1) |
| `NEXT_PUBLIC_SITE_URL` khớp domain thật | ❓ Không xem được env Vercel |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | ❓ |
| `DATABASE_URL` (Neon, pooled) đặt cho Production; Preview dùng branch riêng | ❓ (P2-10) |
| Đã chạy migration trên Neon (`0000`, `0001`) | ❓ Chưa có bước tự động (P1-1) |
| `RESEND_API_KEY`, và `EMAIL_FROM` thuộc domain đã verify | ❌ Phụ thuộc P0-1 |
| `GOOGLE_CLIENT_ID/SECRET` và redirect URI `<BETTER_AUTH_URL>/api/auth/callback/google` | ❓ (tuỳ chọn) |
| `NEXT_PUBLIC_GA_ID` đúng định dạng | ⚠️ Prod đang là `GTM-…` (P2-7) |
| Gỡ env cũ trên Vercel (Supabase, MegaLLM, `NEXT_PUBLIC_MEGALLM_API_KEY`) | ❓ |
| `DOMAIN_MOVE` chỉ bật khi domain mới đã chạy | ✅ Có cờ trong code |
| Region `cle1` cạnh Neon us-east-2 | ✅ cho latency DB / ⚠️ xa người dùng VN (P1-3) |
| `.vercelignore` loại `.env*`, `.pglite`, `plans` | ✅ |
| Nhánh đã push, CI xanh (gồm build) | ❌ (P1-2) |
| WIP weather đã commit hoặc stash, CSP có host open-meteo | ❌ Đang làm dở |
| Error tracking và uptime | ❌ (P1-4, P2-9) |
| Báo người dùng cũ về dữ liệu | ⚠️ Plan v2 phase-02: dữ liệu Supabase cũ "không chuyển được", DB mới bắt đầu rỗng |
| Gia hạn `pomodoro-focus.site` (hết hạn 2026-11-11) | ❌ |

---

## 5. Câu hỏi chưa giải quyết

1. Chọn domain nào: mua `pomodorostudy.online` hay giữ `pomodoro-focus.site`? Toàn bộ copy, email và chính sách đang ghi domain mới.
2. Neon prod đã được migrate chưa, đặt ở region nào? Phần lớn người dùng ở Việt Nam hay ở nước ngoài? Câu trả lời quyết định có dời region không (P1-3).
3. Trên Vercel đang có những env nào? `NEXT_PUBLIC_MEGALLM_API_KEY` còn không? Project dùng gói Hobby hay Pro (ảnh hưởng thời gian giữ log và firewall)?
4. Groq key trong `.env` có còn hoạt động không, và đang dùng ở đâu?
5. Prod cũ phụ thuộc Supabase đã chết (theo plan v2). Đăng nhập và tasks trên prod hiện có đang hỏng không? Nếu có thì việc ra mắt nhánh này càng gấp.
6. Có xoá `backgrounds-source` (175 MB) khỏi lịch sử git không? Việc này cần force-push và đang chờ chủ dự án xác nhận từ phase-00.
