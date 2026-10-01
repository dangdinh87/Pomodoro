# Study Bro v2 Tech Stack Research — October 2026

**Date:** 2026-10-01 | **Current:** Next.js 14 + React 18 + Tailwind v3 | **Supabase:** Dead

---

## 1. Framework: Next.js 14 → 16 + React 19 + Tailwind v4

| Factor | Next.js 14 → 16 Upgrade | Notes |
|--------|-------------------------|-------|
| **Release** | Next.js 16 GA: Oct 21, 2025; now v16.2.x LTS | Next.js 14 end-of-life |
| **Breaking Changes** | Pages Router removed (forced App Router); sync request APIs gone; Turbopack default; `revalidateTag(tag, profile)` sig change; Node 20.9+ floor | Moderate migration for 14→15; then 15→16 is smaller |
| **React 19 Bundled** | Stable use() hook, ref-as-prop, Server Actions v2 | Genuinely useful for async data in Client Components |
| **Tailwind v4** | Oxide engine (Rust): 5× faster full builds, 100× faster HMR; CSS-native @theme instead of config JS; drops 40% legacy classes | Use @source directive in globals.css to force content watching; known HMR + class detection miss during dev |
| **Cost** | Moderate: @next/codemod handles turbopack move, lint migration, unstable_ prefix removal | Worth it: Turbopack cold starts + Tailwind v4 perf gains outweigh one-time migration friction |

**Recommendation:** Upgrade. Sister project (cv-app) already on 16; shared knowledge + Tailwind v4's Rust engine + Turbopack cold-start wins justify the effort. Migrate Tailwind v3 → v4 in postcss.config.mjs.

---

## 2. Database: Neon Postgres + Drizzle ORM

| Factor | Neon + Drizzle | Alternatives | Verdict |
|--------|-----------------|--------------|---------|
| **Neon specs** | Serverless Postgres; disaggregated compute/storage; copy-on-write branching; cold starts ~100–200ms | Turso (SQLite, edge replicas, sub-ms reads) | Neon for JSONB + FTS + extensions; Turso for edge-heavy read workloads |
| **ORM choice** | **Drizzle** ~7.4KB; zero deps; native serverless driver; SQL control; 40ms query cold-start vs 200ms Prisma | Prisma (larger bundle, more abstraction, mature docs) | Drizzle wins for serverless. Sister uses it successfully. |
| **Schema** | Source-of-truth SQL file + idempotent ALTERs; `pnpm db:pull` regenerates types | Prisma migrations | Admin mirrors via Drizzle introspection if sharing DB later |
| **Seeding** | SQL seeds or Drizzle seed script | TypeORM, fixtures | Lightweight; integrate early |

**Recommendation:** Neon Postgres + Drizzle ORM. Proven at scale (cv-app + admin). Edge latency fine for focus timer data; avoid Turso's SQLite if you need JSONB/complex indexing later.

---

## 3. Authentication: Better Auth v5 → Auth.js v5

| Factor | Better Auth | Auth.js v5 | Notes |
|--------|-------------|-----------|-------|
| **Status** | Now maintained by Better Auth team; Auth.js in security-patch mode | Guidance: use Better Auth for new projects | Auth.js team recommends Better Auth |
| **Session model** | DB rows (immediate revocation via delete); no vendor JWT | JWE-encrypted JWT; server-validates on read | Better Auth = simpler mental model for revocation |
| **Schema compat** | name/email/emailVerified required; auto-includes createdAt/updatedAt | These optional; different adapter schema | Not cross-compatible; choose once |
| **Features** | 50+ auth methods; TOTP/MFA; RBAC; org mgmt; passkeys; SAML; SCIM | 40+ OAuth providers; simpler; mature | Better Auth more comprehensive |
| **Community** | Smaller (newer); fewer SO answers | Larger; years of prod deployments | Better Auth docs improving; worth it for features |
| **Cost** | Free + OSS | Free + OSS | Both zero |

**Recommendation:** Better Auth. Guest mode (no email required initially) fits focus timer UX. Passkeys for optional stronger auth. sister project uses Auth.js v5 but Better Auth's session model + guest flow simpler here.

---

## 4. Guest Mode + Offline Sync

