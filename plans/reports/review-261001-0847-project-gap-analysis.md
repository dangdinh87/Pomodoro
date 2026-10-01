# Review toàn diện Study Bro: những gì còn thiếu

- Ngày: 2026-10-01 | Branch `master` @ `f3031c9`
- Cách làm:
  - 5 reviewer chạy song song: security/API, DB, core features, quality/tooling, UX/SEO/i18n.
  - 1 researcher so sánh với đối thủ.
  - Chạy thật `tsc`, `lint`, `jest`.
  - Tự kiểm lại các finding Critical/High.
- Quy ước: **[V]** = đã verify trực tiếp (chạy lệnh hoặc đọc code). Không gắn = reviewer báo, đã đọc lướt code.
- Plan khắc phục: [plans/261001-0847-project-gap-remediation/plan.md](../261001-0847-project-gap-remediation/plan.md)

---

## Tóm tắt

UI và tính năng nhiều (timer 5 kiểu đồng hồ, audio, YouTube, 6 mini-game, AI chat, i18n 3 ngôn ngữ). **Nền móng thì mỏng.** Cụ thể:
- DB không tái tạo được từ repo.
- Có lỗ bảo mật thật.
- Dữ liệu phiên học bị ghi sai.
- Gần như không có test, không có CI, và build bỏ qua lỗi.

### Top 10 cần xử lý (đều đã verify)

| # | Vấn đề | Mức |
|---|---|---|
| 1 | Bảng `tasks`, `sessions` không có `CREATE TABLE` và RLS trong repo. Migration 003/004 mất, 009/010 rỗng 0 byte. | Critical |
| 2 | Open redirect ở `auth/callback`: `next=/\evil.com` dẫn tới `https://evil.com/` **[V chạy node]** | High |
| 3 | RPC `increment_task_pomodoro`: SECURITY DEFINER, nhận `user_id` từ caller, không set `search_path` **[V]** | High |
| 4 | `/api/chat`: không rate limit, không giới hạn message, không `max_tokens`. Chi phí LLM có thể bị lạm dụng. | High |
| 5 | `/api/tasks/session-complete` không validate `durationSec`/`mode`, nên có thể gian lận leaderboard; thiếu field thì ghi NaN **[V]** | High |
| 6 | Bug timer làm sai dữ liệu: duration sai sau reload, mất phiên khi đóng tab, ghi trùng khi mở nhiều tab **[V một phần]** | High |
| 7 | Optimistic update của tasks không chạy: query key không khớp **[V]** | High |
| 8 | Build bỏ qua lỗi TS/ESLint. Không CI. Có 20 lỗi TS thật, lint fail, 1 test fail **[V]** | High |
| 9 | Không có security headers. `images.remotePatterns: **` biến `/_next/image` thành image proxy mở **[V]** | High |
| 10 | SEO: canonical ở root trỏ về homepage, mọi trang con kế thừa. `hreflang` 3 ngôn ngữ cùng 1 URL **[V]** | High |

---

## 0. Baseline (chạy thật)

| Check | Kết quả |
|---|---|
| `pnpm type-check` | **129 lỗi**: 20 ở code chạy, 109 ở file test do thiếu `@types/jest` |
| `pnpm lint` | exit 1. 3 error do `eslint-disable` trỏ tới rule `@typescript-eslint/*` chưa cài, 15 `exhaustive-deps`, 3 `no-img-element` |
| `pnpm test` | **2/18 fail**. Thực chất 1 test (`timer-settings-dock`, sai aria-label) bị chạy 2 lần vì Jest quét cả `.kilo/worktrees/` |
| Coverage | Báo 44% nhưng không có `collectCoverageFrom`, chỉ tính file mà test import. Coverage thật vài %: 5 file test trên khoảng 500 file. |
| CI | Không có `.github/`, husky, lint-staged |
| Build gate | `next.config.js`: `ignoreBuildErrors` và `ignoreDuringBuilds` đều `true` |
| Local setup | `node_modules` chưa cài sẵn. Phiên này đã chạy `pnpm install --frozen-lockfile`. |

---

## 1. Bảo mật & API

### High
- `src/app/auth/callback/route.ts:22`: check `startsWith('/') && !startsWith('//')` bị bypass bằng `/\evil.com` **[V]**. Đây là phishing sau login.
  - Fix: `const u = new URL(next, origin); if (u.origin !== origin) fallback`.
