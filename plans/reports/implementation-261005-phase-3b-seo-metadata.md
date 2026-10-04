# Phase 3b: SEO theo ngôn ngữ (metadata, hreflang, sitemap, JSON-LD, OG) + vài việc hiệu năng

Ngày 2026-10-05, nhánh `feat/design-system`. Trạng thái: xong, chưa chạy `next build` (theo luật). Commit: `587fbb0` (perf db), `f18d77a` (routing), `7de6663` (SEO). Dựa trên `implementation-261005-phase-3a-lang-routing.md`.

## 1. Title và description cuối (nằm trong `site.meta.*` của 3 file locale)

Trang con chỉ khai báo title trần, root template `%s | Study Bro` thêm thương hiệu. Home dùng `title.absolute` vì title đã có thương hiệu.

| Trang | Ngôn ngữ | Title hiển thị | Độ dài |
|---|---|---|---|
| Home | en | Pomodoro Timer Online – Free, No Signup \| Study Bro | 51 |
| Home | vi | Đồng hồ Pomodoro online miễn phí – Hẹn giờ học tập \| Study Bro | 62 |
| Home | ja | ポモドーロタイマー（無料・登録不要）\| Study Bro | 29 ký tự |
| Guide | en | Pomodoro Technique Guide: 25/5, 50/10 and 52/17 \| Study Bro | 59 |
| Guide | vi | Phương pháp Pomodoro là gì? Hướng dẫn cách dùng \| Study Bro | 59 |
| Guide | ja | ポモドーロ・テクニックとは？やり方と時間設定ガイド \| Study Bro | 37 ký tự |
| Privacy / Terms | en, vi, ja | Privacy Policy / Chính sách quyền riêng tư / プライバシーポリシー; Terms of Service / Điều khoản sử dụng / 利用規約 (+ `\| Study Bro`) | ngắn |

Description (home): en 139, vi 152, ja 63 ký tự (ja ngắn vì Google hiển thị theo bề rộng). Ba bản viết riêng: vi nhắm "đồng hồ pomodoro online miễn phí / hẹn giờ học tập", ja nhắm "ポモドーロタイマー / 登録不要", guide vi dùng "phương pháp (kỹ thuật) Pomodoro" vì từ khoá tìm kiếm là "phương pháp". Test `meta-copy.test.ts` giữ ngân sách (en ≤ 60, vi ≤ 62, ja ≤ 66 đơn vị bề rộng; description ≤ 155 en/vi), thương hiệu đúng 1 lần, không còn "•", 3 ngôn ngữ khác nhau. Tiêu đề VI home 62 ký tự là vượt 60 một chút, chấp nhận (keyword "học tập" có giá trị); Google cắt theo pixel nên chưa chắc cắt.

Root `src/app/layout.tsx` (vẫn là layout đi thẳng): `metadataBase`, `title { default: 'Study Bro: Free Pomodoro Timer', template: '%s | Study Bro' }`, manifest, icons, viewport. Đã bỏ `keywords`, bỏ `openGraph` mặc định có `en_US` cứng.

Lỗi đã bắt khi chạy thật: lúc đầu `[lang]/layout.tsx` trả `title: { absolute }` làm template của root bị reset (title trang con mất " | Study Bro"). Đã bỏ title khỏi layout `[lang]` và có test chặn tái phát (`layout.test.tsx`).

## 2. Canonical, hreflang, OG

`buildPageMetadata({ locale, path, title, description, titleAbsolute? })` ở `src/lib/seo/page-metadata.ts`, URL dựng ở `src/lib/seo/urls.ts` (`pageUrl`, `languageAlternates`, `ogImageUrl`, `OG_LOCALE`) từ `SITE_URL`. Canonical tuyệt đối, tự tham chiếu, không bao giờ trỏ VI/JA về EN. `og:locale` en_US/vi_VN/ja_JP + `alternateLocale` hai ngôn ngữ còn lại, `og:url`, `og:image` + `twitter:image` theo ngôn ngữ, alt dịch (`site.meta.og.alt`), `og:title` là title đầy đủ có thương hiệu.

Ma trận hreflang đo trên dev (giống hệt ở cả 3 trang của một cụm; ví dụ guide):

| Trang | canonical | en | vi | ja | x-default |
|---|---|---|---|---|---|
| /guide | https://studywithbro.com/guide | …/guide | …/vi/guide | …/ja/guide | …/guide |
| /vi/guide | https://studywithbro.com/vi/guide | (cùng) | (cùng) | (cùng) | (cùng) |
| /ja/guide | https://studywithbro.com/ja/guide | (cùng) | (cùng) | (cùng) | (cùng) |

Kiểm theo skill `seo-hreflang`: tự tham chiếu và khớp canonical từng ký tự (không dấu `/` cuối ở home); đủ tag trả về (full mesh, cùng một hàm sinh ra mọi bản); một x-default = EN; mã ngôn ngữ ISO 639-1 hợp lệ (en/vi/ja); toàn HTTPS; URL `?panel=` và `/en/*` không nằm trong cụm. Lưu ý: React SSR in thuộc tính là `hrefLang` (HTML không phân biệt hoa thường, Google đọc đúng). HTML và sitemap cùng khai hreflang: mức Low theo skill, chấp nhận vì hai nơi sinh ra từ cùng `languageAlternates`.