| Layer | Tech | Implementation |
|-------|------|-----------------|
| **Guest storage** | IndexedDB (Dexie.js wrapper recommended) | Per-user store; versioned schema; user-scoped profile + snapshots + outbox |
| **Session flow** | Guest writes to IndexedDB → Login → Merge on server | Field-level: base/local/remote; server-wins for true conflicts; CRDT (G-Set/OR-Set) if collision risk high |
| **Conflict rules** | Timestamps + user ID; focus sessions immutable; points aggregate | Define: session end time immutable, but points recalc is safe to re-run |
| **Fallback** | Dexie handles complex upgrades; idb for minimal wrapper | Avoid raw IndexedDB API in production |

**Unresolved:** Exact conflict resolution per data type (focus session overlap? points double-count?). Define before coding.

---

## 5. Vietnamese Payments: SePay Flow

| Component | Specs | Notes |
|-----------|-------|-------|
| **SePay integration** | Open Banking API; VietQR + NAPAS QR + intl cards; 12+ bank connections; 5-min setup | Sandbox available; webhook-driven (IPN) |
| **Webhook events** | Balance change IPN → webhook endpoint; no vendor sign key | Compare balance delta against order amount; idempotent retries via webhook delivery log |
| **Token scope** | webhook:read / webhook:write / webhook:delete | Test sandbox thoroughly before prod |
| **Refunds** | Bank transfer reversal (manual or API if exposed) | Subscription handling: track pro vs. free; calculate refund window |
| **Pricing** | % fee (check current rates) + settlement delays vary by bank | Build cost into pricing; FAQ section |

**Recommendation:** SePay webhook-based. No need for separate subscription logic if one-time purchases only; if subscriptions later, require manual renewal flow (simpler than SePay subscription API). Sister project uses SePay successfully; reuse webhook flow.

---

## 6. Leaderboard + Anti-Cheat

| Mechanism | Tech | Trade-offs |
|-----------|------|-----------|
| **Leaderboard storage** | **Postgres materialized view** (refresh manually) OR **Redis Sorted Sets** (via Upstash/Vercel KV) | Postgres: free, included; stale OK (refresh hourly). Redis: O(log N) scale; ~5× lower read latency; needed for >1000 QPS |
| **Session anti-cheat** | Server-signed timestamp + heartbeat (5–10s interval) | Tab hidden = throttle points; clock skew ±60s tolerance; multiple tabs flag (deny both) |
| **Timezone** | Asia/Ho_Chi_Minh boundary (day=UTC+7 00:00) | Track vnToday in schema; leaderboard queries filtered by day boundaries |
| **Friends leaderboard** | Follower table + view filter | Separate from global; cached if heavy |

**Recommendation:** Start with Postgres materialized view + server-signed session tokens + heartbeat. Migrate to Redis Sorted Sets only if >50K daily active users.

---

## 7. 3D Clocks: React Three Fiber v9 + drei

| Component | Tech | Constraints |
|-----------|------|-------------|
| **3D library** | react-three-fiber v9.7.0+ (current as of July 2026; pairs with React 19) | drei (utility components) for geometry/materials |
| **Hourglass viz** | Instancing (1000s of sand grains); particle system in Web Worker via OffscreenCanvas | Bundle ~50–80KB gzip; avoid on <50th percentile devices |
| **Materials** | Glass/transmission (physically-based) or simplified fallback | Limit lighting passes; bake shadows where static |
| **Mobile perf** | Draco compression + LOD; render at 30 FPS; test on iPhone SE 2 | Low-power detection: disable on battery < 20% |
| **Fallback** | Detect WebGL failure; render 2D canvas clock instead | Include feature detection + graceful degrade |

**Unresolved:** Exact hourglass grain count + physics solver (Cannon.js vs. Rapier.js). Prototype first.

---

## 8. Animation Libraries

| Library | Size | Strengths | Verdict |
|---------|------|-----------|---------|
| **motion** (v12.42.2) | 59.1 KB gzipped | React-native declarative; variants + stagger + AnimatePresence exits; spring/ease presets | Primary choice for UI reveals, focus-timer countdown, progress bars |
| **GSAP** (free 2025+) | 23 KB core (but 1.8 MB full suite) | ScrollTrigger (8y prod); timeline() choreography; runs anywhere (Vue/Svelte/vanilla) | Reserve for complex scroll or cross-framework needs; avoid unless timeline-heavy |
| **Rive** | 10–15× smaller than competitors | 2D state-machine animations; 120 FPS; skeletal rig + mesh deform | Use for mascot/avatar states (focus/tired/celebrating) |
| **Lottie** | ~50 KB | Web standard; After Effects export | Lower quality than Rive; use if AE files already exist |