- `migrations/002_increment_task_pomodoro.sql`: SECURITY DEFINER và `user_id_input` do caller truyền **[V]**.
  - Supabase mặc định cấp EXECUTE cho anon và authenticated.
  - Ai biết `task_id` và `user_id` (user_id lộ qua view leaderboard) đều sửa được counter của người khác.
  - Fix: dùng `auth.uid()`, `SET search_path = ''`, `REVOKE ... FROM anon, public`.
- `src/app/api/chat/route.ts`:
  - Không rate limit hay quota. Không cap số lượng hoặc độ dài message. Không `max_tokens`. `generateTitle` gọi LLM thêm 1 lần.
  - Prompt ghi "không giới hạn chủ đề", nên endpoint này thành proxy LLM miễn phí cho mọi tài khoản free.
- `src/app/api/tasks/session-complete/route.ts:19-31`: `durationSec` không có cap. `mode` không check enum. `Math.round(undefined)` ra NaN **[V]**. Không dedupe, không rate limit.
- `next.config.js`:
  - Không có `headers()` (CSP, `frame-ancestors`, nosniff, Referrer-Policy) và không có `vercel.json`.
  - `remotePatterns` cho phép `**` cả http lẫn https **[V]**.
- `NEXT_PUBLIC_MEGALLM_API_KEY`:
  - Có giá trị trong `.env` local (72 ký tự) và có trong `.env.example` **[V]**.
  - `src` hiện không đọc biến này nên chưa vào bundle. Chỉ cần 1 dòng code tham chiếu là key lộ ra client.
  - Fix: xoá biến, kiểm Vercel env, rotate nếu từng set ở đó.

### Medium
- `api/tasks/route.ts:96`: `q` nối thẳng vào `.or(\`title.ilike.%${q}%...\`)` **[V]**, gây PostgREST filter injection.
  - Vẫn bị giới hạn trong `user_id`, nhưng phá được filter `is_deleted` và gây 500.
  - `dateField` không whitelist. `limit`/`page` không clamp và có thể ra NaN.
- `api/tasks/task-schemas.ts:122,184`: `parent_task_id` không check UUID hay ownership.
- `api/feedback/route.ts`: không auth, không rate limit, không captcha, không validate độ dài/email. RLS ở `014` là `WITH CHECK (true)` nên giả `user_id` được.
- `api/chat/route.ts`:
  - `conversationId` không check ownership trước khi ghi `messages` (dựa hoàn toàn vào RLS).
  - Client giả được lượt `assistant`, vì history lấy từ client chứ không từ DB.
  - Lỗi upstream bị stream nguyên văn ra client.
- `conversations`, `tags`, `tasks` trả thẳng `error.message` của Supabase. Response shape không thống nhất: chat trả text, các route khác trả JSON.
- `src/middleware.ts:50`: đoạn redirect bảo vệ route bị comment **[V]**. `(main)/layout.tsx` là client component, nên không có chặn server-side. Data vẫn an toàn nhờ API check `getUser()`.
- `API_ROUTE_TOKEN` (`tasks/route.ts`, `tasks/[id]`): fail-open khi env trống, thực tế là dead code. Nên xoá.
- Không có zod hay schema validation chung cho request body.

### Low
- `auth/callback` reflect `error.message` vào query của `/login`.
- `middleware.ts` dùng cookie API cũ `get/set/remove`; các chỗ khác dùng `getAll/setAll`.
- `lib/chat-tools/*` chưa được chat route dùng (dead code). Lệnh update cuối không có `user_id`.

---

## 2. Database

- **Schema drift [V]**: chỉ tìm thấy `ALTER`, không có `CREATE TABLE` cho `tasks` và `sessions`, cũng không có RLS cho `tasks`.
  - Các cột `title`, `status`, `priority`, `time_spent`, `actual_pomodoros`, `is_deleted` không được định nghĩa ở đâu.
  - Thiếu Supabase CLI (`supabase/`, `config.toml`), seed và `database.types.ts`, nên client chạy không có type.
