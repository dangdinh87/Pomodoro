# Code review `feat/design-system` trước PR đầu tiên

Ngày 2026-10-05. Phạm vi: `git diff ae77704..HEAD` (HEAD = ef74c72, 124 commit, 468 file), đọc bản commit bằng `git show HEAD:...`, bỏ qua working tree của batch 4a và WIP weather. Số dòng dưới đây là dòng của HEAD. Chạy lại `src/app/api/stats/route.test.ts`, `session-complete/route.test.ts`, `src/lib/stats`: 71/71 pass. Không chạy `next build` (nên phần static/dynamic chưa kiểm chứng).

Tổng: P0 = 0, P1 = 2, P2 = 5, P3 = 13.

---

## P1

### P1-1. Rời `(main)` bằng client navigation làm engine timer unmount: timer lệch, mất alarm, mất session
- Nơi: `src/features/timer/hooks/use-timer-engine.ts:295-317` (HEAD), mount duy nhất ở `src/features/timer/components/enhanced-timer.tsx:24` (trong `[lang]/(main)`); lối ra cùng tab: `src/features/app-shell/command-palette.tsx:166`, `src/components/layout/user-menu.tsx:88` (`router.push('/guide')`), `src/components/landing/Footer.tsx:50-51` (link Guide / Shortcuts ngay dưới app, kể cả `/guide#shortcuts`), `/privacy`, `/terms`.
- Kịch bản: focus 25:00 đang chạy, còn 5:00 (`deadlineAt = D`, store `timeLeft = 300`). User mở Guide bằng palette/menu/footer. `(landing)` layout không có engine, `(main)` bị unmount, interval và timeout bị dọn. 3 phút sau bấm quay lại `/`: engine mount lại, store trong bộ nhớ vẫn `isRunning=true, timeLeft=300 (cũ)`. Dòng 306-310: `|deadlineAt - (now + timeLeft*1000)| = 180 s > 2 s` nên `deadlineIsValid=false`, dòng 315-316 ghi đè `deadlineAt = now + 300 s`. Kết quả: 3 phút ngoài trang bị xoá khỏi đồng hồ (như pause ngầm). Nếu ở Guide quá deadline thì không có alarm, không có session, không có catch-up (catch-up chỉ chạy khi reload vì `merge` mới tính lại `timeLeft` từ `deadlineAt`). Ambient audio vẫn chạy (singleton) còn YouTube thì mất (xem P2-3).
- Fix tối thiểu: khi engine mount (đầu effect chính, trước khi arm), nếu `isRunning && deadlineAt` thì tính lại `timeLeft = ceil((deadlineAt-now)/1000)`; `<= 0` thì gọi `handleLoopComplete(true)` (đường catch-up đã có). Cách gọn: gọi `useTimerStore.persist.rehydrate()` một lần ở effect mount (merge đã làm đúng việc này). Fix đúng hơn: đưa engine + `YouTubeMiniPlayer` + `AuthSessionSync` lên layout dùng chung cho `(main)` và `(landing)` (hoặc `[lang]/layout`) để timer chạy xuyên mọi trang. Thêm test: unmount engine, advance clock 3 phút, mount lại, kỳ vọng `timeLeft` giảm 180.

### P1-2. Cổng deploy: mặc định `SITE_URL=https://studywithbro.com` trong khi domain mới chưa chạy
- Nơi: `src/config/site.ts:7` (default), mọi canonical/hreflang/sitemap/robots/OG/JSON-LD đi qua `src/lib/seo/urls.ts`; `src/lib/email/send-otp-email.ts:20` (`from: no-reply@${SITE_HOST}`).
- Kịch bản: merge PR vào master khi production vẫn là `www.pomodoro-focus.site` và `NEXT_PUBLIC_SITE_URL` chưa set (biến này inline lúc build): mọi trang khai canonical + hreflang + sitemap trỏ sang origin không phân giải được, Google bỏ qua trang hiện tại. Email OTP gửi từ domain chưa verify ở Resend nên bị từ chối, đăng nhập bằng email hỏng (lỗi chỉ lên Sentry/log). `DOMAIN_MOVE` chưa bật nên domain cũ không redirect, đúng nhưng cũng nghĩa là hai thứ lệch nhau.
- Fix: trước khi merge đặt trên Vercel `NEXT_PUBLIC_SITE_URL=https://www.pomodoro-focus.site` và `EMAIL_FROM` đã verify; khi cutover đổi cả hai cùng `DOMAIN_MOVE=1` và redeploy. Kèm theo: `db-migrate.yml` chạy song song với deploy Vercel, code mới ghi/đọc `focus_sessions.client_session_id` (0002) nên phải chạy migrate xong rồi mới promote deploy (hoặc bật workflow trước một lần).