**Recommendation:** motion v12 (primary) + Rive for mascot (if exists). Skip GSAP unless complex choreography emerges.

---

## 9. Audio: Tone.js + Howler.js + Licensed Sources

| Layer | Tech | Notes |
|--------|------|-------|
| **Playback** | Howler.js (~1.5M weekly DL) | Multi-format, sprite support, 3D audio fallback; manage volume + fades |
| **Synthesis** | Tone.js (~600K weekly DL) | Scheduling, synth, effects chain; overkill for ambient but useful if generative sounds later |
| **Ambient loops** | Pixabay Music, Uppbeat (free tier), Mixkit | 0–44 loops free; no attribution required; gapless via Howler looping |
| **Lo-fi beats** | Uppbeat "Lofi cuts"; Pixabay; Freesound community | Uppbeat: $6.99/mo removes attribution; paid plans unlock 300+ cuts |
| **Off-tab audio** | Media Session API (iOS 15.1+) + background tab policy | iOS: foreground only unless PWA + user interaction; use single-tab limit or audio gate |

**Licensing summary:** Pixabay/Mixkit safest (no strikes); Uppbeat paid tier cleanest; Freesound CC0 review each track. Budget: $0–$100/yr.

---

## 10. Backgrounds: Licensed Video/Image Sources

| Source | Specs | License |
|--------|-------|---------|
| Pexels / Pixabay | 4K stock photos/videos | CC0 / public domain |
| Unsplash | 2M+ photos | Unsplash License (free commercial) |
| Coverr | Stock video loops (15–60s) | Free + CC0 |
| **Format** | WebM (VP9, Opus) + fallback MP4 (H.264, AAC) | ~2–5 MB/30s loop; AVIF for static backgrounds |
| **Offline caching** | Service Worker + cache-first strategy | Lazy-load on scroll; pre-cache hero on install |

**Recommendation:** Coverr for looping; Pixabay for fallback images. Avoid auto-play on mobile unless muted + user gesture.

---

## 11. PWA: Serwist on Next.js 16

| Feature | Tech | Caveats |
|---------|------|---------|
| **Service Worker** | Serwist (next-pwa alternative) | Better Turbopack + v16 support; manual refresh control |
| **Offline timer** | Periodic Background Sync API (unreliable iOS) + page-visible fallback | iOS: foreground only; use visibilitychange event for page-visible timer |
| **Push notifications** | Web Push API | iOS 16.4+; Safari → Add to Home Screen only (not app store); Android: any source |
| **Install prompt** | beforeinstallprompt event; custom UI | iOS: hide (native flow); Android: show after 2 uses |

**Recommendation:** Cache static assets + index.html for offline fallback. Timer notifications via page-visible event (reliable). Push = defer if MVP.

---

## 12. AI: VietAPI / OpenRouter + Vercel AI SDK v7

| Component | Spec | Notes |
|-----------|------|-------|
| **Gateway** | OpenRouter (unified 60+ provider, OpenAI-compatible) OR Vercel AI Gateway (routing) | VietAPI: not found in 2026 docs; OpenRouter default for compatibility |
| **Vercel AI SDK** | v7 latest; @openrouter/ai-sdk-provider (community, not official) | Streaming, generateObject, tool-calling all work |
| **Model selection** | e.g., openrouter/openai-gpt-4-turbo for GPT-4 pricing | Use OpenRouter price comparison; don't over-fetch |
| **Cost control** | Per-plan quotas; track via API response usage; fail gracefully | E.g., Free: 1 AI call/session; Pro: unlimited |

**Unresolved:** Which VietAPI endpoint + pricing if not OpenRouter. Clarify before coding.

---

## 13. SEO for One-Page App

| Aspect | Implementation | Next.js 16 Support |
|--------|-----------------|-------------------|
| **Metadata** | generateMetadata() per route; dynamic title/desc/OG image | Built-in; render on server |
| **JSON-LD** | WebApplication schema (app type) + FAQPage + HowTo (for guides) | Inject as `<script type="application/ld+json">` in layout |
| **Sitemap** | generateSitemaps() for static routes (if not truly SPA) | Built-in robots.txt + sitemap.xml routes |
| **i18n hreflang** | alternates.languages object in generateMetadata; canonical | Automatic if using [locale]/page pattern |
| **Core Web Vitals** | 3D + audio load = perf hit; lazy-load canvas/audio on scroll | Use dynamicParams=false for 404 handling; preload critical fonts |