- **Không dựng lại DB được.** DB live là nguồn sự thật duy nhất. Cần `supabase db dump` thành baseline migration.
- `tasks.user_id` và `sessions.user_id` là TEXT (`007:76` có cast `p.id::text`).
  - Không có FK tới `auth.users`, không `ON DELETE CASCADE`, nên xoá account vẫn để lại data.
  - Phép cast làm mất index trong RLS và trong join.
- View `leaderboard` (`007:51`):
  - Chạy bằng quyền owner nên bypass RLS, lộ `user_id`/name/avatar/tổng giờ cho anon.
  - `profiles` có `SELECT USING (true)`.
  - Migration `008` lấy phần trước `@` của email làm tên public.
- `get_leaderboard` (`011`): SECURITY DEFINER, `012` grant cho anon **[V]**, nhưng không chỗ nào trong `src` gọi (dead).
- Thiếu index: `sessions(user_id, created_at DESC)`, `sessions(task_id)`, `tasks(user_id, is_deleted, display_order)`. Index ở `013` là single-column nên query không dùng được.
- `api/stats`, `api/history`, `api/tasks/analytics`: kéo hết rows rồi aggregate bằng JS. History không có limit.
- `session-complete`:
  - Insert session, gọi RPC và upsert streak không nằm trong 1 transaction.
  - Streak tính theo ngày UTC, nên user VN (UTC+7) bị gãy streak khi học từ 0h đến 7h sáng.
- `api/tasks/reorder`: N lệnh UPDATE song song, không atomic, không giới hạn N.
- `supabase_schema.sql:2`: có `DROP TABLE IF EXISTS streaks`, chạy lại là mất data. Timestamp dùng `WITHOUT TIME ZONE`.
- Không có trigger `updated_at` cho `tasks`/`profiles`, trong khi leaderboard theo kỳ dựa vào `updated_at`.

---

## 3. Bug tính năng lõi

| File | Bug | Fix |
|---|---|---|
| `hooks/use-tasks.ts:254-349` **[V]** | `getQueryData(['tasks'])` không khớp key thật `['tasks', page, limit, filters]`. UI không cập nhật tức thì, rollback về `undefined`. | `setQueriesData` / `getQueriesData` |
| `hooks/use-tasks.ts:302-326` **[V]** | Toast "moved to trash" và "permanently deleted" nằm trong `onSettled`, nên hiện cả khi lỗi. | Chuyển sang `onSuccess` |
| `stores/timer-store.ts:295` **[V]** | `partialize` thiếu `lastSessionTimeLeft`. Reload giữa phiên 50 phút thì phiên bị ghi 25 phút. | Lưu `startedAt` và elapsed |
| `use-timer-engine.ts:124` + `task-management.tsx:123,162,227` | Unfocus hoặc đổi task sẽ POST một session lẻ và reset baseline. Duration sai, `actual_pomodoros` bị cộng nhiều lần. | Tách elapsed khỏi baseline |
| `timer-store.ts:325` | Hết giờ lúc tab đóng: không ghi session, không chuyển mode, Start không làm gì. Chỉ Reset hoặc Skip gỡ được. | Khi rehydrate thì ghi session và chuyển mode |
| timer (toàn bộ) | Không đồng bộ giữa các tab (không BroadcastChannel). Mở 2 tab thì chuông kêu 2 lần, POST trùng session và streak. | BroadcastChannel / leader tab |
| `use-timer-engine.ts:141-166` | `fetch` kiểu fire-and-forget, không check `res.ok`, không retry hay queue offline. Guest bị 401 rồi mất data mà không có thông báo. | Check `res.ok`, queue, idempotency key, nhắc login |
| `timer-controls.tsx:93` **[V]** | Phát `/sounds/alarm.mp3` nhưng file không tồn tại (404) và bỏ qua `alarmType`. | Dùng chung helper alarm |
| timer | Không gọi Notification API khi tab ẩn. Lỗi play audio bị nuốt bởi `.catch(()=>{})`. | Notification sau khi user cấp quyền |
| `timer-store.ts` | Plan mode (`usePlan`, `plan`, `goToNextStep`) không có UI nào dùng (dead). | Xoá hoặc làm UI |

---

## 4. Tính năng thiếu hoặc làm dở

