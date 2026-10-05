# Batch perf + chuông xuyên trang (2026-10-05)

Nhánh `feat/design-system`. Follow-up #33, #34, #35 và chuông khi đang ở `/guide` (review-fixes để ngỏ). Build và đo chỉ trong bản copy cô lập (`git archive HEAD`, `pnpm install --frozen-lockfile`, `CI=true`, `BETTER_AUTH_SECRET` giả, không `DATABASE_URL`, `next build` bỏ qua `prebuild` vì tối ưu ảnh không ảnh hưởng JS); bản copy đã xoá sau khi đo.

## Commit

| Commit | Nội dung |
|---|---|
| `75430cc` perf(db) | PGlite ra khỏi trace của instrumentation |
| `ffbffd2` fix(auth) | `baseURL` của Better Auth, build hết cảnh báo |
| `ad136aa` perf(bundle) | Bảng lệnh, Âm thanh, Không gian, Cài đặt hẹn giờ, Đăng nhập, màn ăn mừng, confetti tải khi cần |
| `813cb50` feat(timer) | `DeadlineWatcher`: chuông + thông báo xuyên trang |
| `208ef44` perf(bundle) | Provider của app tải cùng chunk app; layout `(main)` thành server component |
| `7ad8287` perf(bundle) | Đồng hồ 3D tải khi được chọn; select không kéo Radix Dialog |

## Đo: first-load JS theo route

Cách đo: `.next/diagnostics/route-bundle-stats.json` (Next 16 bỏ cột kích thước khỏi bảng build), gzip mức 6 từng file chunk. Thành phần lấy từ `next experimental-analyze --output` (công cụ cho Turbopack theo `package-bundling.md`), đọc `modules.data` (đồ thị import tĩnh/động) và `analyze.data` từng route bằng script (đặt ở scratchpad, không commit).

| Route | Trước (raw / gzip) | Sau (raw / gzip) | Mục tiêu |
|---|---|---|---|
| `/[lang]` | 993 KB / 318 KB | 669 KB / **214 KB** | ≤ 220 KB: đạt |
| `/[lang]/guide`, `privacy`, `terms` | 661 KB / 209 KB | 643 KB / **204 KB** | < 130 KB: **không đạt được** (xem dưới) |
| `/[lang]/[...rest]` | 536 / 165 | 540 / 167 | |
| `/_not-found` (sàn framework) | 466 / 141 | 466 / 141 | |

Chunk app tải ngay sau hydrate (`AppHomeClientOnly`, `react-loadable-manifest`, phần chưa có trong first-load): trước 565 KB raw / 163 KB gzip, sau 578 KB / 179 KB (giờ chứa luôn provider của app). Tổng JS trước khi app dùng được: **~484 KB gzip xuống ~393 KB gzip (-19%)**, raw 1558 KB xuống 1247 KB. Các phần tải khi cần chỉ đến lúc mở hoặc lúc rảnh (`requestIdleCallback`, tôn trọng Data Saver), không chặn vẽ lần đầu.

### Cái gì nằm ở đâu

