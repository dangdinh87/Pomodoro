# Phase 3: Content & Setup

## Context Links
- [Plan Overview](./plan.md)
- [Phase 1](./phase-01-critical-seo-fixes.md) (prerequisite)
- [Phase 2](./phase-02-seo-enhancement.md) (prerequisite)

## Overview
Phase 3 covers non-code activities (GSC setup, indexing requests) and optional content expansion (Vietnamese metadata, blog skeleton, backlinks). This phase has the longest tail -- GSC indexing takes 2-4 weeks.

## Key Insights
- GSC verification for Vercel: easiest method is DNS TXT record or HTML meta tag (already added in Phase 1)
- After verification, submitting sitemap is the #1 action to trigger indexing
- Vietnamese market is underserved for pomodoro tools -- "dong ho pomodoro" has low competition
- Blog is optional but valuable for long-tail SEO. Next.js MDX blog is minimal setup.
- Backlinks strategy: ProductHunt launch, dev tool directories, Vietnamese tech communities

## Requirements
1. Google Search Console verified and sitemap submitted
2. Homepage indexed within 2-4 weeks
3. Vietnamese keyword metadata on landing page
4. (Optional) Blog route skeleton with 1 sample post
5. Documented backlinks strategy

## Architecture

### GSC Setup Flow
```
1. Go to search.google.com/search-console
2. Add property: www.pomodoro-focus.site
3. Verify via HTML meta tag (already in metadata from Phase 1)
4. Submit sitemap: https://www.pomodoro-focus.site/sitemap.xml
5. Request indexing for homepage
6. Wait 2-4 weeks
```

### Blog Architecture (Optional)
```
src/app/(landing)/blog/
  ├── page.tsx          -- Blog index (list posts)
  ├── [slug]/
  │   └── page.tsx      -- Individual post (MDX or static)
  └── posts/
      └── pomodoro-technique-guide.mdx  -- First post
```

## Related Code Files

| File | Change Type | Description |
|------|------------|-------------|
| `src/app/layout.tsx` | **VERIFY** | GSC meta tag from Phase 1 |
| `src/app/(landing)/page.tsx` | **MODIFY** | Add Vietnamese keywords to metadata |
| `src/app/sitemap.ts` | **MODIFY** | Add blog URLs if blog created |
| `src/app/(landing)/blog/page.tsx` | **CREATE** (optional) | Blog index page |
| `src/app/(landing)/blog/[slug]/page.tsx` | **CREATE** (optional) | Blog post template |

## Implementation Steps

### Step 1: Google Search Console Setup

**Prerequisites**: Phase 1 deployed with GSC verification meta tag.

1. **Add Property**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Click "Add Property"
   - Choose "URL prefix" method
   - Enter: `https://www.pomodoro-focus.site`

2. **Verify Ownership**
   - Select "HTML tag" verification method
   - Copy the verification ID (just the content value, e.g., `abc123xyz`)
   - Update `src/app/layout.tsx` metadata:
     ```tsx
     verification: {
       google: 'abc123xyz',  // Replace with actual ID
     },
     ```
   - Deploy to Vercel
   - Click "Verify" in GSC

3. **Submit Sitemap**
   - In GSC sidebar: Sitemaps
   - Enter: `sitemap.xml`
   - Click Submit
   - Verify status shows "Success"

4. **Request Indexing**
   - In GSC: URL Inspection
   - Enter: `https://www.pomodoro-focus.site`
   - Click "Request Indexing"
   - Repeat for `/guide`, `/leaderboard`

5. **Verify Robots.txt**
   - In GSC: Settings > robots.txt
   - Ensure no unexpected blocks

### Step 2: Vietnamese Keyword Metadata

**File: `src/app/(landing)/page.tsx`**

Expand keywords array with Vietnamese terms:

```tsx
export const metadata: Metadata = {
  title: 'Study Bro - Free Pomodoro Timer with AI Coach & Task Management',
  description:
    'Free online Pomodoro timer with task linking, AI study coach, mini games for breaks, leaderboard, focus mode, and productivity analytics. No signup required. | Dong ho Pomodoro mien phi voi AI.',
  keywords: [
    // English
    'pomodoro timer',
    'pomodoro timer online',
    'free pomodoro timer',
    'study timer',
    'pomodoro timer with task list',
    'free pomodoro timer no signup',
    'focus timer online',
    'AI study coach',
    'productivity timer',
    // Vietnamese
    'dong ho pomodoro',
    'ung dung tap trung hoc tap',
    'pomodoro timer mien phi',
    'dong ho hoc bai',
    'ung dung pomodoro',
    'hen gio hoc tap',
    // Japanese
    'ポモドーロタイマー',
    'ポモドーロ 無料',
    '集中タイマー',
  ],
  // ... rest of metadata
};
```

> Note: Vietnamese keywords use ASCII transliteration in meta keywords. The actual Vietnamese text (with diacritics) goes in description and page content via translations.

### Step 3: Blog Architecture (Optional)

Skip if time-constrained. This is a skeleton only -- content is separate effort.

**File: `src/app/(landing)/blog/page.tsx`** (NEW)