- **Chat, History, Leaderboard, Progress bị ẩn bằng cách comment JSX** (commit `2652d0c`). Route và API vẫn chạy và truy cập được qua URL. Timer vẫn POST stats nhưng user không có chỗ xem. Cần feature flag, hoặc quyết định giữ hay bỏ.
- **Focus mode là mock.**
  - `components/focus/focus-mode.tsx` không được import ở đâu **[V]**. Nó chỉ thêm 1 class vào `body` (comment ghi "for demo").
  - Trang `/focus` chỉ render `StreakTracker`.
  - Chặn website cần browser extension.
- **PWA hỏng [V]**:
  - `manifest.json` trỏ tới `/icons/*` nhưng `public/icons/` không tồn tại.
  - `public/sw.js` kiểu CRA (cache `/static/js/bundle.js`) và không bao giờ được register. Nếu register thì sẽ fail.
- **Không có `error.tsx`, `global-error.tsx` hay `loading.tsx` nào.** Khi crash, user thấy màn hình lỗi mặc định của Next.
- **Không có quản lý tài khoản**: xoá account, export data, đổi mật khẩu khi đang login. Có privacy page nhưng không thực thi được quyền của user.
- Không có onboarding. Ranh giới guest và account không rõ. Chỉ có Google OAuth.
- Settings, timer và audio chỉ lưu localStorage, không đồng bộ giữa các thiết bị. Các persist store không có `version`/`migrate` (trừ audio).
- Không export CSV, không weekly report. Streak có bảng nhưng UI chỉ nằm ở `/focus`.

---

## 5. Chất lượng code & tooling

- 20 lỗi TS ở code chạy. Đáng chú ý:
  - `layout/navigation.tsx` import module không tồn tại (file dead **[V]**).
  - `task-list.tsx`/`subtask-list.tsx` truyền sai props.
  - `app-providers.tsx:61` dùng `isChannel` không có trong type.
  - `model-selector.tsx:111`.
  - `theme-provider.tsx` lệch type với next-themes.
  - `tsconfig` `target: es5` gây lỗi lặp `Set`.
- Test:
  - Thiếu `@types/jest`.
  - `jest.setup.js` mock `next/router` (Pages Router) thay vì `next/navigation`.
  - Không có `testPathIgnorePatterns` (quét cả `.kilo`), không `collectCoverageFrom`, không threshold.
  - Không có e2e.
- Chưa có test cho: `timer-store`, `use-timer-engine`, `session-complete`, `tasks/*` API, `audio-store`, `audio-manager`.
- ESLint chỉ có `next/core-web-vitals`. Có `.prettierrc` nhưng không cài prettier, và config (tab, width 4) trái với code (2 space).
- Dependency 0 import **[V]**: `crypto-js` (+ types), `idb`, `react-use`, `use-debounce`, `svg-dotted-map`, `react-hot-toast`, `@radix-ui/react-toast`.
- Dependency trùng chức năng: `framer-motion@10` (14 file) và `motion@12` (22 file); `@tabler/icons-react` chỉ dùng ở 1 file.
- Phiên bản cũ: next 14, react 18, date-fns 2, lucide 0.294, eslint 8 (EOL). Không có dependabot/renovate.
- File trên 500 dòng: `background-settings` 766, `audio-store` 732, `audio-manager` 600, 5 mini-game mỗi cái 500–600 (nhiều khả năng lặp game loop).
- Dead code: `navigation.tsx`, `focus-mode.tsx`, `public/sw.js`, `lib/chat-tools/*`, `get_leaderboard`, plan mode, `API_ROUTE_TOKEN`.

---

## 6. Repo & docs

- File rác đang bị track: `build.log`, 4 script `.py` ở root, `fix_sessions_rls.sql` và `supabase_schema.sql` ở root, `backgrounds-source/` (39 file), `.agent`, `.claude`, `.cursor`, `.gemini`, `.jules`.
- **README sai stack**:
  - Ghi Prisma, NextAuth, WebSockets, PWA, Spotify — không cái nào có trong code.
  - Hướng dẫn dùng `npm` thay vì `pnpm`.
  - Link LICENSE gãy.