---

## P2

### P2-1. Máy ngủ rồi thức: session hoàn thành "ma", alarm trễ hàng giờ, tính sai ngày
- Nơi: `use-timer-engine.ts:176-179` (`stale` chỉ khi `catchUp`), `:357` (`handleLoopComplete()` không truyền `catchUp` từ tick/timeout/visibility).
- Kịch bản: 23:50 start focus 25 phút, gập laptop sau 1 phút, 14:00 hôm sau mở lại cùng tab (JS tiếp tục, không reload). Tick thấy `remaining<=0` nên `catchUp=false`: phát alarm, ghi session `durationSec = lastSessionTimeLeft = 1500`, `completedFullSession=true` (task nhận 1 pomodoro), `endedAt = deadline` (23:55 hôm qua), tức cộng vào ngày hôm qua dù chỉ focus 1 phút. Cơ chế `stale` (15 phút) chỉ bảo vệ đường reload.
- Fix: trong tick/timeout/visibility tính `late = Date.now() - deadline`; nếu `late > CATCH_UP_GRACE_MS` thì gọi `handleLoopComplete(true)` (không alarm, không auto-start, stale thì không ghi).

### P2-2. Hai cửa sổ cùng hiện: `claimCompletion` check-then-set không nguyên tử, hai client id khác nhau
- Nơi: `src/lib/timer/completion-claim.ts:31-33`; `use-timer-engine.ts:165,217` (`record()` sinh `newId()` mới mỗi tab).
- Kịch bản: hai tab/cửa sổ cùng nhìn thấy (2 màn hình), timeout deadline của cả hai nổ trong vài ms; cả hai `getItem` chưa thấy claim rồi cùng `setItem`, cả hai trả `true`, cả hai gọi `recordSession` với `clientSessionId` khác nhau nên server insert 2 dòng, task +2 pomodoro, `timeSpentMs` gấp đôi. Comment "vài micro giây" sai vì hai tab là hai tiến trình khác nhau; cap 24h không chặn.
- Fix: làm id idempotent theo pha: đặt `clientSessionId = ${mode}:${deadlineAt}` (đúng với regex server `^[A-Za-z0-9_-]{8,64}$` nếu đổi `:` thành `_`) cho các record từ `handleLoopComplete`, thay vì UUID ngẫu nhiên. Server đã dedupe theo `(user_id, client_session_id)` nên race hết thành no-op. Hoặc bọc claim bằng `navigator.locks` như `flushSessionQueue` đã làm.

### P2-3. YouTube "đang phát" nhưng iframe đã mất khi cây `[lang]` remount
- Nơi: `src/lib/audio/youtube-controller.ts:101,218,264` (player gắn vào `#youtube-player-slot`), `src/components/providers/app-providers.tsx:47` (mini player trong `(main)`), `src/contexts/i18n-context.tsx` `setLang` (`router.push` sang `/vi`...).
- Kịch bản: đang phát YouTube, đổi ngôn ngữ (hoặc đi `/guide` như P1-1). Segment `[lang]` đổi giá trị nên cây con unmount/mount, slot cũ rời DOM cùng iframe, âm thanh dừng. Nhưng `player` (module), `useYouTubeStore.status='playing'`, `audioStore.currentlyPlaying` vẫn còn: thẻ mới hiện nút Pause, bấm gọi `playVideo/pauseVideo` lên iframe đã chết, không có gì xảy ra; chỉ nút X mới dọn được. (Suy luận từ code, chưa thử trên trình duyệt.)
- Fix: trong `YouTubeMiniPlayer` thêm effect mount: nếu `useYouTubeStore.source` còn mà `#youtube-player-slot` không chứa iframe thì `stopYouTube()` (hoặc `playYouTube(source)` lại); hoặc hoist player lên layout bền như P1-1.

