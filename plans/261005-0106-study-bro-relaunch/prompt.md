# Prompt — Study Bro relaunch: sửa lõi → rebrand Sticker pop → sẵn sàng ra mắt

> Dán nguyên khối dưới đây vào một phiên Claude Code mở tại `/Users/nguyendangdinh/Personal/Pomodoro`.

---

Bạn làm việc trên repo Study Bro (Pomodoro web app, VI/EN/JA) tại `/Users/nguyendangdinh/Personal/Pomodoro`, nhánh `feat/design-system`. Nhiệm vụ: đưa nhánh này tới trạng thái **sẵn sàng ra mắt trên `https://studywithbro.com`**. Làm qua 4 giai đoạn, đúng thứ tự, end-to-end (phân tích → code → test → kiểm bằng mắt → commit → báo cáo). Trả lời mình bằng tiếng Việt, ngắn gọn.

## Đọc trước (nguồn sự thật)
1. `docs/superpowers/specs/2026-10-05-sticker-pop-rebrand-design.md`: spec rebrand đã duyệt (Sticker pop, linh vật Tomo, giữ tên **Study Bro**).
2. `plans/reports/analysis-261005-0022-pomodoro-standardization-master.md`: báo cáo tổng, lộ trình A–G, mục 4 "bổ sung vào spec rebrand".
3. Chi tiết và bằng chứng file:line khi cần:
   - `plans/reports/audit-261005-0022-features-and-ux-gaps.md`
   - `plans/reports/seo-261005-0022-seo-audit-and-keyword-research.md`
   - `plans/reports/review-261005-0022-tech-health.md`
4. Next.js 16 khác dữ liệu huấn luyện. Đọc `node_modules/next/dist/docs/` trước khi viết code liên quan routing, metadata, `opengraph-image`, `generateStaticParams`.

## Quyết định đã chốt (không hỏi lại)
- Tên **Study Bro**, domain chuẩn **studywithbro.com**. Code đã đổi ở commit 3438641.
- Hướng hình ảnh **B · Sticker pop**, nền sáng làm chủ đạo, dark là tuỳ chọn. Linh vật cà chua **Tomo** vẽ bằng SVG có 5 biểu cảm. Giữ 9 scene WebGL làm nền tuỳ chọn.
- Làm lại **mọi** component nền (button, dialog, popover, select, sheet, …) nhưng giữ nguyên API.
- URL theo ngôn ngữ: `/` = EN (x-default), `/vi`, `/ja`. Không auto-redirect theo Accept-Language; thay vào đó hiện banner gợi ý.
- **Mặc định cho các điểm chủ dự án chưa trả lời** (ghi rõ trong báo cáo cuối để họ đổi nếu muốn):
  - 9 âm câm thì **ẩn khỏi catalog và preset**, chưa thay file.
  - `autoStartWork` mặc định **tắt**; `autoStartBreak` giữ bật.
  - **Chỉ phiên chạy hết giờ tự nhiên** mới được +1 pomodoro. Thời gian của mọi đoạn vẫn cộng vào `time_spent`.
  - Không chặn arcade khi đang tập trung, nhưng arcade phải hiện mini timer.
  - Giữ region `cle1`.
  - Không viết lại lịch sử git.

## Ràng buộc làm việc (bắt buộc)
- **Có phiên Claude khác đang sửa cùng thư mục** (tính năng thời tiết: `src/app/api/weather/*`, `src/lib/weather/*`, `src/hooks/use-weather-sync*`, `src/components/settings/weather-settings.tsx`, `src/stores/weather-store.ts`, các hunk `weather` trong 3 file locale, Permissions-Policy trong `next.config.ts`).
  - Không sửa, không stage, không revert các phần đó.
  - **Không bao giờ** dùng `git add -A`, `git add .`, `git commit -a`, `git stash`, `git checkout -- <file>` hay `git reset --hard`.
  - Chỉ add đúng đường dẫn của mình. Nếu file có cả hunk của mình lẫn hunk của phiên kia: lọc hunk rồi `git apply --cached --unidiff-zero` (đã làm thành công ở commit 3438641).
  - Trước khi sửa file chung (locale, `next.config.ts`, `general-settings.tsx`, `app-home.tsx`), đọc lại nội dung mới nhất.
- Không đổi nhánh, không tạo worktree. Làm trên `feat/design-system` (chủ dự án đã chốt).
- **Không push, không deploy, không merge** cho tới giai đoạn 4. Ở giai đoạn 4 chỉ push nhánh và mở **PR nháp** vào `master` để CI chạy, không merge.
- Môi trường máy:
  - Hook chặn mọi lệnh Bash có chữ `node_modules`: dùng Glob/Read hoặc `pnpm ls`.
  - macOS không có lệnh `timeout`.
  - Không kill process theo pattern rộng (máy đang chạy dev server của nhiều project).
  - Ổ đĩa từng đầy: chạy `df -h /System/Volumes/Data` trước khi build, và dừng nếu còn trống < 5 GB.