- **`.env.example` sai hoàn toàn**:
  - Có `DATABASE_URL`, `NEXTAUTH_*`, `GOOGLE_*`, `OPENWEATHER`, `SPOTIFY_*`, không biến nào được dùng.
  - Thiếu `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Thiếu: LICENSE, hướng dẫn setup Supabase và migration, bảng env, tài liệu schema/RLS. `docs/ai/*` chỉ có 1 feature (chatbot).

---

## 7. UX / a11y / i18n / SEO / perf

- **SEO**:
  - Root có `canonical: https://www.pomodoro-focus.site` **[V]**. Chỉ 4 file có metadata, nên `/guide`, `/privacy`, `/terms`, `/leaderboard` đều canonical về homepage. Google có thể bỏ index các trang này.
  - `hreflang` en/vi/ja trỏ cùng 1 URL.
  - `sitemap.ts` có `lastModified` cứng là `2026-02-08`.
  - `robots` chặn `/timer` trong khi timer có metadata SEO.
  - Landing override OpenGraph nhưng mất `images`.
- **i18n**:
  - `<html lang="en">` hardcode.
  - `server-translations.ts` chỉ có tiếng Anh, nên landing SSR luôn ra tiếng Anh rồi mới nhảy sang vi/ja.
  - Không detect `Accept-Language`.
  - `ja` thiếu 10 key `entertainment.controls.*` và có 1 key xung đột cấu trúc.
  - Còn chuỗi hardcode trong `model-selector` và `not-found`.
- **Font [V]**: `Be_Vietnam_Pro` chỉ có subset `latin`, nên dấu tiếng Việt rơi về font khác. Font 3 họ, mỗi họ 5–6 weight là nặng.
- **a11y**:
  - Gần như không tôn trọng `prefers-reduced-motion` (flip 3D, particles, sparkles).
  - `aria-live` chỉ có ở digital clock.
  - Không có skip link.
- **Perf landing**: `@tsparticles` (sparkles) và hai thư viện motion không được `dynamic()` import.

---

## 8. So với đối thủ

Chi tiết: [researcher-261001-0846-competitor-analysis.md](researcher-261001-0846-competitor-analysis.md).

Lưu ý khi đọc file đó:
- Mục "PWA mostly done" là **sai**: PWA đang hỏng (xem §4).
- Keyboard shortcuts đã có sẵn (`use-timer-hotkeys`).
- Bảng streaks đã có.

Đáng làm sau khi nền móng ổn:
1. Notification nền và PWA thật.
2. Streak và mục tiêu ngày hiển thị trên trang timer.
3. Export CSV và weekly email.
4. Đồng bộ Google Calendar/Todoist.
5. Gamification (XP, badge).
6. Phòng học chung (body-doubling).

---

## Thứ tự đề xuất

| Ưu tiên | Việc | Phase |
|---|---|---|
| P0 (ngay) | Kiểm RLS trên DB live, dump baseline schema, sửa RPC 002, khoá leaderboard | 02 |
| P0 | Open redirect, rate limit và cap cho chat, validate session-complete, xoá `NEXT_PUBLIC_MEGALLM_API_KEY`, security headers, `remotePatterns` | 01 |
| P1 | Bug timer/tasks gây sai dữ liệu | 03 |
| P1 | Quality gate: sửa 20 lỗi TS, jest config, CI, bỏ `ignoreBuildErrors` | 04 |
| P2 | Dọn repo, dependency, README, `.env.example` | 05 |
| P2 | `error.tsx`, canonical/metadata, i18n SSR, font, PWA, quản lý account | 06 |
| P3 | Roadmap tính năng (sau khi có quyết định sản phẩm) | 07 |

---

## Câu hỏi chưa giải quyết

1. DB live có bật RLS cho `tasks`/`sessions` không, policy ra sao? Repo không kiểm được, đây là ưu tiên số 1.
2. `NEXT_PUBLIC_MEGALLM_API_KEY` có được set trên Vercel không? Nếu có, cần rotate key.
3. Chat/History/Leaderboard/Progress ẩn tạm thời hay bỏ hẳn?
4. Leaderboard public cho anon (lộ `user_id`, tên, avatar) có phải chủ đích?
5. Migration 003/004 ở đâu? `tasks`/`sessions` có phải từng do Prisma tạo?
6. Giữ PWA và focus mode (cần extension) hay gỡ khỏi README?
7. Các thư mục AI tool (`.agent`, `.jules`, `.claude`...) có cần track trong git không?