## 3. Sitemap và robots

`src/app/sitemap.ts`: 4 trang x 3 ngôn ngữ = 12 URL, mỗi URL mang cả cụm hreflang (kể cả chính nó) + x-default. `lastmod` cố định theo trang trong `src/lib/seo/pages.ts` (`PAGE_UPDATED`: home và guide 2026-10-05, privacy và terms 2026-10-02), cùng hằng số này cấp `dateTime` hiển thị "Cập nhật lần cuối" ở guide và legal-page nên không lệch nhau. Quy ước: sửa nội dung thì tăng ngày trong cùng commit. Mẫu đo trên dev:

```
<loc>https://studywithbro.com/vi</loc>
<xhtml:link rel="alternate" hreflang="en" href="https://studywithbro.com" />
<xhtml:link rel="alternate" hreflang="vi" href="https://studywithbro.com/vi" />
<xhtml:link rel="alternate" hreflang="ja" href="https://studywithbro.com/ja" />
<xhtml:link rel="alternate" hreflang="x-default" href="https://studywithbro.com" />
<lastmod>2026-10-05</lastmod><changefreq>weekly</changefreq><priority>1</priority>
```

`robots.ts` không đổi: `Disallow: /api/ /auth/ /dev/` + `Sitemap: https://studywithbro.com/sitemap.xml` (thêm test).

## 4. JSON-LD (`src/lib/seo/json-ld.ts`, component `JsonLd`, escape `<` theo guide Next)

| Trang | Kiểu |
|---|---|
| Mọi trang dưới `[lang]` (layout) | `WebSite` (inLanguage en/vi/ja, publisher) + `Organization` (name Study Bro, logo `/icons/icon-512x512.png` 512x512) |
| Home mỗi ngôn ngữ | `WebApplication` (`@id` riêng mỗi ngôn ngữ, `url` theo ngôn ngữ, `inLanguage` đúng 1 mã, `applicationCategory: EducationalApplication`, `offers.price 0`, `isAccessibleForFree`, `featureList` dịch, `image` OG) + `FAQPage` (8 Q&A dịch, `inLanguage`, `url`) |
| Guide | `HowTo` (6 bước, `inLanguage`, `url`) |
| Privacy, Terms, 404 | không có gì ngoài WebSite + Organization (đã bỏ `WebApplication` sitewide) |

Test: shape từng kiểu, đúng loại ở từng trang x 3 ngôn ngữ, privacy/terms không có `WebApplication`, serialize round-trip và escape `</script>`. `Organization.sameAs` chưa có (chưa có hồ sơ mạng xã hội).

## 5. Ảnh OG theo ngôn ngữ

`src/app/[lang]/opengraph-image.tsx` (git mv từ `src/app/opengraph-image.tsx`), 1200x630, sinh lúc build cho en/vi/ja nhờ `generateStaticParams` của layout. URL: `/opengraph-image` (EN), `/vi/opengraph-image`, `/ja/opengraph-image`; proxy rewrite `/opengraph-image` sang `/en/...` và 308 `/en/opengraph-image` về bản không prefix (đã đo). Tagline: EN "Free Pomodoro timer · tasks · focus sounds", VI "Pomodoro miễn phí · việc cần làm · âm thanh nền", JA "無料ポモドーロタイマー・タスク管理・環境音" (cỡ chữ riêng từng ngôn ngữ để vừa viên thuốc). Font: Baloo 2 (đã có đủ dấu tiếng Việt, kiểm bằng fontTools) và subset Zen Maru Gothic Bold chỉ 8 KB (25 glyph của tagline JA, OFL), nên không bundle font JP đầy đủ. Test đọc bảng cmap của font để chắc mọi ký tự tagline có glyph; sửa tagline thì phải dựng lại subset, hướng dẫn trong `assets/fonts/README.md`. `twitter:image` đặt tường minh trong `buildPageMetadata`.

Ảnh đã xem bằng Read, đúng dấu VI và kana/kanji JA: `plans/reports/assets-261005-relaunch/3b-og-en.png`, `3b-og-vi.png`, `3b-og-ja.png` (không commit).

## 6. Quy tắc redirect `/timer`

Chọn: `/timer` là trang hẹn giờ cũ, nên về **trang chủ của ngôn ngữ đó** (`/`, `/vi`, `/ja`), không về `?panel=timer` (panel `timer` là cài đặt hẹn giờ, phím C). Làm trong proxy (`LEGACY_PAGES.timer = null`), không phải sửa `next.config.ts`. Đo: `/timer`, `/en/timer` -> `/`; `/vi/timer` -> `/vi`; `/ja/timer` -> `/ja`; query được giữ. `legacy-redirects.test.ts` đọc `redirects()` của `next.config.ts` rồi so với proxy cho từng trang cũ x 3 ngôn ngữ, nên hai tầng không thể lệch nhau nữa.

## 7. PGlite (`perf(db)`)

