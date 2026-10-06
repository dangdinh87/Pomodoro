# Build check: HEAD sạch của `feat/design-system` (2026-10-05)

Mục tiêu: xác nhận commit HEAD (không có WIP chưa commit) build được như CI. Nhánh chưa từng build/push.

## Cách làm
- `git archive HEAD | tar -x` vào thư mục scratch riêng, không đụng `.next` của repo (dev server :3001 dùng chung).
- Khớp `.github/workflows/ci.yml`: Node 22 (máy: v22.12.0), pnpm 10 (máy: 10.12.1), `CI=true`, `BETTER_AUTH_SECRET=ci-placeholder-secret-not-used-at-runtime`, không có `DATABASE_URL`.
- Lệnh theo thứ tự CI: `pnpm install --frozen-lockfile`, `pnpm type-check`, `pnpm lint --max-warnings 50`, `pnpm i18n:check`, `pnpm test --coverage`, `pnpm build` (chạy `prebuild` = tối ưu ảnh nền bằng sharp trước).
- Phiên bản: Next 16.3.8 (Turbopack), TypeScript 5.9.3, vitest 4.1.11, eslint 9.39.5.
- Hai lượt: (1) HEAD `473ef1b` (gốc), (2) HEAD `da320f6` (sau fix, export mới hoàn toàn).

## Kết quả cổng (clean copy)
| Cổng | 473ef1b | da320f6 |
|---|---|---|
| install --frozen-lockfile | OK (6.7s) | OK |
| type-check | OK | OK |
| lint --max-warnings 50 | OK, 0 lỗi / 41 warning | OK, 0 / 41 |
| i18n:check | OK, 1333 key en/vi/ja | OK |
| test --coverage | 163 file, 1514 test xanh; stmts 55.5%, branches 49.6% | 163 file, 1515 test xanh |
| build | OK, 313s (gồm prebuild ~4 phút) | OK, 244s |

Không có lỗi type, lint, test hay prerender. Build không cần sửa gì để xanh.

## Bảng route (da320f6)
- `● SSG` (generateStaticParams, en/vi/ja): `/[lang]`, `/[lang]/guide`, `/[lang]/privacy`, `/[lang]/terms`, `/[lang]/opengraph-image`. 32 trang tĩnh.
- `○ Static`: `/_not-found`, `/dev/ui` (prod trả 404), `/robots.txt`, `/sitemap.xml`.
- `ƒ Dynamic`: `/[lang]/[...rest]` (catch-all 404), toàn bộ `/api/*` (15 route: account, account/export, auth, client-error, csp-report, feedback, history, stats, tags, tasks, tasks/[id], tasks/[id]/clone, tasks/reorder, tasks/session-complete, tasks/templates).
- `ƒ Proxy (Middleware)` có mặt.
- Ở 473ef1b `/[lang]/opengraph-image` là `ƒ` (xem Fix bên dưới).

## First-load JS
Next 16.3 không in kích thước trong bảng route; lấy từ `.next/diagnostics/route-bundle-stats.json` (gzip ước lượng mức 6):
| Route | Raw | Gzip ~ |
|---|---|---|
| `/[lang]` | 993 KB | 318 KB |
| `/[lang]/guide`, `privacy`, `terms` | 661 KB | 209 KB |
| `/[lang]/[...rest]` | 536 KB | 165 KB |
| `/_not-found` | 466 KB | 141 KB |
| `/dev/ui` | 713 KB | 219 KB |

Landing 318 KB gzip là mức nặng cho trang marketing SSR-first; chưa tìm nguồn (ngoài phạm vi lượt này).