### P2-4. Hai endpoint công khai bơm thẳng vào Sentry/log, quota dễ cạn
- Nơi: `src/app/api/csp-report/route.ts:44` (tối đa 10 violation/request x 60 request/phút/IP = 600 event/phút/IP), `src/app/api/client-error/route.ts:36` (20/phút/IP, guard chỉ kiểm `Origin` nếu có nên `curl` qua được). Limiter in-memory theo từng instance. Mỗi event: một dòng `console.error` + một POST Sentry.
- Kịch bản: một vòng lặp `curl` gửi báo cáo giả làm hết quota Sentry của tháng trong vài phút và lấp log Vercel.
- Fix: dedupe theo `(source, name, message, route)` trong 1-5 phút trên mỗi instance trước khi gọi Sentry; CSP: chỉ forward tối đa N event/phút toàn instance (đếm global), phần còn lại chỉ log gộp. Cân nhắc rule Vercel Firewall cho `/api/csp-report` và `/api/client-error`.

### P2-5. OTP limiter: khoá đăng nhập có chủ đích một email, một đường gửi mail chưa được chặn, key không giới hạn độ dài
- Nơi: `src/lib/auth/otp-limits.ts:22` (`OTP_PATHS`), `:37` (key `otp-email:${email}`).
- (a) Giới hạn theo địa chỉ là toàn cục (3 mã/10 phút, "whoever asks") và bằng đúng hạn mức theo IP: một IP gửi 3 request/10 phút cho `victim@x.com` là đủ để nạn nhân không xin được mã nào (khoá đăng nhập email có chủ đích, kéo dài vô hạn). Fix: đây là đánh đổi của thiết kế; giảm thiệt bằng cách tăng trần theo email lên cao hơn trần theo IP (vd 5-6) và cho Google/lối khác luôn dùng được, hoặc ít nhất ghi nhận rủi ro.
- (b) `/forget-password/email-otp` (deprecated nhưng vẫn đăng ký trong plugin, `routes.mjs:515`) gửi mã tới email đã tồn tại, chỉ bị luật mặc định của plugin (3/60 s/IP), không qua hook theo email. Fix: thêm vào `OTP_PATHS` (và `/email-otp/request-email-change` phòng khi bật `changeEmail`).
- (c) `assertOtpEmailAllowed` nhận chuỗi `email` bất kỳ độ dài làm key Map trước khi Better Auth validate; body vài MB x hàng nghìn key (ngưỡng prune 10k) là vài GB RAM. Fix: `if (email.length > 254) return;` trước `consumeRateLimit`.

---

## P3

