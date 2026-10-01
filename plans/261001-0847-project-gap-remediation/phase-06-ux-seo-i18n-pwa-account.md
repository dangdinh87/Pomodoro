# Phase 06: UX, SEO, i18n, PWA, account

## Context links
- Report §4, §7: [review-261001-0847-project-gap-analysis.md](../reports/review-261001-0847-project-gap-analysis.md)
- Plan: [plan.md](plan.md) | SEO plan cũ: [260208-2253-seo-deep-overhaul](../260208-2253-seo-deep-overhaul/)

## Overview
- Date: 2026-10-01 | Priority: P2 | Status: pending | Effort: ~2d

## Key insights
- Canonical ở root bị mọi trang con kế thừa. `/guide`, `/privacy`, `/terms` canonical về homepage, nên có thể bị bỏ index.
- i18n chỉ chạy ở client, nên SSR luôn ra tiếng Anh. Điều này vô hiệu một phần đợt SEO overhaul tháng 2.
- PWA đang hỏng: icons 404, `sw.js` không được register và cũng không chạy được.
- Không có error boundary hay quản lý tài khoản.

## Requirements
1. Mỗi route có `error.tsx`. Có `global-error.tsx`. Có `loading.tsx` cho các route fetch nặng.
2. SEO:
   - Bỏ canonical ở root, mỗi trang tự khai canonical và metadata riêng.
   - Bỏ `hreflang` giả (hoặc làm route `/vi`, `/ja` thật).
   - Sitemap dùng ngày build. Landing có OG image.
3. i18n:
   - Locale lưu ở cookie, middleware detect `Accept-Language`.
   - `<html lang>` và `server-translations` đọc cookie.
   - Bổ sung 10 key `ja`, sửa key xung đột.
4. Font: `Be_Vietnam_Pro` thêm subset `vietnamese`, cắt bớt weight.
5. PWA: tạo icons (192, 512, maskable), sửa `manifest` (tên Study Bro, bỏ khoá orientation). Thay `sw.js` bằng Serwist **hoặc** xoá hẳn (theo câu hỏi 5).
6. Account: đổi mật khẩu, xoá tài khoản (cascade sau phase 02), export data JSON/CSV.
7. a11y: `<MotionConfig reducedMotion="user">`, tắt particles khi bật reduced-motion, `aria-live` chung cho mọi kiểu đồng hồ, skip link.
8. Feature ẩn: thay comment JSX bằng `src/config/feature-flags.ts`. Route bị tắt trả `notFound()`.

## Architecture
- `src/config/feature-flags.ts`: `{chat, history, leaderboard, progress}` đọc từ env `NEXT_PUBLIC_FEATURE_*`. Dùng ở sidebar, layout và `page.tsx`.
- `src/app/api/account/route.ts`: `DELETE` (cần service role hoặc RPC `delete_my_account()` SECURITY DEFINER có kiểm `auth.uid()`), `GET ?format=csv`.
- Locale: middleware set cookie `locale`. Root layout đọc qua `cookies()`.

## Related code files
- `src/app/layout.tsx:14-43,86`, `src/app/(landing)/page.tsx:43-48`, `src/app/sitemap.ts`, `src/app/robots.ts`
- `src/lib/server-translations.ts`, `src/contexts/i18n-context.tsx:70-82`, `src/i18n/locales/ja.json`
- `public/manifest.json`, `public/sw.js`
- `src/components/layout/app-sidebar.tsx`, `src/app/(main)/layout.tsx`, `src/components/settings/*`
- `src/components/ui/sparkles.tsx`, landing components

## Implementation steps
1. `error.tsx` ở `(main)`, `(landing)`, `(auth)` + `global-error.tsx`. Thêm `loading.tsx` cho tasks/history.
2. Metadata: xoá `alternates.canonical` ở root. Thêm `metadata` cho guide, privacy, terms, leaderboard, login, signup (auth và app pages đặt `robots: {index:false}`).
3. Bỏ `languages` giả trong `alternates`. Sitemap dùng `new Date()` lúc build. Landing OG thêm `images`.
4. Cookie locale + middleware matcher thêm `/`. `server-translations` load JSON theo locale. `<html lang={locale}>`.
5. Bổ sung key `ja`. Thêm script `scripts/check-i18n-keys.mjs` vào CI.
6. Font subset và weight.
7. PWA: tạo icons từ logo bằng `sharp` (đã có trong devDeps). Xử lý `sw.js` theo quyết định.
8. Settings mục "Tài khoản": đổi mật khẩu (`updateUser`), export, xoá tài khoản (2 bước xác nhận).
9. Thêm `MotionConfig` ở `app-providers`. Particles và sparkles dùng `dynamic(..., {ssr:false})` + `useReducedMotion`.
10. Feature flags thay cho comment JSX.

## Todo list
- [ ] Error/loading boundaries
- [ ] Metadata/canonical/hreflang/sitemap/OG
- [ ] i18n SSR qua cookie + ja keys + script check
- [ ] Font subsets
- [ ] PWA icons/manifest + quyết định SW
- [ ] Account: đổi pass, export, xoá
- [ ] Reduced motion, aria-live, skip link
- [ ] Feature flags

## Success criteria
- View-source `/guide` có canonical `/guide`. Google Rich Results test pass. Lighthouse PWA installable (nếu giữ PWA).
- Truy cập lần đầu với `Accept-Language: vi`: SSR ra tiếng Việt, `lang="vi"`.
- Xoá tài khoản thì không còn row nào của user trong DB.

## Risk assessment
- Đọc cookie ở root layout làm landing thành dynamic, mất static rendering. Cân nhắc route `/[locale]` nếu cần SSG. Đo TTFB trước và sau.
- Xoá tài khoản là thao tác không đảo ngược. Bắt xác nhận bằng cách gõ email.

## Security considerations
- Endpoint xoá account phải kiểm `getUser()`, rate limit, và chỉ xoá chính user gọi.
- Export không được kèm data của người khác (join leaderboard).

## Next steps
Phase 07.