`src/db/index.ts`: bỏ import tĩnh `@electric-sql/pglite` và `drizzle-orm/pglite` (adapter drizzle cũng import PGlite). Hai module chỉ nạp bằng `import()` ở nhánh local (không có `DATABASE_URL` và không phải Vercel) qua top-level await; `db` vẫn là Proxy đồng bộ, database vẫn tạo lười ở lần dùng đầu (không mở `.pglite` lúc import, nên `next build` nhiều worker không đụng nhau). Có `DATABASE_URL`: PGlite không bao giờ được nạp.

Phát hiện quan trọng: probe bằng `@vercel/nft` cho thấy **import động dạng chuỗi vẫn bị trace** (16 file pglite, cả hai kiểu). Nên chỉ đổi import là chưa đủ để giảm dung lượng function. Đã thêm `outputFileTracingExcludes: { '/*': [...pglite, ...pnpm path] }` vào `next.config.ts` (chỉ commit hunk của mình; hunk Permissions-Policy của weather để nguyên). Chưa kiểm được bằng build: CI cần xem `.next/server/**/*.nft.json` không còn `pglite`. Test khoá cả hai (không import tĩnh, không nạp khi có URL/Vercel, tạo lười đúng 1 lần, exclude tồn tại).

## 8. API động còn lại

Grep sạch: không còn `cookies()`/`headers()`/`connection()`/`searchParams` ở layout hay trang dưới `[lang]` và root layout. `headers()` chỉ còn trong `src/lib/auth/session-user.ts`, dùng bởi các route `/api/*` (đúng chỗ). `useSearchParams` chỉ ở `trackings/ga.tsx`, đã bọc Suspense. Còn dynamic có chủ đích: `[lang]/[...rest]` (404), route API, `sitemap` (`force-static`). Manifest và `lang`/`start_url` giữ nguyên (`/`, `en`): một manifest chung cho PWA là đủ.

## 9. Tài liệu Next 16 đã đọc (Read)

- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` (template/absolute/default, alternates.languages, openGraph, merging)
- `.../03-file-conventions/01-metadata/opengraph-image.md` (params là Promise, tĩnh hoá, font cục bộ)
- `.../01-metadata/sitemap.md` (sitemap có `alternates.languages`), `.../01-metadata/robots.md`
- `node_modules/next/dist/docs/01-app/02-guides/json-ld.md` (escape `<`)
- `.../05-config/01-next-config-js/output.md` (`outputFileTracingExcludes`)
- Mã nguồn: `dist/lib/metadata/resolvers/resolve-title.js` (nguyên nhân template bị reset), `dist/build/collect-build-traces.js` (cách khớp khoá route `'/*'` với `contains`)

## 10. Test và gate

Mới: `urls`, `page-metadata`, `meta-copy`, `json-ld`, `llms-txt`, `sitemap`, `robots`, root `layout`, `[lang]/layout`, `landing-pages` (metadata + JSON-LD guide/privacy/terms x 3), home (JSON-LD, hreflang, title tuyệt đối), `[...rest]`, `opengraph-image` (PNG 1200x630 mỗi ngôn ngữ, glyph), `legacy-redirects`, `db/index`; cập nhật `locale-routing`, `proxy`. `pnpm type-check` sạch, `pnpm lint` 0 error, `pnpm i18n:check` OK (1366 key), `pnpm test`: chỉ còn 5 ca `weather-mood` (WIP thời tiết) và 1 ca flaky `otp-limits.test.ts` của phiên khác (file chưa commit, chạy riêng thì qua).

Runtime :3001 (`/`, `/vi`, `/ja`, `/vi/guide`, `/ja/privacy`): title, canonical, 4 hreflang, og:locale, og:image đúng ngôn ngữ; `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/manifest.json` đúng; 3 ảnh OG 200 `image/png`.

## 11. Việc còn lại / câu hỏi mở

- CI/preview: xác nhận `pglite` biến mất khỏi nft; 12 trang static; HTML 404 lồng. Trong dev, 404 của `/vi/nope` vẫn là vỏ lỗi Next nên title ra mặc định "Study Bro: Free Pomodoro Timer" (noindex), `generateMetadata` của `[...rest]` chưa thấy tác dụng; nếu build prod cũng vậy thì xoá cho gọn.
- Sau deploy: Rich Results Test cho FAQPage/HowTo/WebApplication, gửi sitemap lên GSC và theo dõi mục hreflang/Pages trong vài tuần.
- Nội dung: H1 guide VI vẫn là "Kỹ thuật Pomodoro" trong khi title dùng "Phương pháp Pomodoro" (đã giải thích ở mục 1); cân nhắc đồng bộ khi viết bài `/vi/phuong-phap-pomodoro`. Chưa đánh giá văn hoá JA/VI sâu (profile của skill hreflang), chỉ viết bản địa.
- Thêm `Organization.sameAs` và `twitter:site` khi có tài khoản mạng xã hội.
- `llms.txt` ghi cứng domain `studywithbro.com` (khớp mặc định `SITE_URL`); test chỉ đúng khi `NEXT_PUBLIC_SITE_URL` chưa đổi.
