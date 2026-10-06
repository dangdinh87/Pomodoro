# Sửa các phát hiện của code review trước PR (2026-10-05)

Nhánh `feat/design-system`. Nguồn: `plans/reports/code-review-261005-branch-prelaunch.md`. Mỗi lỗi logic: test đỏ trước, rồi sửa, commit qua `commit-own.py` (một commit một phát hiện). Không đụng WIP weather; locale chỉ stage đúng hunk của mình (`--shared`).

## Kết quả theo phát hiện

| Phát hiện | Cách sửa | Commit | Test |
|---|---|---|---|
| **P1-1** engine unmount khi rời `(main)` bằng client navigation | Gốc: effect mount đầu tiên của `useTimerEngine` tính lại `timeLeft = ceil((deadlineAt - now)/1000)` từ deadline đã lưu khi `isRunning`; vòng chính không còn thấy deadline "lệch" nên không ghi đè. Deadline đã qua thì `timeLeft=0` và đi đường catch-up có sẵn (ghi một lần, `endedAt` = deadline thật, im lặng, không auto-start, tôn trọng claim đa tab). | `6457dda` | +6 test engine: vắng 3 phút thì còn đúng gốc trừ 3 phút và hoàn thành ở deadline gốc; vắng từ lúc mới chạy; deadline qua khi vắng = đúng 1 lần ghi (cả StrictMode); tab khác đã claim thì không ghi; timer đang dừng không bị đụng |
| **P2-1** máy ngủ rồi thức | `handleLoopComplete` tự tính độ trễ: deadline cũ hơn `CATCH_UP_GRACE_MS` (15 phút) thì `stale` bất kể ai gọi (tick, timeout, visibility, mount): không chuông, không thông báo, không ăn mừng, không auto-start, không ghi session, không cộng đếm; chỉ hiện toast nhẹ `timer.staleEnded` (en/vi/ja). Trong 15 phút vẫn là hoàn thành thật, ghi ở `endedAt = deadline` (ngày học của lúc kết thúc, không phải lúc mở máy). | `96d7ff2` | +7 test: ngủ 14 giờ (focus và nghỉ), thức qua visibilitychange, trễ 10 phút vẫn rung và ghi đúng `endedAt`, reload quá hạn có toast, reload trong hạn không toast, tab thua claim không toast |
| **P2-2** race claim giữa hai cửa sổ | `phaseSessionId(mode, deadlineAt)` = `work_<deadline>` (khớp regex server). Engine truyền làm `clientSessionId` cho bản ghi hoàn thành tự nhiên; `recordSession` nhận `payload.clientSessionId`, không thêm item thứ hai vào outbox nếu đã có cùng id, vẫn gửi để server dedupe. Claim giữ nguyên, nhưng comment sửa lại là không dựa vào nó. Đoạn lẻ (đổi task, skip, reset) vẫn dùng id ngẫu nhiên. | `1e1b4e6` | +4 `phaseSessionId`, +4 recorder (id truyền đi, 1 item cho 2 cửa sổ, id ngẫu nhiên khi không truyền), engine kiểm id |
| **P2-3** YouTube "đang phát" nhưng iframe mất | Chọn "dừng" (đơn giản và đúng hơn "tạo lại", vì tạo lại có thể phát nhạc khi người dùng đang pause và mất vị trí): `YouTubeMiniPlayer` unmount thì `stopYouTube()`; áp dụng cho cả đổi ngôn ngữ lẫn rời `(main)` sang `/guide`. Thêm: bỏ `stopVideo` khi iframe đã rời DOM (tránh cảnh báo "not attached to the DOM"). | `5e08c5b`, `54af2f2` | +3 test mini player (state về stopped, cây mới không có nút Pause chết, phát lại được); kiểm tay trên trình duyệt (xem dưới) |
| **P2-4** hạn mức Sentry | `report-gate.ts` đặt trước `scheduleReport` ở `/api/csp-report` và `/api/client-error`: bỏ nhiễu extension (`chrome/moz/safari-extension://` trong message hay stack), lấy mẫu CSP 10%, dedupe fingerprint (source, name, message, route) 5 phút, trần 30 báo cáo/phút/instance, phần bị giữ lại gộp thành một dòng log `app_error_suppressed`/phút. Báo lỗi server (500, `onRequestError`) không qua cổng này. | `db4f3e0` | +16 test gate, +3 route client-error, +4 route csp (cả hai route vẫn trả 204 khi bỏ) |
| **P2-5** OTP | (a) trần theo email 3 lên 7 (= 2 x trần IP + 1, vì cửa sổ IP có thể trượt qua cửa sổ email nên một IP chiếm tối đa 6): một mạng không thể khoá chủ địa chỉ, cửa sổ vẫn 10 phút; form báo riêng "địa chỉ email này đã nhận quá nhiều mã" khi `code === OTP_EMAIL_RATE_LIMITED` (key `login.errors.tooManyCodesForEmail`, en/vi/ja), 429 của IP giữ câu cũ. (b) phủ cả 4 đường gửi mã của plugin: thêm `/forget-password/email-otp` và `/email-otp/request-email-change` (đọc `newEmail`), chung một ngân sách theo địa chỉ. (c) email trim + lowercase, dài hơn 254 thì 400 `INVALID_EMAIL` trước khi vào Map; chuỗi rỗng bỏ qua. | `4262eb8` | +12 test (qua Better Auth thật với PGlite: 7 mã rồi 429, một IP không khoá được nạn nhân, forget-password và change-email bị chặn, địa chỉ quá dài), +2 test form |
| **P1-2** cổng deploy | `scripts/check-prod-env.mjs` chạy trong `prebuild`: khi `VERCEL_ENV=production` mà thiếu hoặc sai `NEXT_PUBLIC_SITE_URL` (phải là origin https không path) hoặc thiếu `EMAIL_FROM` thì build dừng, in rõ biến nào. CI, local, preview không bị ảnh hưởng; default `studywithbro.com` giữ nguyên. README: bảng biến ghi origin đang phục vụ, và đoạn "deploy cần migration mới: chạy xong DB migrate rồi mới cho deploy lên". Không đụng `next.config.ts`. | `f0d0d58`, `1d13fe8` | +12 test chạy script thật qua `spawnSync` |