```tsx
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog - Study Bro | Pomodoro Tips & Productivity Guides',
  description: 'Productivity tips, Pomodoro technique guides, and study strategies from the Study Bro team.',
  alternates: {
    canonical: 'https://www.pomodoro-focus.site/blog',
  },
};

// Hardcoded posts for now. Move to MDX/CMS later.
const posts = [
  {
    slug: 'pomodoro-technique-complete-guide',
    title: 'The Complete Guide to the Pomodoro Technique in 2026',
    excerpt: 'Learn how the Pomodoro Technique works, why it boosts productivity, and how to customize it for your workflow.',
    date: '2026-02-15',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-slate-200 dark:border-white/10 pb-8">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-semibold hover:text-blue-600 transition-colors">{post.title}</h2>
              </Link>
              <time className="text-sm text-muted-foreground mt-2 block">{post.date}</time>
              <p className="mt-4 text-muted-foreground">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**File: `src/app/(landing)/blog/[slug]/page.tsx`** (NEW)

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Static posts data -- replace with MDX loader later
const postsContent: Record<string, { title: string; content: string; date: string }> = {
  'pomodoro-technique-complete-guide': {
    title: 'The Complete Guide to the Pomodoro Technique in 2026',
    date: '2026-02-15',
    content: `
      <h2>What is the Pomodoro Technique?</h2>
      <p>The Pomodoro Technique is a time management method developed by Francesco Cirillo...</p>
      <!-- Full content to be written separately -->
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(postsContent).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = postsContent[params.slug];
  if (!post) return {};
  return {
    title: `${post.title} | Study Bro Blog`,
    description: post.content.slice(0, 160).replace(/<[^>]*>/g, ''),
    alternates: { canonical: `https://www.pomodoro-focus.site/blog/${params.slug}` },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = postsContent[params.slug];
  if (!post) notFound();

  return (
    <article className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl prose dark:prose-invert">
        <h1>{post.title}</h1>
        <time className="text-muted-foreground">{post.date}</time>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </article>
  );
}
```

**File: `src/app/sitemap.ts`** -- add blog URLs:
```tsx
{
  url: `${baseUrl}/blog`,
  lastModified,
  changeFrequency: 'weekly',
  priority: 0.7,
},
{
  url: `${baseUrl}/blog/pomodoro-technique-complete-guide`,
  lastModified,
  changeFrequency: 'monthly',
  priority: 0.8,
},
```

### Step 4: Backlinks Strategy

**Document for reference (not code):**

#### Tier 1: High-Impact, Low-Effort
1. **ProductHunt Launch**
   - Post Study Bro on ProductHunt
   - DA 90+ backlink, traffic spike
   - Prep: screenshots, tagline, maker comment

2. **Dev Tool Directories**
   - Submit to: alternativeto.net, saashub.com, toolhunt.net
   - Category: Productivity > Pomodoro Timer

3. **GitHub Repository**
   - If open source: GitHub README link back to site
   - Create a "Made with" section

#### Tier 2: Community Engagement
4. **Reddit**
   - r/productivity, r/GetStudying, r/pomodoro
   - Share as "I built this" or answer pomodoro questions with link
   - Vietnamese: r/VietNam, r/LearnVietnamese

5. **Vietnamese Tech Communities**
   - viblo.asia (Vietnamese dev blog platform)
   - Write article about building the app
   - Target: "ung dung pomodoro viet nam"

6. **Japanese Communities**
   - Qiita (Japanese dev blog)
   - Write technical article about Next.js SSR

#### Tier 3: Content-Based (requires blog)
7. **Guest Posts**
   - Productivity blogs, study technique sites
   - Topic: "How I Built a Pomodoro Timer with AI"

8. **Listicle Outreach**
   - Find "best pomodoro timer" articles
   - Contact authors to include Study Bro

### Step 5: Monitor Indexing Progress

After GSC setup and sitemap submission:

1. **Week 1**: Check GSC Coverage report daily
2. **Week 2**: Check if homepage appears in `site:pomodoro-focus.site`
3. **Week 3**: Check brand search "Study Bro" in Google
4. **Week 4**: Review Search Performance report in GSC

If not indexed after 4 weeks:
- Re-request indexing via URL Inspection
- Check for any crawl errors in GSC
- Verify no `noindex` tags accidentally added
- Check Vercel deployment headers (no `X-Robots-Tag: noindex`)

## Todo List
- [ ] Setup Google Search Console property
- [ ] Verify ownership via HTML meta tag
- [ ] Submit sitemap.xml
- [ ] Request indexing for homepage, /guide, /leaderboard
- [ ] Add Vietnamese + Japanese keywords to landing metadata
- [ ] (Optional) Create blog skeleton with 1 post
- [ ] (Optional) Update sitemap with blog URLs
- [ ] Document backlinks strategy
- [ ] Submit to ProductHunt + directories
- [ ] Monitor indexing weekly for 4 weeks

## Success Criteria
- [ ] GSC verified and sitemap status = "Success"
- [ ] URL Inspection shows "URL is on Google" within 4 weeks
- [ ] `site:pomodoro-focus.site` returns at least 1 result within 4 weeks
- [ ] Brand search "Study Bro" shows the site within 6 weeks
- [ ] Vietnamese keywords appear in landing page metadata
- [ ] (Optional) Blog index page accessible at /blog

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Google still doesn't index after 4 weeks | Medium | High | Re-request indexing, check for technical blockers in GSC, ensure no `noindex` headers from Vercel |
| ProductHunt launch gets low traction | Medium | Low | Not critical for SEO, just one backlink source. Focus on directories. |
| Vietnamese keywords don't rank | Medium | Low | Low competition = easier to rank eventually. Content in Vietnamese blog posts helps long-term. |
| Blog content quality too thin | Low | Medium | Start with 1 comprehensive post (2000+ words). Quality over quantity. |

## Security Considerations
- GSC verification: only site owner should have access. Use your Google account, not shared.
- Blog: `dangerouslySetInnerHTML` used for post content -- only safe because content is hardcoded in codebase, not user-generated. If migrating to CMS, sanitize HTML.
- No sensitive data exposed in metadata or structured data.

## Next Steps
After Phase 3:
1. Monitor GSC weekly for 4 weeks
2. Write first blog post (Pomodoro technique guide)
3. Consider URL-based i18n (/vi/, /ja/) for dedicated Vietnamese/Japanese SEO
4. Consider adding HowTo structured data for the Pomodoro technique
5. Set up Google Analytics 4 events for conversion tracking (signup from landing)