1. `src/proxy.ts:26` + `locale-routing.ts:48`: matcher/`NON_PAGE_SEGMENTS` chưa loại `_vercel` (next-intl khuyến nghị loại). Nếu request `/_vercel/insights/view` đi qua proxy thì bị rewrite sang `/en/_vercel/...` rồi 404, mất beacon Analytics. Chưa xác nhận trên Vercel; thêm `_vercel` vào cả hai chỗ, rẻ và an toàn.
2. `src/lib/stats/study-day.ts:43-59`: `formatters` Map khoá theo chuỗi tz người dùng gửi; `Intl` không phân biệt hoa thường nên `ASIA/saigon`, `asia/SAIGON`... là vô hạn key (Postgres cũng chấp nhận) → rò bộ nhớ có xác thực. Fix: khoá theo `resolvedOptions().timeZone` hoặc giới hạn kích thước (xoá khi >100).
3. `src/lib/api/in-memory-rate-limiter.ts:33-40`: khi đầy, xoá theo thứ tự chèn (không phải LRU) nên kẻ gửi 10k key mới vẫn đẩy được bucket đang bị giới hạn của nạn nhân ra, ngược với comment. Hơn nữa mỗi request sau khi đầy tốn O(n). Fix: xoá bucket hết hạn trước (đã làm), nếu vẫn đầy thì từ chối key mới (fail-closed) cho key OTP/feedback.
4. `src/app/api/feedback/feedback-schema.ts:1` import `FEEDBACK_TYPES` từ `@/db/schema`; `src/features/feedback/feedback-form.ts:1` (client) import file này, kéo `drizzle-orm/pg-core` + toàn schema vào chunk panel feedback. Fix: để hằng số trong file thuần (`src/lib/feedback/types.ts`) và để schema.ts import từ đó.
5. `src/features/timer/components/timer-controls.tsx:73-78,172-175`: dialog xác nhận Skip không đóng khi phase tự hoàn thành (engine không bao giờ đặt `timeLeft=0`), nên bấm Xác nhận sau đó skip nhầm phase break kế tiếp. Reset dialog đã có `askedMode`; làm tương tự.
6. `src/lib/auth/move-guest-data.ts:14`: `UPDATE focus_sessions SET user_id` vi phạm unique `(user_id, client_session_id)` nếu cùng một `clientSessionId` đã tồn tại ở tài khoản đích (hai tab flush cùng item, một lần dưới guest, một lần dưới tài khoản thật) → transaction lỗi → hook link lỗi → đăng nhập thất bại. Hiếm; fix: `DELETE` bản trùng của guest trước khi update.
7. `src/app/api/tasks/route.ts` + `task-limit.ts:17`: giới hạn 2000 chỉ đếm `is_deleted=false`; xoá mềm rồi tạo tiếp là vô hạn hàng. Fix: đếm cả đã xoá mềm hoặc purge định kỳ.
8. `src/hooks/use-youtube-player.ts:25`: `u.hostname.includes('youtube.com')` nhận cả `youtube.com.evil.com` và `evilyoutube.com`; id không được chèn vào HTML (đã kiểm) nên không XSS, chỉ là kiểm tra host lỏng. Fix: `hostname === 'youtube.com' || endsWith('.youtube.com')`.
9. `src/lib/timer/session-recorder.ts:157`: mọi 4xx (kể cả 429 từ WAF/Firewall nền tảng, 403) đều `drop` vĩnh viễn session. Chỉ 429 "Daily session limit exceeded" mới nên drop; đặt `code` trong body 429 của route và kiểm trong `send`, các 429 khác coi như `server` (retry).
10. `session-recorder.ts:224`: sau `ensureSession()` luôn gắn `guest: true` kể cả khi `getSession()` trả về user thật (store lỗi thời). Item đó sau này bị `flushLocked` (`:272`) chuyển nhà sang bất kỳ tài khoản thật khác đăng nhập trên cùng trình duyệt. Fix: dùng `guest: guest.isAnonymous`.
11. `cookieCache` 5 phút (`src/lib/auth.ts:23`) + `DELETE /api/account`: sau khi xoá tài khoản, session cache còn hiệu lực tối đa 5 phút nên POST `session-complete`/tasks đụng FK và trả 500 (bị báo lỗi lên Sentry). Hiếm; client nên `signOut()` ngay sau xoá (kiểm tra panel account).
12. `/api/stats`: `completedSessions` đếm số dòng `work`, bao gồm đoạn cụt do đổi task/skip/reset (không có cột `completedFullSession` trong `focus_sessions`), và streak tính theo bất kỳ đoạn work ≥ 1 giây. Quyết định sản phẩm; nếu muốn "Sessions" = số pomodoro thật cần thêm cột hoặc lọc `duration`.
13. `src/contexts/i18n-context.tsx` + `[lang]/layout.tsx`: toàn bộ từ điển một ngôn ngữ (76-93 KB JSON) được serialize vào RSC payload của mọi trang kể cả guide/privacy; chấp nhận được, ghi lại để theo dõi cỡ HTML. Cũng `GuestOnly` ẩn khối SEO của thành viên sau hydrate gây CLS nhỏ.

---

## Đã kiểm tra, ổn (verified OK)

**Session và timer**
- Idempotency: unique `(user_id, client_session_id)` + `onConflictDoNothing` cùng đúng target; NULL không xung đột; retry trả `{duplicate:true}` trước cả bước cap nên retry sau khi chạm cap vẫn được ack (`session-complete/route.ts:34-41,77-79`).
- Cap 24h nằm trong transaction sau `pg_advisory_xact_lock(hashtext(user.id))`; cửa sổ `(endedAt-24h, endedAt]`; driver `neon-serverless` Pool hỗ trợ transaction.
- `completedFullSession` chỉ true ở nhánh hoàn thành tự nhiên (engine `:217-224`); skip/reset/đổi task truyền false; server chỉ cộng `actualPomodoros` khi `mode==='work'` và task thuộc user.
- `endedAt` clamp `[now-7d, now+5m]`, ngoài khoảng dùng giờ server; client tạm hạn 24h và 20 item, báo toast khi rơi.
- Outbox: item ghi trước khi gửi, `sendingAt` chống flush đôi, mọi sửa đổi qua `updateQueue` đồng bộ (không giữ snapshot qua await), `navigator.locks` giữa các tab, rehome item guest khi đăng nhập thật; double-fire interval + `setTimeout` deadline bị chặn bởi `isCompletingRef` + `claimedLocally` + claim localStorage trong cùng tab.
- Migration persisted: timer-store v2 (flip `autoStartWork` một lần), `merge` điền mặc định, không crash với state cũ thiếu trường; audio-store v4 migrate/sanitize mix ổn.
- Auto-chain: focus luôn nối sang break, break nối sang focus chỉ khi có người hiện diện, long break luôn dừng chuỗi (`auto-chain.ts`).