## P3

| # | Kết luận | Commit / lý do |
|---|---|---|
| 1 `_vercel` trong proxy | Đã sửa | `96b1ffa`: matcher và `NON_PAGE_SEGMENTS`, test đỏ khi bỏ |
| 2 cache formatter múi giờ | Đã sửa | `1534bef`: khoá theo tên viết thường |
| 3 limiter đầy, fail-closed | Bỏ qua | Cần >=10.000 khoá sống trong một instance (OTP: ~3.300 IP, vì mỗi IP chỉ 3 yêu cầu/10 phút). Fail-closed đổi nguy cơ lý thuyết lấy từ chối dịch vụ thật khi bị flood; đúng chỗ xử lý là rule Vercel Firewall |
| 4 hằng số feedback kéo drizzle vào client | Đã sửa | `ccee8b3`: `src/lib/feedback/limits.ts`; test import form với `drizzle-orm/pg-core` bị mock ném lỗi |
| 5 hộp thoại Skip không đóng khi pha tự hết | Đã sửa | `5047b9d`: nhớ `skipAskedMode` như hộp thoại Reset |
| 6 `move-guest-data` vi phạm unique | Đã sửa | `7295e63`: xoá bản trùng `clientSessionId` của khách trước khi chuyển (P2-2 làm trường hợp này dễ xảy ra hơn) |
| 7 trần 2000 task chỉ đếm hàng chưa xoá | Bỏ qua | Cần quyết định sản phẩm: trần trọn đời gồm hàng đã xoá mềm làm người dùng nhiều năm bị chặn bằng thông báo "2000" khó hiểu; purge cần xét FK `focus_sessions.task_id`. Ghi vào follow-up |
| 8 host YouTube lỏng | Đã sửa | `4e54498`: `youtube.com` hoặc `*.youtube.com`; trước đó chưa có test nào cho `parseYouTubeUrl` |
| 9 mọi 4xx đều drop session | Đã sửa | `e58160a`: chỉ 400 và 429 có `code: DAILY_SESSION_LIMIT` (route thêm code) mới drop; 403/429 của firewall tính như lỗi server (thử lại tối đa 5 lần) |
| 10 cờ `guest: true` sai | Đã sửa | `e58160a`: dùng `guest.isAnonymous` |
| 11 cookieCache sau khi xoá tài khoản | Đã đúng sẵn | `account-settings.tsx` `handleDelete` gọi `signOut()` rồi `window.location.assign` ngay sau DELETE; không cần đổi |
| 12 `completedSessions` đếm đoạn cụt | Bỏ qua | Quyết định sản phẩm (thêm cột hoặc lọc), như review đã ghi |
| 13 từ điển i18n trong RSC payload, CLS `GuestOnly` | Bỏ qua | Review đã đánh giá chấp nhận được; chỉ cần theo dõi cỡ HTML |

