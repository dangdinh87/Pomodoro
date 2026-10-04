# Phase 3a: URL theo ngôn ngữ (`/`, `/vi`, `/ja`)

Ngày 2026-10-05, nhánh `feat/design-system`. Trạng thái: xong. Commit: `caaaaf3` (helper URL + bảng quyết định proxy) và `9cc6d7d` (cấu trúc `[lang]`, provider, banner, 404, test). Chưa chạy `next build` (theo luật), nên phần "static hay dynamic" mới là suy luận từ code + dev, cần CI build xác nhận.

## 1. Cây route cuối

```
src/app/
  layout.tsx            root layout "đi thẳng" (return children), KHÔNG có <html>
  not-found.tsx         404 cho segment đầu không phải ngôn ngữ (/fr, /fr/guide): tiếng Anh, tự có <html>
  global-error.tsx      như cũ; ngôn ngữ lấy từ prefix URL (không đọc cookie nữa)
  fonts.ts  globals.css  opengraph-image.tsx  robots.ts  sitemap.ts   (giữ ở gốc, không đổi)
  api/**                không đụng
  dev/layout.tsx        document riêng (en), dev/ui/* (proxy bỏ qua /dev)
  [lang]/
    layout.tsx          <html lang={lang}>, GA, JSON-LD, I18nProvider(locale + messages 1 ngôn ngữ), LanguageSuggestion
                        generateStaticParams -> en/vi/ja, dynamicParams = false
    not-found.tsx       404 theo ngôn ngữ (client, dùng useI18n)
    [...rest]/page.tsx  notFound() cho mọi đường dẫn không phải trang (để 404 nằm trong ngôn ngữ)
    (main)/             layout, error, page (home)      git mv từ src/app/(main)
    (landing)/          layout, error, guide, privacy, terms   git mv từ src/app/(landing)
```

Ghi chú: ban đầu để `[lang]/layout.tsx` làm root (đúng như guide i18n). Với cấu trúc đó `/fr` cần `global-not-found` (experimental, phải sửa `next.config.ts` đang có WIP thời tiết). Dùng root layout đi thẳng + `app/not-found.tsx` thì `/fr` ra 404 SSR sạch và khỏi đụng `next.config.ts`. Mẫu này giống cách next-intl khuyến nghị.

## 2. Quy tắc proxy (`src/proxy.ts` + `src/lib/i18n/locale-routing.ts`, thuần, có test)

| Request | Kết quả |
|---|---|
| `/`, `/guide`, `/privacy`, `/terms`, `/bất-kỳ` | rewrite nội bộ sang `/en/...` (giữ query) |
| `/vi`, `/vi/*`, `/ja`, `/ja/*` | đi qua |
| `/en`, `/en/*` | 308 về đường dẫn không prefix, giữ query |
| `/fr`, `/pt-br`... (trông như locale nhưng không hỗ trợ) | đi qua, route trả 404 |
| `/vi/timer` | 308 `/vi?panel=timer` (cũng `/ja/...`; `/en/tasks` đi thẳng `/?panel=tasks`, không qua 2 hop) |
| `/vi/leaderboard`, `/vi/chat` | 308 `/vi` |
| `/api`, `/_next`, `/dev`, file có đuôi, `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/twitter-image`, `/icon`, `/apple-icon` | không đụng |

- Bảng trang cũ: `timer, tasks, history/progress/focus -> stats, settings, entertainment -> arcade, feedback, login/signup/reset-password -> login, leaderboard, chat`.
- Không còn cookie/Accept-Language trong proxy. `curl -H 'Accept-Language: vi' /` vẫn trả 200 tiếng Anh.
- Matcher: `/((?!api(?:/|$)|_next(?:/|$)|dev(?:/|$)|.*\..*).*)` (khớp theo segment nên `/device`, `/apis` vẫn là trang).
- `next.config.ts` KHÔNG sửa: redirect bản không prefix (`/tasks`...) vẫn ở đó và chạy trước proxy.

## 3. Tài liệu Next 16 đã dựa vào (đọc qua Read)

- `node_modules/next/dist/docs/01-app/02-guides/internationalization.md` (root layout lồng trong `[lang]`, generateStaticParams, proxy)
- `.../03-api-reference/03-file-conventions/proxy.md` (rewrite/redirect, matcher, thứ tự: `redirects` của config chạy trước proxy)
- `.../03-api-reference/04-functions/generate-static-params.md`, `.../next-root-params.md` (biết có, không dùng: caller truyền `lang` tường minh theo yêu cầu)
- `.../03-file-conventions/02-route-segment-config/dynamicParams.md`, `.../not-found.md` (global-not-found), `.../layout.md`
- `node_modules/next/dist/experimental/testing/server/*.d.ts` (`unstable_doesMiddlewareMatch`, `getRewrittenUrl`, `getRedirectUrl`): dùng trong `proxy.test.ts`. Tên hàm trong bản 16.3.8 là `...Middleware...`, không phải `...Proxy...` như tài liệu.