**Note:** Single-page apps (true SPA with client-side routing) harm SEO; implement static shell + dynamic content if rankings matter.

---

## Migration Checklist: cv-app Patterns Reusable

| Item | From cv-app | Status |
|------|-------------|--------|
| Neon Postgres connection | @neondatabase/serverless | Use as-is |
| Drizzle migrations | schema.sql (idempotent) | Adapt for Pomodoro schema |
| SePay webhook handler | app/api/webhooks/sepay/route.ts | Reuse pattern |
| Tailwind + motion | v4 + motion v12 | Already in cv-app; upgrade from v3 |
| Auth.js v5 | NextAuth provider setup | Consider Better Auth instead for guest flow |
| Phosphor icons | @phosphor-icons/react/dist/ssr | Already approved; use consistently |

---

## Summary: Recommended Stack

```
Framework:     Next.js 16.2 + React 19 + Tailwind v4 (Oxide engine) + Turbopack
Database:      Neon Postgres + Drizzle ORM (7.4 KB, serverless-native)
Auth:          Better Auth (50+ methods, passkeys, guest mode, TOTP)
Payments:      SePay webhooks (VietQR + NAPAS + intl cards)
Offline:       IndexedDB (Dexie.js) + sync-on-login; Postgres as source-of-truth
Leaderboard:   Postgres materialized view (start); Redis (if >50K DAU)
3D:            react-three-fiber v9 + drei + OffscreenCanvas; fallback to 2D canvas
Animation:     motion v12 + Rive (mascot states)
Audio:         Howler.js (playback) + Pixabay/Mixkit (loops); Tone.js (if synth later)
PWA:           Serwist + periodic background sync fallback (iOS caveat)
AI:            OpenRouter (OpenAI-compatible) + Vercel AI SDK v7
SEO:           generateMetadata + JSON-LD (WebApplication schema)
Styling:       Tailwind v4 @theme directive; no JS config file
```

---

## Unresolved Questions

1. **VietAPI specs:** Is VietAPI still active? If not, confirm OpenRouter chosen for AI layer.
2. **Hourglass physics:** Exact grain count + physics solver (Cannon.js vs. Rapier.js) TBD in prototype.
3. **Leaderboard conflict rules:** Define per data type — can focus sessions overlap? Can points be recalc'd?
4. **Audio licensing:** Exact budget + attribution requirements for lo-fi beats (Uppbeat paid vs. free tier).
5. **Better Auth schema:** Will guest + email-optional work cleanly? Test before full migration.
6. **iOS PWA push:** Accept that iOS push = Safari-only + foreground-only (no automatic wake), or defer PWA phase?

---

## Sources

- [Next.js 16 Upgrade Guide](https://versions.dev/modernize/nextjs/upgrade-to-nextjs-16)
- [Tailwind CSS v4 2026 Best Practices](https://dev.to/nayankyada/tailwind-css-in-2026-what-actually-changed-for-teams-21d5)
- [Drizzle vs Prisma 2026](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma)
- [Neon vs Turso Serverless Comparison](https://www.13labs.au/compare/neon-vs-turso)
- [Better Auth vs Auth.js v5](https://blog.logrocket.com/best-auth-library-nextjs-2026/)
- [SePay Payment Webhooks](https://developer.sepay.vn/en/sepay-oauth2/api-webhook)
- [React Three Fiber v9 Mobile Performance](https://krapton.com/blog/boosting-react-three-fiber-mobile-performance-a-deep-dive)
- [Motion v12 vs GSAP 2026](https://blog.openreplay.com/motion-vs-gsap/)
- [Howler.js vs Tone.js](https://www.pkgpulse.com/guides/howler-vs-tone-js-vs-wavesurfer-web-audio-javascript-2026)
- [Licensed Ambient Music Sources 2026](https://swarmify.com/blog/free-music-for-your-videos-the-importance-and-where-to-find/)
- [Serwist PWA on Next.js 16](https://blog.logrocket.com/nextjs-16-pwa-offline-support/)
- [Next.js SEO with JSON-LD 2026](https://pagepro.co/blog/nextjs-seo/)
- [IndexedDB Offline Sync Strategies](https://medium.com/@sohail_saifii/implementing-offline-first-with-indexeddb-and-sync-a-real-world-guide-0638c8d01056)
- [Spline vs Rive Animation Comparison](https://www.shaheermalik.com/compare/rive-vs-spline)