- Không `pnpm build` local khi dev server của repo đang chạy, vì hai bên dùng chung `.next`. Để CI build.
- Commit nhỏ theo từng task, message tiếng Việt kiểu conventional đúng như lịch sử repo (`feat(timer): …`, `fix(stats): …`), kết thúc bằng dòng `Co-Authored-By: Claude <noreply@anthropic.com>`.
- Mỗi lỗi logic sửa theo TDD: viết test đỏ trước rồi mới sửa.

## Quy trình
1. Dùng skill `superpowers:writing-plans` lập plan chi tiết tại `plans/261005-0106-study-bro-relaunch/plan.md`, mỗi giai đoạn một file `phase-0N-*.md` có task, file chạm, tiêu chí xong và cách kiểm. Xong thì chạy luôn, không chờ duyệt plan (chủ dự án đã giao end-to-end).
2. Thực thi bằng `superpowers:subagent-driven-development`, task độc lập thì chạy song song.
   - Mỗi subagent phải nhận đủ đoạn "Ràng buộc làm việc" ở trên và danh sách file nó được phép chạm.
   - Không cho hai subagent sửa cùng một file một lúc.
3. Sau **mỗi giai đoạn**:
   - Chạy `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm i18n:check`, đều phải xanh.
   - Kiểm bằng mắt bằng Chrome DevTools MCP (`new_page` với `isolatedContext`) ở 390×844 và 1440×900, cả sáng và tối. Lưu ảnh vào `plans/reports/assets-261005-relaunch/`.
   - Ghi một dòng tiến độ vào `plan.md`.
4. Gặp quyết định sản phẩm không có trong tài liệu: chọn phương án đơn giản nhất (YAGNI), ghi lại, tiếp tục. Chỉ dừng hỏi khi việc đó không đảo ngược được.

## Giai đoạn 1 — Sửa lõi (báo cáo tổng §2.3)
- **P0** Ẩn 9 âm câm (birds, night-crickets, fireplace, white-noise, pink-noise, library, coffee-shop, coworking, cat-purring) khỏi `sound-catalog.ts` và các preset; preset Cafe/Library/Cozy đổi sang âm có thật hoặc ẩn. Thêm test fail khi một file âm được tham chiếu nhỏ hơn 50 KB.
- **P0** Phiên của khách luôn được ghi: `recordSession` gọi `ensureSession()` (đăng nhập ẩn danh) trước khi đưa vào hàng đợi. Nâng giới hạn tạo khách lên khoảng 30/10 phút/IP; khi gặp 429 thì báo lỗi riêng (đã i18n). Sửa copy "Every finished session is logged" nếu vẫn còn sai.
- **P1** Ngày thống kê: client gửi `tz` (IANA); server group bằng `AT TIME ZONE` và cắt ngày lúc 04:00. Áp cho stats, history, streak và tên file export. Aggregate bằng SQL thay vì kéo hết rows.
- **P1** `autoStartWork` mặc định false. Dừng tự chạy sau nghỉ dài, hoặc khi người dùng không tương tác suốt cả một chu kỳ.
- **P1** Chỉ +1 pomodoro khi phiên hết giờ tự nhiên (cờ `completedFullSession`). Thêm cột `client_session_id` unique + `ON CONFLICT DO NOTHING` (migration Drizzle mới), gửi kèm `endedAt`. Kiểm trần 24h nằm trong transaction.
- **P1** Reset (phím R, nút ↺, palette) khi đã có tiến độ thì hỏi xác nhận, có lựa chọn "Ghi phần đã làm".
- **P1** Thêm 5 key i18n đang hiện thô (`timerComponents.taskSelector.taskComplete.*`, `errors.fieldRequired`). Bỏ toàn bộ mẫu `t('x') || 'fallback'`. Toast, chữ thông báo hệ thống và nút "Close" của Dialog/Sheet đi qua i18n.
- **P1** Báo hết phiên chắc chắn: đặt `setTimeout` đúng mốc deadline (giữ `setInterval` để vẽ), preload chuông, Screen Wake Lock tuỳ chọn khi đang tập trung. Thêm mục cài đặt **"Chuông & thông báo"**: chọn chuông, âm lượng, nghe thử, trạng thái quyền thông báo.
- **P2 nhanh** Esc đóng modal scene thì hoàn tác preview; thoát fullscreen bằng Esc thì đồng bộ lại `isFocusMode`; manifest `start_url: "/"`, shortcut `/?panel=tasks`; `error.tsx` `homeHref="/"`; redirect `/leaderboard` và `/chat` về `/`; validate `NEXT_PUBLIC_GA_ID` (`/^(G|GTM)-[A-Z0-9]+$/`) trước khi render script và chỉ gửi page_view một lần.