## 4. Static hay dynamic (suy luận, chưa build)

- Cây `[lang]` không còn `cookies()`/`headers()`/session: root layout, `(main)/page` (bỏ `getSessionUser`), guide/privacy/terms, `getT(lang)` đều thuần theo param. Kỳ vọng: 3 ngôn ngữ x 4 trang = 12 trang SSG + `generateStaticParams` en/vi/ja.
- Đã chuyển sang client: khối SEO của home luôn nằm trong HTML cho mọi người, `GuestOnly` (`useSyncExternalStore`, server snapshot "không phải member") gỡ khối đó khi store auth biết là member. HTML giống hệt cho crawler và khách.
- Dynamic có chủ đích: `[lang]/[...rest]` (404). API route, `opengraph-image`, `sitemap`, `robots` không đổi.
- Dev đã xác nhận: `/`, `/vi`, `/ja` đúng `<html lang>`, canonical riêng từng ngôn ngữ, không warning hydration trong console (`/`, `/vi/guide`).
- Cần CI/preview xác nhận: (a) `x-nextjs-cache`/`○ Static` trong output build cho 12 trang; (b) HTML của 404 lồng (`/vi/nope`): trong dev server trả status 404 + noindex nhưng HTML là vỏ lỗi của Next, giao diện 404 tiếng Việt do client dựng sau hydrate (thử cả root layout là `[lang]`, và có/không `dynamicParams=false`: cùng kết quả). `/fr` thì SSR đầy đủ.
- Lưu ý chi phí: messages của 1 ngôn ngữ (en 75 KB, vi 90 KB, ja 92 KB thô; ~23-26 KB gzip) nằm trong payload RSC của mỗi trang thay vì chunk JS cache được. Đúng yêu cầu "1 locale cho client"; cải tiến sau: chỉ gửi namespace client dùng.

## 5. API cho phase 3b

- `src/lib/i18n/locale-path.ts`: `localePath(lang, '/guide#x')`, `splitLocalePath(pathname)`, `pathWithoutLocale(pathname)`, `switchLocalePath(currentPath, search, target, hash?)`.
- `src/lib/i18n/route-lang.ts`: `routeLang(params)` (validate + `notFound()`), kiểu `LangParams`. Dùng trong mọi page/layout/`generateMetadata` dưới `[lang]`.
- `src/lib/server-translations.ts`: `getT(lang)` đồng bộ (bỏ `await`, bỏ `getServerLang`).
- `src/lib/i18n/messages.ts`: `loadMessages(lang)` (chỉ server).
- `src/lib/i18n/negotiate-locale.ts`: `SUPPORTED_LANGS`, `DEFAULT_LANG`, `isLang`, `readLangCookie`, `firstSupportedLang` (đã xoá `negotiateLocale`, `normalizeLang`: hết người dùng).
- `buildPageMetadata({ lang, path, title, description })`: canonical + og:url theo `localePath` (3a sửa tối thiểu để `/vi` không canonical về `/`). 3b thêm `alternates.languages` (x-default = EN), title/description theo locale cho home (đang vẫn là chuỗi tiếng Anh cứng), `openGraph.locale` (đang cố định `en_US`), sitemap alternates, JSON-LD. Sitemap hiện chỉ liệt kê URL EN.
- `src/test-utils/i18n.tsx`: `I18nProvider({ initialLang })` cho test (17 file test đổi import sang đây).

## 6. Quyết định và lệch so với yêu cầu