- **Trước, first-load `/[lang]`** (ngoài runtime Next/React): motion (framer-motion + motion-dom ~110 KB raw, do `MotionConfig` trong `AppProviders`), sonner 34 KB, TanStack Query 26 KB, Better Auth client ~30 KB, nextjs-toploader + nprogress 9 KB, Radix Tooltip/Slider, store và audio manager của mini player, nền scene (`BackgroundProvider` + renderer). Chunk app còn kéo tĩnh: bảng lệnh (cmdk + 14 icon), Âm thanh (36 icon âm thanh, thư viện YouTube), Không gian, Cài đặt hẹn giờ, Đăng nhập, màn ăn mừng + canvas-confetti, đồng hồ 3D + NumberFlow.
- **Sau**: `(main)/layout.tsx` là server component, chỉ hydrate `ThemeProvider` (next-themes thuần) + `ThemeRestorer` (tuỳ chọn màu/font ảnh hưởng HTML SSR, giữ để không xê dịch). `AppHomeClientOnly` nạp `app-runtime.tsx` = `AppProviders` (BackgroundProvider, toploader, Tooltip, Query, AuthSessionSync, AudioCleanup, BackgroundRenderer, MotionConfig, Toaster qua portal vào cuối `<body>` để giữ thứ tự tab cũ) + `AppHome`. Các phần tải khi cần dùng `lazyOnDemand` (`src/lib/lazy-on-demand.tsx`, không Suspense như `lazyPanel`, chunk đã preload thì vẽ ngay khung đầu, có placeholder tuỳ chọn): `LAZY_OVERLAYS` trong `panel-loaders.tsx` (sound, scene, timer, login; dock hover/focus cũng preload), `command-palette-dialog.tsx` (store tách sang `palette-store.ts`, hotkey ⌘K vẫn ở shell), `SessionCelebration` (mount khi có `pending`), `canvas-confetti` (import động trong `fireCelebrationConfetti`), `ThreeClock` (placeholder đúng `stageWidth` + `aspectRatio` của sân khấu 3D, nên thẻ timer không xê dịch).
- `ThemeProvider` bỏ `BackgroundProvider` (chỉ app dùng): trang nội dung không còn chạy migrate ảnh nền/IndexedDB.
- `select.tsx` lấy class từ `overlay-styles.ts` mới (hằng số + `focusContentOnOpen`, không Radix); `overlay-parts.tsx` re-export theo tên. Mọi trang có switcher ngôn ngữ bớt `@radix-ui/react-dialog`.
- Icon Phosphor: `modularizeImports` cho `/dist/ssr` đã có tác dụng (mỗi icon một module ~1,4 KB vì chứa 6 kiểu nét), không cần `optimizePackageImports`. Chi phí icon tỉ lệ với số icon trong chunk, nên giảm bằng cách dời component đi (đã làm), không bằng cấu hình.

### Vì sao trang nội dung không xuống 130 KB

Sàn framework (React 19 + runtime App Router của Next 16, đo ở `/_not-found`, chỉ có root layout) là **141 KB gzip**, đã cao hơn mục tiêu. Phần riêng của guide còn ~63 KB gzip: `LanguageSwitcher` ở footer (Radix Select + floating-ui + remove-scroll + popper + focus-scope) ~22 KB, phần thêm của Next (Link, Script, navigation) ~8 KB, tailwind-merge 8 KB, icon Phosphor 4 KB, còn lại là GA + Vercel Analytics, next-themes, i18n, banner gợi ý ngôn ngữ, Tomo, error/not-found boundary, `DeadlineWatcher` (~0,6 KB). Bước tiếp có ý nghĩa nhất: switcher hiển thị trigger tĩnh, nạp Radix Select khi focus/hover/bấm (~20 KB gzip cho mọi trang). Không làm ở batch này vì switcher thuộc batch visual-fixes đang sửa song song và việc đổi component lúc tương tác cần kiểm a11y kỹ.

## PGlite trong trace (#34)

- `src/db/index.ts`: hai import của nhánh local là `import(/* webpackIgnore: true */ /* turbopackIgnore: true */ '@electric-sql/pglite')` và `'drizzle-orm/pglite'`. Turbopack để Node tự resolve lúc chạy (từ `node_modules` của project), nên PGlite không vào đồ thị module và tracer không thấy. Adapter drizzle khi đó là bản không bundle còn schema là bản bundle: drizzle so lớp bằng `Symbol.for('drizzle:entityKind')` (`is()` trong `drizzle-orm/entity`), không theo identity, nên dùng chung được (đã chạy thật, xem dưới).
- `src/instrumentation.ts`: `register()` thoát trước mọi import khi có `DATABASE_URL` hoặc `VERCEL`; chỉ chạy local mới import động `@/db` + migrator.
- Kết quả build cô lập: `server/instrumentation.js.nft.json` từ **184 file (177 PGlite, 20,1 MB) còn 4 file, 0 PGlite**; tổng mục `pglite` trên mọi `*.nft.json` = 0 (trước: 2 mục mỗi route). `outputFileTracingExcludes` giữ nguyên làm lớp phòng hờ (không đụng `next.config.ts` có WIP thời tiết).
- Kiểm chạy: bản copy `next start` (:3107) và `next dev` (:3108) không `DATABASE_URL`: instrumentation migrate `.pglite` mới, `sign-in/anonymous` 200, tạo task 201, `/api/stats` 200. Dev :3001 của repo sau khi đổi: đăng nhập khách, `/api/tasks`, `/api/stats` đều 200.
- Test: `db/index.test.ts` (mọi import runtime của 2 gói mang `turbopackIgnore`), `instrumentation.test.ts` (+4: không nạp db khi có `DATABASE_URL`, trên Vercel, edge; migrate khi local).