**Stats theo múi giờ**
- `tz` là bound parameter (không nội suy), `IANA_SHAPE` + `Intl` kiểm trước; `interval '4 hours'` là hằng; `GROUP BY 1,2` đúng; SQL (`ts AT TIME ZONE tz - 4h`) và JS (`wall - 4h`) cùng số học wall-clock nên khớp qua DST; cửa sổ `[start, end)` ngày 23h/25h đúng (đã dò tay ngày fall-back NY); streak tính theo `today` của đúng tz; hình dạng JSON `summary/dailyFocus/distribution` khớp `StatsData` và `week-chart`/`streak-heatmap` đọc khoá `yyyy-MM-dd` không qua `new Date()` UTC.

**Auth, rate limit, riêng tư**
- Anonymous 30/10 phút theo IP, OTP 3/10 phút theo IP (luật `customRules` thắng luật mặc định của plugin) và theo email (hook `before` đứng sau limiter IP, trả 429 có `code`); XFF được Vercel ghi đè nên `getClientIp` đáng tin trên nền tảng này.
- Scrub: email, Bearer/Basic, query URL, `params:` của drizzle, stack bỏ dòng message; route bỏ query; Sentry client tự viết không đọc header/body/cookie; `timeout` 2 s; DSN parse chặt.
- `readCappedText` dừng đọc khi vượt cap; `client-error` cần JSON + same-origin; `csp-report` giới hạn 16 KB, 10 violation/request, bỏ extension.

**Routing, SEO**
- `resolveLocaleRoute`: `/`→rewrite `/en`, `/en/*`→308 về URL không tiền tố (không vòng lặp vì rewrite là nội bộ), legacy theo từng locale giữ nguyên query, `/fr` & `/FR` → 404, `//host` không thành open redirect, file có dấu chấm/`/api`/`/_next`/`/dev` không đi qua proxy, `/opengraph-image` được rewrite rồi phục vụ bởi `[lang]/opengraph-image` (URL absolute ghi sẵn trong metadata, route không có hậu tố hash vì cha không phải group).
- `buildPageMetadata`/`urls.ts`/sitemap cùng một nguồn: canonical tự tham chiếu, hreflang 3 ngôn ngữ + x-default = EN, sitemap 4 trang x 3 ngôn ngữ kèm alternates, `lastModified` cố định; JSON-LD escape `<`; không còn `cookies()/headers()` trong cây `[lang]` (chỉ `session-user.ts` cho API); trang `(main)` không chứa dữ liệu thành viên.
- `GoogleAnalytics`: ID kiểm regex `^(G|GTM)-[A-Z0-9]+$` trước khi vào script nội tuyến.

**i18n**
- Mọi khoá `t('...')`/chuỗi dạng khoá tìm được trong HEAD đều tồn tại trong en/vi/ja (script quét tĩnh, 0 thiếu; khoá động dạng `${key}.title` đã kiểm tay). `useSyncExternalStore` có server snapshot nên banner gợi ý ngôn ngữ và `GuestOnly` không gây mismatch hydration.

**Header, CSP, YouTube**
- CSP Report-Only bao YouTube (script, frame, nocookie), GTM/GA4, open-meteo, oEmbed; `X-Frame-Options: DENY` bù cho `frame-ancestors` bị bỏ qua ở chế độ report-only; id video/list không chèn vào HTML (chỉ vào API YT và URL oEmbed đã `encodeURIComponent`).

---

## Chưa kiểm chứng được / câu hỏi mở
- Không chạy `next build` (và `.next` bị chặn đọc): chưa xác nhận 12 trang là `○ Static`, và `/vi/nope` render 404 trong ngôn ngữ ở production (3a đã ghi là cần CI xác nhận). `dynamicParams=false` đặt ở layout có áp cho `[...rest]` hay không cũng chưa rõ.
- P2-3 và `<html>` remount khi đổi ngôn ngữ bằng `router.push` (React 19 singleton): cần thử trên trình duyệt thật (mất `data-theme` do next-themes trong lúc remount? flash?).
- `_vercel` (P3-1): Vercel có chặn `/_vercel/insights/*` trước proxy hay không, chưa xác nhận.
- Dữ liệu cũ: migration 0003 thêm CHECK; nếu Neon production đã có dòng lệch giá trị (task status/priority, feedback type) thì job `db-migrate` sẽ fail ở lần chạy đầu. Cần biết DB Neon production hiện trống hay có dữ liệu import từ Supabase.