1. `/vi/timer -> /vi?panel=timer` đúng theo ma trận yêu cầu, nhưng `/timer` (EN, next.config.ts) vẫn là `-> /` như cũ và `/en/timer -> /?panel=timer`. Hai chỗ lệch nhau; chọn thống nhất (khả năng cao là `/` vì `timer` là trang chủ) khi nào sửa next.config.ts được.
2. `I18nProvider` giờ là `({ locale, messages })`, ngôn ngữ = URL, không còn state, không đọc `localStorage app.lang`; `useI18n()` bỏ `dict`; `t()` không fallback sang tiếng Anh nữa (thiếu key thì ra key, `pnpm i18n:check` đảm bảo đủ key).
3. Đổi ngôn ngữ (`setLang`): ghi cookie `app.lang`, rồi `router.push(switchLocalePath(...))` giữ path + query + hash. Kiểm chứng trên trình duyệt: cùng document (không reload), timer chạy tiếp (24:52 -> 24:46 -> 23:54), panel Tasks mở, URL `/vi?panel=tasks` -> `/ja?panel=tasks`, `<html lang>` đổi. Reload cứng sau đó timer vẫn chạy (persist localStorage). Lưu ý: subtree dưới `[lang]` remount (key theo giá trị param) nhưng store zustand module-level giữ nguyên.
4. Banner gợi ý (`LanguageSuggestion`): chỉ hiện sau mount (không có trong HTML), ưu tiên cookie rồi `navigator.languages`, khác ngôn ngữ trang và chưa đóng. Chữ viết bằng ngôn ngữ được gợi ý, để trong `lang-suggestion.ts` (không vào file locale vì provider chỉ giữ 1 ngôn ngữ). Bấm "Xem bằng ..." không đặt cờ đã đóng (cookie nhớ lựa chọn); chỉ nút đóng mới ghi `localStorage app.langSuggestion.dismissed`. Màn nhỏ: dưới thanh trên; màn lớn: góc dưới trái (không che timer/dock).
5. Mọi link nội bộ đã đi qua `localePath`: Footer, SiteHeader, PanelLink (so sánh bằng `pathWithoutLocale`, vì `usePathname` có thể là `/` hoặc `/en`), command palette, user menu, account-settings, RouteError, BackgroundRenderer, trang 404, guide CTA, global-error.
6. Dev gallery `/dev/ui`: bỏ nút đổi ngôn ngữ (provider theo URL, gallery chỉ có en).
7. Lint rule `@next/next/no-html-link-for-pages` giờ coi `[lang]` khớp mọi đường dẫn 1 segment: `button.test.tsx` dùng `<a href="/x">` bị báo lỗi, đổi sang URL ngoài.
8. `AppProviders` bỏ `I18nProvider` lồng (sửa sau khi 2.7 commit mini player; chỉ commit hunk của mình).
9. `tsc` báo lỗi giả từ `.next/types` cũ (tham chiếu `(main)/...` đã dời): chạy `pnpm exec next typegen` rồi `pnpm type-check` sạch. CI build tự sinh lại.
10. Dev server :3001 đã khởi động lại một lần (PID cũ 42851) vì thêm root layout làm cây route đổi.

## 7. Test và gate

- Mới: `locale-path`, `locale-routing` (38 ca), `proxy` (rewrite/308/matcher), `negotiate-locale`, `lang-suggestion`, `messages`, `route-lang`, `server-translations`, `page-metadata`, `i18n-context` (kể cả "không import file locale"), `language-suggestion`, `panel-link`, `guest-only`, `not-found` (3 ngôn ngữ), home page (lang prop, canonical, không phụ thuộc session), `route-error`, error boundary theo ngôn ngữ.
- `src/proxy.test.ts` cũ (test cookie theo Accept-Language, hành vi đã bỏ) được thay hẳn bằng ma trận mới.
- `pnpm type-check` sạch (sau typegen), `pnpm lint` 0 error, `pnpm i18n:check` OK (1361 key), `pnpm test`: chỉ còn 5 ca WIP thời tiết trong `weather-mood.test.ts` (khi máy tải cao, vài ca "ca đầu tiên của file" quá 5s timeout, chạy lại riêng thì qua: `not-found`, `arcade-games.smoke`, `timer-controls-reset`).
- Runtime :3001: `/vi`, `/ja`, `/` đúng `<html lang>`; `/en/guide` 308 `/guide`; `/en/guide?x=1` 308 giữ query; `/fr` 404 (SSR, noindex); `/vi/guide` tiếng Việt; Accept-Language vi trên `/` vẫn 200 tiếng Anh; `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/manifest.json`, `/favicon.ico`, `/llms.txt`, `/api/*` bình thường.
- Ảnh: `plans/reports/assets-261005-relaunch/3a-*.png` (không commit).

## 8. Việc còn lại / câu hỏi mở

- CI/preview: xác nhận 12 trang static và cách `/vi/nope` render ở production (xem mục 4b). Nếu HTML 404 lồng vẫn là vỏ lỗi, cân nhắc `global-not-found` hoặc để nguyên (404 không cần index).
- 3b: metadata/hreflang/sitemap/JSON-LD theo locale, title home theo ngôn ngữ.
- Giảm payload messages client (follow-up P2-19 phần còn lại).
- Chọn thống nhất `/timer` vs `/vi/timer` (mục 6.1).
- `robots.ts` chỉ disallow `/dev/`; `/vi/dev/...` là 404 nên không cần thêm.