## Quyết định tự chọn

- **Không đưa engine lên layout chung** (phần "nếu đơn giản"): engine cần `QueryClientProvider` và `AuthSessionSync`, hiện chỉ có trong `AppProviders` của `(main)`; đưa lên `[lang]` nghĩa là thêm JS client và một request session vào các trang SSR/SEO (guide, privacy, terms). Hệ quả còn lại: khi đang ở `/guide` quá deadline thì **không có chuông lúc đó**; quay lại thì phiên được ghi đúng `endedAt` và chuyển pha, im lặng (nếu quá 15 phút thì không ghi, có toast). Nếu muốn chuông chạy xuyên trang cần batch riêng (tách engine khỏi query client, hoặc một watcher nhẹ chỉ phát chuông).
- **Trễ 1 đến 15 phút (máy ngủ ngắn) vẫn ghi cả phiên** như đường reload hiện có; không phân biệt được ngủ với tab bị throttle nên dùng chung một ngưỡng (15 phút, `CATCH_UP_GRACE_MS`) thay vì "2 lần độ dài pha hoặc 1 giờ".
- **Id phiên không chứa user id** (đề bài gợi ý `mode + deadlineAt + user id`): ràng buộc unique của server đã theo `(user_id, client_session_id)`, và user có thể chưa biết (auth đang tải) ở cửa sổ này nhưng đã biết ở cửa sổ kia, làm hai id khác nhau.
- **Sampling CSP đặt trước dedupe**: báo cáo bị lấy mẫu loại không đăng ký fingerprint, nên vi phạm thật lặp lại vẫn lọt qua sau vài lần.
- `toast.info` của sonner gọi thẳng trong engine (không qua hook) để mọi đường hoàn thành muộn dùng chung.

## Kiểm chạy thật (dev :3001, Chrome DevTools, context `review-fixes`)

- Start focus 25:00, vào `/guide` bằng link footer (client navigation: biến `window` còn nguyên), chờ 65 giây, quay lại bằng "Open the timer": `deadlineAt` không đổi, `timeLeft` lưu 1418 = `ceil((deadline - now)/1000)` đúng, đồng hồ hiện 23:38. Trước fix: 3 phút ngoài trang bị xoá (theo kịch bản review).
- Phát YouTube từ thư viện (iframe thật trong thẻ), đổi sang Tiếng Việt qua combobox ở footer (`router.push('/vi')`, vẫn cùng document): thẻ và iframe biến mất, không còn nút Pause chết, timer vẫn chạy đúng (1329 giây, 22 phút còn lại). Console chỉ có cảnh báo "player is not attached to the DOM", đã xử lý ở `54af2f2` (chưa kiểm lại trên trình duyệt sau commit này, test đơn vị phủ).
- Đã đóng trang thử. Dev server là của phiên khác, không dừng.

## Cổng cuối

- `pnpm type-check` sạch; `pnpm lint` 0 lỗi / 41 cảnh báo (CI ratchet 50); `pnpm i18n:check` OK (1368 khoá).
- `pnpm test`: 170/171 file, 1664/1669 test; 5 test fail duy nhất là `weather-mood.test.ts` (WIP weather, bỏ qua theo yêu cầu).
- Không chạy `pnpm build` (theo quy định). Script prebuild kiểm bằng `VERCEL_ENV=production node scripts/check-prod-env.mjs` (thoát 1 và in lỗi khi thiếu biến).

## Việc còn lại / câu hỏi mở

- Trước khi merge vào master: đặt trên Vercel (Production) `NEXT_PUBLIC_SITE_URL=https://www.pomodoro-focus.site` và `EMAIL_FROM` đã verify ở Resend, nếu không build production sẽ dừng (đó là mục đích của cổng).
- Chuông xuyên trang khi đang ở guide/privacy/terms (xem trên): cần quyết định có làm không.
- P3-7 (trần task gồm hàng xoá mềm) cần quyết định sản phẩm.
- Chưa đo trên trình duyệt: cuộc đua hai cửa sổ thật (chỉ có test mức recorder/server), và đổi ngôn ngữ có làm mất `data-theme` hay không (theme vẫn `light` sau khi đổi ở lần thử này).