## Better Auth baseURL (#35)

`src/lib/auth/base-url.ts` `authBaseURL()`:
1. `BETTER_AUTH_URL` nếu có (production đặt theo README).
2. `next dev`: `undefined`, Better Auth tự lấy theo request (localhost, IP LAN từ điện thoại).
3. Mọi lần chạy khác không có biến (CI, build local, `next start`, preview): cấu hình động `{ allowedHosts: [SITE_HOST, www., VERCEL_URL, VERCEL_BRANCH_URL, VERCEL_PROJECT_PRODUCTION_URL, localhost:*, 127.0.0.1:*], fallback: SITE_URL }`.

Lệch so với đề "`BETTER_AUTH_URL ?? SITE_URL`" (cố ý): với host của site thì kết quả y hệt SITE_URL; khác ở chỗ preview và `next start` local giữ được origin của chính nó. Ghim cứng SITE_URL sẽ làm preview từ chối POST đăng nhập của chính nó (sai origin). Không mở `*.vercel.app` (chỉ host của deployment này).

Kết quả: build cô lập **0 dòng "Base URL is not set"** (trước 7). `next start` bản mới: đăng nhập khách từ `localhost:3109` 200; POST sign-out kèm cookie từ origin lạ 403, giống hệt bản cũ (đã so trên bản build trước batch). Test: 4 ca, có ca chạy `betterAuth()` thật và bắt console (và đối chứng: không có baseURL thì cảnh báo xuất hiện).

## Chuông xuyên trang: `DeadlineWatcher`

- `src/features/timer/components/deadline-watcher.tsx`, mount trong `src/app/[lang]/layout.tsx` (trong `I18nProvider`). Không dùng QueryClient, không import timer store: đọc `localStorage['timer-storage']` qua `readRunningPhase()` (`src/lib/timer/persisted-phase.ts`, cũng là nơi giữ `TIMER_STORAGE_KEY` và `CATCH_UP_GRACE_MS`, timer store re-export). Bundle trang nội dung thêm ~0,6 KB gzip; `alarm.ts` + `notifications.ts` (kéo audio store) chỉ import động khi có phase đang chạy, rồi giữ trong bộ nhớ để chuông kêu đúng deadline không chờ mạng.
- Chỉ hoạt động khi engine không mount: `src/lib/timer/engine-presence.ts` (bộ đếm, không phải cờ, vì StrictMode mount hai lần; có subscribe). `useTimerEngine` gọi `markEngineMounted()` trong effect. Watcher arm khi engine unmount (rời app sang /guide), disarm khi engine mount, và arm lại theo sự kiện `storage` (tab khác start/pause/reset).
- Đến deadline: kiểm lại engine, kiểm phase trong storage còn đúng (mode + deadline), bỏ nếu trễ hơn 15 phút (ngủ máy, như engine), phase đã qua từ lúc trang mở thì không kêu (engine tự xử lý im lặng khi vào app). Rồi `claimAlarm()` và phát chuông đã chọn + thông báo hệ thống theo ngôn ngữ trang.
- Một tab kêu một lần: `claimAlarm` (`completion-claim.ts`, khoá `timer-alarm-claim`) **tách khỏi** claim hoàn thành. Engine cũng claim chuông trước khi kêu (chỉ khi không quiet), nên tab app + tab /guide không kêu hai lần. Nếu dùng chung claim hoàn thành thì engine trong tab đó sẽ không ghi session khi người dùng quay lại.
- `notifyPhaseComplete(mode, t, { evenIfVisible })`: mặc định giữ hành vi cũ (chỉ khi tab ẩn); watcher bật `evenIfVisible` vì trang nội dung không có gì khác báo hết phiên.
- Không ghi session, không đổi state timer. Quay lại app thì engine catch-up ghi đúng một lần như review-fixes (im lặng, không ăn mừng, không auto-start).
- Test (fake timers): `deadline-watcher.test.tsx` 10 ca: kêu đúng một lần lúc deadline (chuông + thông báo `evenIfVisible`), không ghi/không đổi storage và claim hoàn thành còn trống, im khi engine mount, nhường khi engine mount trước deadline rồi nhận lại khi rời, **không kêu khi trễ > 15 phút**, vẫn kêu khi trễ 10 phút, không kêu phase đã qua lúc mở trang, tab khác đã claim thì im, theo start/pause của tab khác, không nạp gì khi không có phase chạy. Thêm: engine (+2: không kêu lại khi /guide đã kêu nhưng vẫn ghi và chuyển pha; báo mount/unmount kể cả StrictMode), `completion-claim` (+2), `notifications` (+1), `persisted-phase` (+6), `engine-presence` (+1), layout `[lang]` (+1).