## PGlite trong trace
- Trace route (`server/app/api/**/route.js.nft.json`): `outputFileTracingExcludes` có tác dụng. Mỗi route chỉ còn 2 mục nhắc pglite (symlink `.next/node_modules/@electric-sql/pglite-<hash>` và chunk externals), không còn 175 file thật. Thử bỏ exclude: mỗi route lại có 177 file pglite, xác nhận exclude hoạt động.
- **Ngoại lệ: `server/instrumentation.js.nft.json` vẫn chứa 177 file pglite (20.1 MB, package 24.3 MB)** vì instrumentation không phải route nên key `'/*'` không áp dụng. Thử thêm key `'**'`, `'instrumentation'`, `'/instrumentation'`, `'instrumentation.js'`, `'/instrumentation.js'`: không đổi gì (thử trong bản copy, không đưa vào repo).
- Nguyên nhân: `src/instrumentation.ts` import động `@/db` (gọi `import('@electric-sql/pglite')`) và `drizzle-orm/pglite/migrator`, tracer đi theo.
- Chưa kiểm chứng được trên Vercel việc builder có đóng gói trace của instrumentation vào mọi function không (cần một preview deploy; theo hiểu biết của tôi là có). Nếu có thì ~20 MB PGlite vẫn vào mỗi function, mục tiêu phase 3b chưa đạt. Hướng xử lý để chủ phase 3b quyết: tách import PGlite khỏi đường instrumentation (ví dụ `import(/* turbopackIgnore: true */ ...)` trong `loadLocalDriver`, cần thử dev/start local), hoặc kiểm tra kích thước function thực trên preview rồi mới sửa. Không tự sửa vì đổi hành vi nạp DB.

## `pnpm start` (PORT=3105, bản copy sạch)
| URL | Kết quả |
|---|---|
| `/` | 200, `x-nextjs-cache: HIT`, `s-maxage=31536000` |
| `/vi` | 200, HIT, `s-maxage=31536000` |
| `/ja/guide` | 200, HIT, `s-maxage=31536000` |
| `/en/privacy`, `/en/guide`, `/en` | 308 về `/privacy`, `/guide`, `/` |
| `/guide`, `/vi/terms` | 200, HIT |
| `/sitemap.xml` | 200, HIT, `application/xml`, 5958 B |
| `/robots.txt` | 200, HIT |
| `/opengraph-image`, `/vi/...`, `/ja/...` | 200 `image/png` ~103 KB; ở 473ef1b không có header cache (hàm chạy mỗi request), ở da320f6 `x-nextjs-cache: HIT` |
| `/en/opengraph-image` | 308 về `/opengraph-image` |
| `/fr`, `/fr/guide` | 404 (`no-store`) |
| `/dev/ui` | 404 |
| `/api/stats`, `/api/tasks` (khách) | 401 JSON |

Tiến trình dừng đúng theo PID nghe cổng 3105. Header bảo mật (CSP report-only, X-Frame-Options, Referrer-Policy) có mặt.

## Fix đã làm
- `da320f6` `fix(build)`: `src/app/[lang]/opengraph-image.tsx` thiếu `generateStaticParams` nên route là `ƒ` (vẽ lại PNG mỗi request, `max-age=0`) dù comment đầu file ghi "tạo lúc build". `generateStaticParams` của layout không áp dụng cho route metadata. Thêm 3 dòng trả `SUPPORTED_LANGS` + 1 test; build ra `● /en|vi|ja/opengraph-image`, 32 trang tĩnh, `x-nextjs-cache: HIT`.
- Trong repo: `pnpm type-check` xanh; `pnpm test` 1560/1565 xanh, 5 test đỏ nằm hoàn toàn ở `src/lib/weather/weather-mood.test.ts` (file chưa commit của phiên weather, không có trong HEAD, không phải do tôi).

## Cảnh báo còn lại (không chặn)
1. 7 dòng `[Better Auth] Base URL is not set` lúc "Collecting page data" (CI không đặt `BETTER_AUTH_URL`; chỉ là warning, trên Vercel đặt env thì hết).
2. `No build cache found` (Next, CI không cache `.next`; chỉ chậm hơn).
3. pnpm: `Ignored build scripts: esbuild` (giống CI, không ảnh hưởng build).
4. `Error: Internal: NoFallbackError` in ra log server mỗi lần gặp lang lạ như `/fr` (do `dynamicParams = false`); response vẫn đúng 404. Chỉ ồn log.
5. Lint 41 warning (ngưỡng CI 50): chủ yếu `no-explicit-any`, `no-unused-vars`, 1 `Unused eslint-disable` tự sửa được.
6. Header `Permissions-Policy` ở HEAD là `geolocation=()` trong khi CSP `connect-src` đã có open-meteo; Hunk Permissions-Policy trong WIP weather (next.config.ts, chưa commit) phải được commit cùng tính năng weather, nếu không định vị sẽ bị chặn ở bản build từ HEAD.
7. Trace instrumentation chứa PGlite (mục trên).

## Chưa giải quyết
- Kích thước function thực trên Vercel (trace instrumentation có vào mọi function không).
- Nguồn của 993 KB JS trang landing.
