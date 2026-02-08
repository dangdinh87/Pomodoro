# SEO Audit Report - Study Bro (pomodoro-focus.site)

## Problem Statement
Website `pomodoro-focus.site` không xuất hiện trên Google khi search bất kỳ keyword nào, bao gồm cả brand name "Study Bro" và domain trực tiếp.

**Kết quả kiểm tra:** `site:pomodoro-focus.site` → 0 results. **Google chưa index bất kỳ page nào.**

---

## Phát hiện theo mức độ nghiêm trọng

### CRITICAL - Nguyên nhân chính site không được index

#### 1. Chưa đăng ký Google Search Console
- **Impact:** Đây là nguyên nhân #1. Không có GSC = không submit sitemap = Google không biết site tồn tại
- Không monitor được crawl errors, indexing status
- Không request indexing thủ công được

#### 2. Toàn bộ Landing Page render client-side (13/13 components)
- **Files affected:** ALL files in `src/components/landing/`
- Tất cả đều có `'use client'` → nội dung render bằng JavaScript
- Googlebot thấy HTML rỗng trước khi JS chạy
- H1, descriptions, features — tất cả đều là dynamic text từ `useTranslation()` hook

```
# Đang dùng (Client - BAD for SEO):
Hero.tsx, Navbar.tsx, Features.tsx, FAQ.tsx, Footer.tsx, CTA.tsx,
HowItWorks.tsx, Pricing.tsx, AIChatIndicator.tsx...

# Có sẵn SSR versions nhưng KHÔNG DÙNG:
HeroSSR.tsx, NavbarSSR.tsx, FeaturesSSR.tsx
```

**Vấn đề cốt lõi:** `src/app/(landing)/page.tsx` import CLIENT versions thay vì SSR versions.

#### 3. Missing Canonical URL
- Không có `alternates.canonical` trong metadata
- Google có thể thấy `www.pomodoro-focus.site` và `pomodoro-focus.site` là 2 site khác nhau
- Dilute page authority

---

### HIGH - Ảnh hưởng lớn đến khả năng crawl

#### 4. Middleware chặn crawler
- `src/middleware.ts` chạy trên MỌI request (matcher rất broad)
- Mỗi request đều gọi `supabase.auth.getUser()` — thêm latency
- Crawler request cũng bị ảnh hưởng → tăng response time → Google crawl ít hơn
- **Fix:** Exclude landing page paths khỏi middleware matcher

#### 5. Sitemap có vấn đề
- `lastModified: new Date()` → mỗi lần request sitemap, date thay đổi → mislead Google
- Include login/signup pages → waste crawl budget
- Missing `guide` page mặc dù nó public

#### 6. I18n Architecture không SEO-friendly
- `I18nProvider` là `'use client'` → tất cả translations render client-side
- Server-side, page render HTML skeleton không có text
- Đã có `src/lib/server-translations.ts` nhưng landing page không dùng

---

### MEDIUM - Optimization issues

#### 7. Keyword Strategy yếu
- Title: "Study Bro" — không ai search cụm này
- "Pomodoro Timer" cạnh tranh cực cao (Pomofocus, Toggl, etc.)
- Không có Vietnamese keywords dù support tiếng Việt
- Description quá generic, không differentiate

#### 8. Thin Content
- Chỉ có 1 public indexable page (landing)
- Không blog, guides, hay educational content
- Đối thủ (Pomofocus, Forest) có hàng chục pages nội dung
- Google ưu tiên sites có content depth

#### 9. `html lang="en"` cứng
- Luôn là `en` dù có i18n vi/ja
- Google dùng `lang` attribute để quyết định hiển thị cho user nào
- Cần `hreflang` tags cho multi-language

#### 10. OpenGraph image dùng relative path
- `images: [{ url: '/card.jpg' }]` — nên dùng absolute URL
- Social sharing có thể không hiển thị ảnh đúng

---

## Code Organization Issues

| Issue | File | Description |
|-------|------|-------------|
| Dead SSR components | `HeroSSR.tsx`, `NavbarSSR.tsx`, `FeaturesSSR.tsx` | Tạo ra nhưng không import, gây confusion |
| Client-side i18n on landing | `src/contexts/i18n-context.tsx` | Toàn bộ text render phía client |
| Broad middleware matcher | `src/middleware.ts:74-85` | Ảnh hưởng performance cho tất cả routes |
| `new Date()` in sitemap | `src/app/sitemap.ts` | Dynamic date mỗi request |
| No `<link rel="canonical">` | `src/app/layout.tsx` | Missing trong metadata config |

---

## Recommended Solutions

### Approach A: Quick Fixes (1-2 ngày) — Recommended
1. **Setup Google Search Console** + verify domain + submit sitemap
2. **Switch landing page sang SSR components** — đã có sẵn `HeroSSR`, `FeaturesSSR`, `NavbarSSR`
3. **Add canonical URL** trong root layout metadata
4. **Fix sitemap** — static dates, remove login/signup
5. **Exclude landing paths từ middleware**
6. **Request indexing** qua GSC

### Approach B: Deep SEO Overhaul (1-2 tuần)
- Tất cả Approach A +
- Implement proper `hreflang` cho multi-language
- Create SEO-optimized sub-pages (guide, blog)
- Keyword research cho Vietnamese market
- Add structured data cho FAQ section
- Performance optimization (Core Web Vitals)
- Build backlinks strategy

### Approach C: Content-First Strategy (ongoing)
- Tất cả Approach A & B +
- Blog section với Pomodoro technique articles
- Study tips content
- Vietnamese keyword targeting
- Link building campaign

---

## Priority Action Items

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 1 | Setup Google Search Console | Critical | 15 min |
| 2 | Switch to SSR components on landing | Critical | 2-4h |
| 3 | Add canonical URL | High | 5 min |
| 4 | Fix sitemap (static dates, cleanup) | High | 30 min |
| 5 | Exclude landing from middleware | High | 15 min |
| 6 | Delete dead SSR component files hoặc actually use them | Medium | 30 min |
| 7 | Add hreflang tags | Medium | 1-2h |
| 8 | Fix OG image absolute URL | Low | 5 min |

---

## Success Metrics
- `site:pomodoro-focus.site` trả về results trong 1-2 tuần sau khi fix
- GSC shows 0 crawl errors
- Landing page HTML source chứa actual text content (không chỉ JS bundles)
- Core Web Vitals pass trên GSC
- Brand search "Study Bro" hiển thị site trong top 3

---

## Root Cause Summary
Site không được Google index vì **3 yếu tố kết hợp:**
1. Chưa setup Google Search Console → Google không biết site tồn tại
2. Toàn bộ content render client-side → Googlebot khó đọc nội dung
3. Site mới < 1 tháng → chưa đủ thời gian cho Google discover tự nhiên

**Hành động quan trọng nhất:** Setup GSC + switch sang SSR components. Sau đó request indexing và chờ 1-2 tuần.