## Kiểm chạy thật (dev :3001, Chrome DevTools, context `perf`)

- Đặt focus 1 phút, Start, vào `/guide` bằng link footer (client navigation, cùng document). Chuông `bell.mp3` phát **4 ms sau deadline** trên `/guide`, thông báo "Focus session done" (trang đang hiện). State timer không đổi (`isRunning` true, `completedSessions` không tăng), `timer-completion-claim` còn trống.
- Quay lại bằng "Open the timer" (client navigation): đúng **một** `POST /api/tasks/session-complete` 200, `completedSessions` +1, chế độ sang Short break, không kêu lại, không màn ăn mừng.
- Lần thử đầu bị điều hướng cứng do chính hook `fetch` tôi gắn để đo (nhận `URL` object), không phải lỗi app; lần đó engine vẫn ghi đúng 1 lần sau reload.
- Trang chủ sau thay đổi: LCP là "25:00" của skeleton (208 ms, dev), CLS 0,0007. ⌘K mở bảng lệnh, phím S mở Âm thanh, không lỗi console.
- Console có cảnh báo dev "Encountered a script tag" từ `ThemeProvider` (next-themes chèn script) khi điều hướng client sang `(landing)`: có từ trước (layout landing đã dùng ThemeProvider), không do batch này.
- Build cô lập HEAD mới: `/`, `/vi`, `/guide`, `/ja/privacy`, `/terms` 200 `x-nextjs-cache: HIT`.

## Cổng

`pnpm type-check` sạch; `pnpm lint` 0 lỗi / 41 cảnh báo (bằng trước); `pnpm i18n:check` OK (1372 khoá); `pnpm test` 185/186 file, 1775/1780 test, 5 ca đỏ là `weather-mood.test.ts` (WIP thời tiết). Build cô lập xanh.

## Phối hợp với batch song song

- Trong lúc tôi làm, batch visual-fixes dời `YouTubeMiniPlayer` từ `AppProviders` vào `EnhancedTimer` và đổi skip link sang `SKIP_LINK_CLASS`. `enhanced-timer.tsx` có hunk của cả hai: tôi chỉ stage hunk của mình (`--shared`). `app-providers.tsx` tôi chờ họ commit rồi mới sửa. Khi viết lại `(main)/layout.tsx` tôi lỡ ghi đè thay đổi `SKIP_LINK_CLASS` vừa commit của họ; test `skip-link.test.ts` bắt được, đã sửa lại dùng `SKIP_LINK_CLASS` trước khi commit.
- Không đụng WIP thời tiết, `next.config.ts`, locale.

## Còn lại / câu hỏi mở

- Trang nội dung: switcher ngôn ngữ nạp Radix khi tương tác (~20 KB gzip mọi trang), cần chủ batch visual quyết.
- Chunk app 179 KB gzip: motion (~120 KB raw) dùng ngay ở thẻ timer; `LazyMotion` + `m` giảm được nhưng phải sửa nhiều component. 68 icon Phosphor tĩnh (~97 KB raw): user menu (Radix Menu + 7 icon) có thể nạp khi mở.
- Ở `/guide` quá 15 phút sau deadline rồi mới quay lại: chuông đã kêu nhưng engine coi là stale, không ghi session (hành vi review-fixes giữ nguyên, đề bài yêu cầu watcher không ghi).
- Trên tab mở thẳng `/guide` (chưa có tương tác), trình duyệt có thể chặn autoplay chuông; thông báo hệ thống vẫn hiện nếu đã cấp quyền.
- Chưa kiểm trên Vercel preview: kích thước function thực và `baseURL` động với host preview.