## Giai đoạn 2 — Rebrand Sticker pop (theo spec, mục 9 có 7 bước)
- Làm đúng spec theo thứ tự: nền móng → thương hiệu → component nền → khung app + timer → panel → trang ngoài app → tài liệu.
- Gộp luôn 8 việc ở báo cáo tổng §4: H1 + SSR khung "25:00"; dock không bị cắt ở viewport thấp; arcade có mini timer; …
- Ảnh OG mới bằng `next/og` **thay hẳn `public/card.jpg`**. Ảnh cũ lộ tên và email thật của chủ dự án: xoá file và mọi chỗ tham chiếu.
- Gỡ sói (`public/mascot/wolf_cute.*`), thay bằng Tomo ở mọi chỗ.
- Viết lại `docs/design-system.md` theo ngôn ngữ mới.

## Giai đoạn 3 — SEO và hiệu năng (báo cáo SEO §3, §5)
- Route `src/app/[lang]` với `generateStaticParams` en/vi/ja: EN không có prefix, `/en/*` 308 về bản không prefix. Proxy rewrite. `<html lang>` lấy theo URL, không đọc cookie. Switcher đổi URL; cookie chỉ nhớ lựa chọn người dùng tự bấm.
- `generateMetadata` theo locale (title gợi ý trong báo cáo SEO P1-3), `alternates.languages` + x-default, sitemap có alternates và lastmod thật, title template `%s | Study Bro`.
- Bỏ `cookies()` ở root layout để các trang landing/guide/legal chạy static/ISR. Khối nội dung SEO không phụ thuộc session.
- JSON-LD: `WebApplication` chỉ đặt ở home từng locale; thêm `WebSite` + `Organization`.
- Tải locale động theo ngôn ngữ thay vì đưa cả 3 file vào bundle. PGlite chỉ import động ở nhánh local. Bỏ preload panel khi bật `saveData`.

## Giai đoạn 4 — Sẵn sàng deploy (báo cáo kỹ thuật §4)
- Bước migrate có kiểm soát: GitHub Action chạy `pnpm db:migrate` trên `master` bằng secret `DATABASE_URL`. Ghi rõ trong README việc chủ dự án phải tự set secret.
- Error tracking: export `onRequestError` trong `instrumentation.ts`, cộng `@sentry/nextjs` chỉ bật khi có `SENTRY_DSN`; thiếu DSN thì không làm gì.
- Rate limit OTP theo email (khoảng 3 lần/10 phút).
- CSP: thêm `report-to`, thêm host open-meteo (phối hợp với phần thời tiết, chỉ thêm host).
- Hạ ngưỡng lint `--max-warnings` xuống đúng số warning hiện có; nâng ngưỡng coverage lên khoảng mức thực tế; eslint ignore `coverage/**`.
- Xoá code chết và dependency thừa đã liệt kê trong báo cáo kỹ thuật P3 (`@react-three/drei`, `animate-ui/**` không dùng, `feature-gate`, plan mode, file Supabase cũ, `migrations/` cũ, …) sau khi grep xác nhận không còn ai import.
- Push nhánh `feat/design-system` và mở **PR nháp** vào `master`. Chờ CI (gồm `next build`) xanh và sửa tới khi xanh. **Không merge, không deploy.**

## Ngoài phạm vi (để prompt sau)
Bài `/vi/phuong-phap-pomodoro`, trang preset VI/JA, trang "pomodoro timer with games", mục tiêu ngày, ghi chú phiên, PiP, đồng bộ cài đặt, service worker/offline, phiên xác thực HMAC (phase 04), XP/league, Pro/SePay, trợ lý AI, đổi region, viết lại lịch sử git.

## Kết thúc
- Báo cáo `plans/reports/implementation-261005-study-bro-relaunch.md` gồm:
  - mỗi giai đoạn: đã làm, commit, ảnh trước/sau;
  - kết quả gate;
  - link PR và trạng thái CI;
  - các mặc định đã tự chọn;
  - việc chủ dự án phải tự làm;
  - câu hỏi còn mở.
- Cập nhật memory dự án (`~/.claude/projects/-Users-nguyendangdinh-Personal-Pomodoro/memory/`) nếu có quyết định hay sự thật mới không suy ra được từ code.
- Tin nhắn cuối gửi mình: tối đa khoảng 15 dòng, tiếng Việt.

## Việc chủ dự án tự làm song song (agent không làm được, chỉ nhắc trong báo cáo)
- Mua `studywithbro.com`. Gia hạn `pomodoro-focus.site` (hết hạn 11/11/2026) từ 2 năm trở lên.
- Rotate Groq key. Sửa `.env:14` (thiếu xuống dòng). Dọn các key cũ trong `.env`.
- Vercel env: `NEXT_PUBLIC_SITE_URL=https://studywithbro.com`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `DATABASE_URL` (Neon), `RESEND_API_KEY`, `EMAIL_FROM=no-reply@studywithbro.com` (verify domain ở Resend), `NEXT_PUBLIC_GA_ID` dạng `G-…`. Preview dùng Neon branch riêng.
- GitHub secret `DATABASE_URL` cho bước migrate.
- GSC: verify domain mới bằng DNS TXT; sau khi deploy thì dùng Change of Address từ property cũ.
