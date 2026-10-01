# Scout: tái dùng hệ thống từ luyenphongvan (cv-app) cho Study Bro v2

Ngày 01/10/2026 · nguồn `/Users/nguyendangdinh/DINH_CV/cv-app` (gọi tắt **CV**) · đích `/Users/nguyendangdinh/Personal/Pomodoro` (gọi tắt **SB**). Chỉ đọc code, không sửa gì. Đường dẫn trong báo cáo tính từ gốc CV.

## 0. Khác biệt stack (quyết định mức port)

| | CV | SB hiện tại | Hệ quả |
|---|---|---|---|
| Framework | Next 16 · React 19 | Next 14.2 · React 18 | `after()` (next/server), `params: Promise` chỉ có từ Next 15 trở lên. Thiếu `after()` thì không port nguyên được route chat/stream |
| Auth + DB | NextAuth v5 JWT + Neon (`@neondatabase/serverless`, SQL thô) | Supabase Auth + Supabase PG (RLS) | Query helper CV phải viết lại thành RPC/SQL function của Supabase hoặc chuyển hẳn sang Neon |
| AI SDK | `ai` 6 + `@ai-sdk/openai-compatible` 2.0.x | `ai` 5 · `MEGALLM_API_KEY` | openai-compatible 2.x yêu cầu ai v6, bản 3.x thì sai spec. Phải nâng ai lên 6 hoặc hạ provider |
| assistant-ui | 0.15.16 | 0.11.x | API primitive đã đổi, có 4 bẫy đã ghi (§2) |
| State | zustand 5 | zustand 4 | Store nhỏ, sửa import là xong |
| Radix | `radix-ui` gói gộp | `@radix-ui/react-*` | Đổi import khi port Modal/Checkbox/Popover |
| Icons/Motion/Toast | Phosphor `/dist/ssr`, motion 12, sonner | đã có cả ba (còn thêm react-hot-toast) | Port thẳng. Nên bỏ react-hot-toast |

## 1. Mascot "Cú"

| Mục | Chi tiết |
|---|---|
| Component | `src/shared/components/page-mascot.tsx` (404 dòng), port MIT từ nilbuild/page-mascot của Kamran Ahmed. Phải giữ header license |
| Asset | `public/mascots/owl-{directions,reactions}{,-sm}.webp`. Mỗi file là sprite lưới 3×3 với `background-size: 300%`. Bản `-sm` (~25–30KB) dùng khi size ≤64px, bản lớn ~90KB (750px). Các ô được cắt cùng một khung để hai sheet chồng khớp nhau |
| Hướng nhìn (9) | up-left, up, up-right, left, center, right, down-left, down, down-right |
| Biểu cảm (9) | blink, heart, sparkle, surprised, starstruck (mắt sao, upstream gọi là `wink`), bashful, sleepy, dizzy, delighted |
| API | `<PageMascot size mood look interactive/>` có tracking con trỏ. `<OwlAvatar size mood look/>` là ảnh tĩnh, không listener, dùng cho avatar từng tin nhắn. `scoreMood(score, record)`: ≥100 → sparkle, ≥80 → delighted, <50 → bashful, còn lại null (tiếp tục tracking) |
| Animation | Tracking chạy qua rAF, dead zone 70px, hysteresis 0.12 rad. Màn cảm ứng: cú liếc theo điểm chạm 1.6s rồi quay về. Chớp mắt ngẫu nhiên 3.2–6.8s, chỉ khi đang nhìn thẳng. Boop: blink → heart/sparkle/delighted. Boop 4 lần trong 1.6s → dizzy. Squash dùng WAAPI. Chỉ fade-in sau khi `img.decode()` cả hai sheet. Có `prefers-reduced-motion` thì đứng yên. Luôn `aria-hidden`, tabIndex -1 |
| Nơi xuất hiện | FAB trợ lý 56px không nền; avatar header panel; avatar mỗi câu trả lời (running → `up-right`, lỗi → dizzy, hết quota (429) → sleepy, 413/409 → surprised); welcome; `EmptyState` mặc định; 404; kết quả quiz; cuối phiên flashcard; banner /account; onboarding; CV loading (`cv-reading-owl.tsx` lặp `look` theo timer); ảnh OG (6 PNG trong `src/shared/lib/og/assets/owl-*.png`) |
| Cố ý KHÔNG gắn | /q, /c, home, header, loading, pricing/checkout, DSA. Lý do: user đi làm thấy hiệu ứng ồn sẽ cho là trẻ con |
| Gắn với AI | Cú chính là trợ lý AI. `IDENTITY` trong `src/features/assistant/lib/assistant-prompt.ts`: tự nhận là AI, không đóng vai cú thật, chơi chữ "cú" tối đa 1 lần/cuộc, emoji ≤1/câu, giọng vui. Test khoá chuỗi "Bạn là Cú". FAB báo trạng thái: đang nghĩ thì `look="up"` + huy hiệu xoay; xong thì delighted; lỗi thì dizzy. **Night greeting** 23:00–04:59: `src/features/assistant/hooks/use-night-greeting.ts`, mood lấy theo từng câu chào |
| Port SB | **Port nguyên** component + 4 webp. Rất hợp Study Bro: focus → `look="down"`, break → delighted, cột mốc streak → sparkle, học đêm → sleepy + night greeting. Muốn nhân vật riêng thì chỉ cần thay 2 webp, giữ đúng lưới 3×3 và khung cắt. Hiện không có key nào vẽ ảnh được (VietAPI tắt image, Gemini free quota 0) |

## 2. AI qua VietAPI

| Mục | File / chi tiết |
|---|---|
| Client | `src/shared/lib/ai/vietapi.ts`: `createOpenAICompatible({ baseURL: 'https://api.vietapi.tech/v1', apiKey: VIETAPI_KEY })`. **Bắt buộc dùng openai-compatible**: provider OpenRouter đổi baseURL vẫn ra text nhưng tool call mất im lặng |
| Env (chỉ tên) | `VIETAPI_KEY`, `ASSISTANT_MODEL`, `ASSISTANT_MODEL_FREE`, `MOCK_MODEL`, `MOCK_SCORING_MODEL`, `SONIOX_API_KEY` (voice), `OPENROUTER_API_KEY` (legacy) |
| Chọn model | `src/shared/lib/ai/model-settings.ts` có `getModelChain(slot, defaults)`: đọc bảng `ai_model_settings(slot, models text[])`, cache 60s, dedupe inflight, DB lỗi thì dùng cache cũ hoặc mặc định, không bao giờ ném lỗi. Danh mục slot ở `ai-model-slots.ts` (assistant_free/pro, cv_free/pro, mock_conversation/scoring, verify_contribution), mỗi slot kèm `checks` (vietnamese/tools/json). Admin `/ai-models` ghi bảng này. Chuỗi hiện hành: `deepseek-v4-flash → deepseek-v4-pro → qwen-3.8-max` |
| Fallback | `src/shared/lib/ai/fallback-model.ts` có `withFallback(models)`: bọc `doStream/doGenerate`, chờ byte đầu tối đa 15s rồi chuyển sang model sau. Chỉ cứu được lỗi lúc mở luồng; luồng đứt giữa chừng thì rơi vào `onError` + hoàn quota |
| Streaming | `app/api/assistant/chat/route.ts`: `streamText` + tool `navigate`/`findCompany` (validate path theo `SITE_ROUTES`, khử trùng path) + `stopWhen: [stepCountIs(2), custom]` + `experimental_transform` lọc chữ lạ (`strip-foreign-script.ts`, whitelist `\p{Script=Latin}`) + `temperature 0.3`, `maxOutputTokens 1100/1500`, `maxDuration 120`. **`after(result.consumeStream())` + `consumeSseStream: after(consumeStream(...))` phải đi thành cặp**, `onFinish/onError` phải `async` + `await`. Thiếu một vế thì đóng panel là mất câu trả lời. `generateMessageId: randomUUID` là bắt buộc. Thread id sinh ở server, trả qua header `x-assistant-thread` |
| Input guard | Bắt đăng nhập (chặn farm LLM free). Lọc message role `system` từ client. Cửa sổ 8 tin nhắn, `MAX_INPUT_CHARS 8000`, `MAX_CONVERSATION_CHARS 60000`, `MAX_MESSAGES 60`. Mã lỗi tách riêng: 401/409/413/429/502/503. Chế độ "giải thích câu": client chỉ gửi `qaId`, server tự nạp nội dung |
| Quota / plan | `src/shared/lib/db/assistant-queries.ts` + bảng `ai_usage(user_id, day, feature, turns, tokens)` với PK (user, day, feature), ngày tính theo giờ VN. `consumeAssistantTurn` đếm **trước** khi gọi model bằng một upsert atomic `on conflict … where turns < limit` (2 tab cùng lúc không lọt). Free 20/ngày, Pro 500. `refundAssistantTurn` ở cả 3 đường lỗi. `recordAssistantTokens` ghi tổng token trong onFinish. Thêm `checkRateLimit` 6 lượt/phút (in-memory, `src/shared/lib/rate-limit.ts`). CV dùng quota riêng: đếm dòng `cv_reviews` theo tháng UTC, Free 2 / Pro 10 (`src/features/cv/lib/cv-quota.ts`) |
| JSON mode | `src/features/cv/lib/cv-model-request.ts`: gọi `fetch` thô với `response_format: json_object`, đọc thêm `reasoning_content`, cộng `REASONING_TOKEN_ALLOWANCE 12k` vì phần nghĩ của deepseek ăn vào max_tokens. Đi qua AI SDK thì deepseek trả rỗng |
| Giá / đo | `vietapi-pricing.ts` (cr/1M, 1 cr = 1.000đ), `docs/vietapi-models.md`, harness `pnpm assistant:check-models --models=… --runs=2` |
| Bẫy đã biết | (1) **VietAPI chèn system prompt ẩn 1.7–4.4k token** vào mỗi lượt, số usage đã gồm phần này. (2) **Cấm `--all`**: lệnh này gọi cả Opus/Fable đắt và đã làm cạn ví prod ngày 28/9, mà ví dùng chung với prod. (3) Health check HTTP 200 không chứng minh model chạy được việc thật (kimi-k3 đo 1s nhưng hỏng 3/3). (4) 401 phụ thuộc từng key, không phải model chết. (5) Mỗi model đếm token tiếng Việt khác nhau (luna gấp 2.7×), phải đo token thật rồi mới so giá. (6) Model nào cũng thỉnh thoảng nhả chữ Hán/Thái, nên giữ bộ lọc trên stream. (7) Độ trễ dao động mạnh trong ngày (10–47s). (8) Đừng tự quy token ra tiền ở admin. (9) `convertToModelMessages` ở v6 trả Promise |
| Port SB | **Port nguyên**: `vietapi.ts`, `fallback-model.ts`, `strip-foreign-script.ts` (+ test), mẫu `ai_usage` + consume/refund, `rate-limit.ts`. **Adapt**: route chat (cần Next 15+ cho `after()`, nếu không thì dùng `waitUntil` của `@vercel/functions`), assistant-ui 0.11 → 0.15. Nên dùng key VietAPI riêng cho SB |

## 3. Thanh toán SePay

| Bước | File / cơ chế |
|---|---|
| Giá | `src/shared/lib/plan-prices.ts`: `PLAN_PRICES {monthly: 49_000, lifetime: 299_000}` là nguồn sự thật duy nhất cho UI, backend và JSON-LD. `calcDiscountedAmount` làm tròn về 1.000đ. UI ở `src/features/pricing/lib/plans.ts` (giá gạch 99k/499k, feature list song ngữ) + `pricing-page.tsx` + `pricing-plan-card.tsx` |
| Tạo đơn | `app/api/checkout/create/route.ts`: bắt auth, rate limit 10/phút. Chặn mua trùng (đã lifetime → chặn mọi gói; đang monthly → chặn monthly, vẫn cho lên lifetime) → 409. Upsert lại profile để tránh lỗi FK. `generateOrderCode()` sinh `LPVT-XXXXXX` bằng crypto, alphabet bỏ I/O/0/1. `createPendingPurchase`: amount lấy ở server |
| QR | `src/features/checkout/lib/sepay.ts`: `buildVietQrUrl` gọi `qr.sepay.vn/img?bank&acc&amount&des&template=compact`. VietinBank cần memo có tiền tố `SEVQR `. Thông tin ngân hàng trả trong response, không đặt ở `NEXT_PUBLIC_*` |
| Polling | `GET /api/checkout/[orderCode]/status` chỉ cho chủ đơn đọc. Client poll vài giây/lần, tối đa 10 phút |
| Webhook | `app/api/sepay/webhook/route.ts`: rate limit 60/phút/IP. Auth bằng header `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`, so sánh timing-safe (`secretMatches`). Prod thiếu key → 500. Bỏ qua `transferType != 'in'`. Regex `LPVT-?([A-Z2-9]{6})` chấp nhận memo bị ngân hàng (MBBank) bỏ gạch nối. Memo "UNG HO" → chỉ báo Telegram. Ca vô hại luôn trả **200** để SePay ngừng retry (SePay retry tối đa 7 lần trong ~30 phút) |
| Idempotent | `recordSepayPayment` (`src/shared/lib/db/queries.ts`): **một UPDATE duy nhất** `where order_code=… and status='pending' and amount_vnd <= transfer and sepay_reference is null`. `sepay_reference` có UNIQUE để chặn replay. Kết quả phân loại `paid / duplicate / amount_mismatch / not_found`. Gia hạn monthly cộng dồn: `greatest(max(expires_at), now()) + 30 days`. Lifetime giữ `expires_at` null |
| Sau khi paid | Telegram + mail Resend (`sendProPurchasedMail`) + `deliverToUser(type 'payment-success', 'transactional')`. Mỗi việc có try/catch riêng để không ảnh hưởng mã 200 |
| Bảng | `purchases(id, user_id FK, plan check, amount_vnd, order_code unique, sepay_reference unique, status pending/paid/refunded, expires_at, paid_at, discount_code, discount_percent, original_amount_vnd, admin_action/actor/reason)` + `discount_codes` (reserve/release slot) |
| Entitlement | **VIEW** `active_entitlements` tính `has_lifetime`, `monthly_expires_at`, `is_premium` từ purchases đã paid. `getEntitlement(userId)` ở server. Client dùng `useEntitlement()` (`src/shared/hooks/use-entitlement.ts`): cache module theo userId với TTL 5 phút, dedupe inflight, pub/sub cho các consumer, lấy dữ liệu qua batch `/api/me/init`, có `invalidateEntitlement()`. Xem trước trạng thái bằng `?preview=basic|monthly|lifetime|signed-out` trên /account |
| Fallback tay | (a) `POST /api/checkout/[orderCode]/admin-mark-paid`: 3 lớp chặn (đăng nhập + `isAdminEmail` + phải là chủ đơn), dùng lại `recordSepayPayment`. (b) Khi webhook không bắn: `UPDATE purchases set status='paid', paid_at, sepay_reference='<SePay tx id>' … where status='pending'` (monthly cộng thêm 30 ngày), sau đó gửi tay `sendProActivatedApologyMail`. (c) Cron push-billing gửi nhắc đơn pending và báo sắp hết hạn |
| Env | `SEPAY_BANK_NAME`, `SEPAY_BANK_ACCOUNT`, `SEPAY_ACCOUNT_HOLDER` (bắt buộc IN HOA không dấu, `assertProductionEnv` sẽ chặn nếu sai), `SEPAY_WEBHOOK_API_KEY`, `RESEND_API_KEY`, `MAIL_FROM`, `TELEGRAM_*` |
| Bẫy | Paywall phía client chỉ là trang trí: QA_DATA của CV nằm trong chunk JS công khai. Mẫu đúng là `auth()` + `getEntitlement()` + fetch theo id ở server (`app/api/quiz/questions/route.ts`) |
| Port SB | **Port nguyên**: `sepay.ts`, `plan-prices.ts`, logic webhook, SQL `recordSepayPayment`, VIEW entitlement, hook `useEntitlement`. **Adapt**: đổi tiền tố đơn (ví dụ `SBRO-`). Nếu dùng chung tài khoản ngân hàng thì webhook CV gặp memo lạ vẫn trả 200 "no order code", không hỏng gì, nhưng cần xác nhận SePay cho đăng ký nhiều webhook trên một tài khoản. Query viết lại theo hướng Supabase hoặc Neon |

## 4. Gamification

| Mục | Chi tiết |
|---|---|
| Huy chương | `src/features/medals/` gồm 4 nhóm × 10 họ × 4 bậc (Đồng/Bạc/Vàng/Kim cương). Thói quen: streak `[3,7,30,100]`, days `[7,30,100,365]`, daily `[3,10,30,100]`. Kiến thức: qa `[10,50,150,500]`, card `[10,50,150,400]`. Thực chiến: quiz `[25,100,250,500]`, breadth `[2,4,7,10]`, dsa `[3,10,25,50]`. Cộng đồng: posts `[1,3,10,25]`, helpful `[1,10,50,200]`. Nguồn sự thật là `lib/medal-catalog.ts`. Ngưỡng hiệu chỉnh theo phân bố thật trên prod: Đồng ≈ trung vị, Vàng ≈ top 3% |
| Tính lúc nào | **Tính lúc đọc**, không có bảng, không query thêm: `medal-values-from-profile.ts` lấy số từ `PublicProfile` rồi chạy `computeMedalProgress` (tier, next, ratio). Đổi ngưỡng thì mọi người tự đổi bậc theo. Ăn mừng lên bậc bằng `use-medal-unlocks.ts`: so với `localStorage['iv_medals_seen:<uid>']`, lần đầu ghi im lặng, tối đa 3 popup mỗi lần, chỉ ghi tăng (vì ISR có thể trả bản cũ). Hiệu ứng: `medal-fireworks.tsx` là canvas tự viết, `medal-art.tsx` là SVG có gradient kim loại. Bảng hiển thị là một card, tile không viền. Trang soát UI `/dev/medals`. **Chưa commit** (01/10) |
| XP | `src/shared/lib/leaderboard-xp-rules.ts` (module thuần): qa 1, card 1, dsa 4, quiz 2 (câu độc nhất trả lời đúng), day 5, daily 5, post 20, comment 2 (trần `COMMENT_CAP 50`), helpful 2. SQL ở `src/shared/lib/db/leaderboard-xp-queries.ts`: mỗi nguồn là một CTE đếm **đơn vị**, sau đó mới nhân trọng số. Khung thời gian `month` (từ ngày 1 theo giờ VN) và `all`. **Tính lúc đọc**, không có bảng XP |
| Leaderboard | Bảng chung được cache trong bộ nhớ 10 phút (`src/shared/lib/cache/leaderboard-cache.ts`, tách 2 store: shared 200 / per-user 2000). TOP_N 20. Dòng của người xem tính trực tiếp rồi đặt vào bảng bằng `rankAgainst` + `placeViewerInTop` (`src/shared/lib/leaderboard-standings.ts`). Chỉ kéo tên/avatar cho top 20 (avatar có thể là data URL) |
| Streak | Bảng `user_daily_activity(user_id, day, count)`. `recordDailyActivity`: **ngày do server đóng dấu** (giờ VN). Map client gửi lên chỉ được tăng count hôm nay và gộp hôm qua (ca khách vừa đăng nhập), giới hạn 5 key, count ≤10k. Vào web là giữ chuỗi (`streak-visit-tracker.tsx` ghi lại khi focus/visibility). Leaderboard streak dùng gaps-and-islands: `current` là chuỗi kết thúc hôm nay/hôm qua, `longest` là `distinct on`. `getLongestStreak` tính trên toàn bộ lịch sử. Khách: lưu localStorage, gộp vào tài khoản lúc đăng nhập |
| Quiz | `quiz-rating-rules.ts`: xếp theo số câu giải được, rồi điểm độ khó, rồi số câu đã trả lời; không xét thời gian; `MIN_ANSWERED 10` |
| Chống gian lận | Đếm theo đơn vị độc nhất (thẻ, câu). Comment có trần. Loại self-vote (`v.user_id <> p.author_id`). Bộ đề quiz ký HMAC (`src/shared/lib/quiz-set-token.ts`), server tự chấm lại, `total/setKey` lấy từ token chứ không tin client. Không tin ngày từ client. Rate limit streak 30/phút. Huy chương "posts" không đếm bài ẩn danh (tránh lộ tác giả) |
| Quyết định đã chốt (CV) | Giữ trọng số day=5. Không gộp 2 bảng xếp hạng. Không cho opt-out khỏi bảng. Đừng tự đổi luật tính điểm khi chưa hỏi |
| Port SB | **Port nguyên**: catalog/progress/unlocks/fireworks/art (thay danh sách họ: phút focus, số pomodoro, streak, task xong…), `leaderboard-standings.ts`, `leaderboard-cache.ts`, `streak-math.ts`, mẫu SQL gaps-and-islands. **Adapt**: phiên focus nên do server đóng dấu start/end, có trần phút/ngày, dùng token HMAC kiểu quiz-set-token để chặn POST giả "25 phút". Hiện bảng `leaderboard` của SB đang tin số client gửi lên |

## 5. Auth

| Mục | Chi tiết (`auth.ts` ở gốc repo) |
|---|---|
| Provider | Google OAuth; GitHub (chỉ bật khi có `GITHUB_CLIENT_ID/SECRET`, 2 OAuth app riêng cho dev và prod, Preview không có key thì nút tự ẩn); `google-onetap` (Credentials, verify ID token bằng `google-auth-library`, từ chối email chưa verify); `dev` login (chỉ khi không có OAuth **và** không phải production) |
| Session | `strategy: 'jwt'`, không dùng adapter/bảng sessions. `jwt` callback chỉ chạy logic khi có `account` (lúc đăng nhập): user_id = Google sub / `github_<id>` / `dev_<hex>` (**không dùng `user.id`** vì đó là UUID ngẫu nhiên mỗi lần). Nối tài khoản giữa provider chỉ qua email **đã verify** (GitHub phải gọi `/user/emails` để kiểm). `session` callback gắn `user.id` + `touchLastSeen` |
| Profile | `profiles(user_id text PK, email, full_name, avatar_url, created_at, updated_at, last_seen_at, notifications_seen_at, roles, interests, profile_public, admin_notes…)`, unique `lower(email)`. `upsertProfile` dùng `coalesce` để giữ tên/ảnh user đã sửa, mẹo `xmax=0` để biết lần đầu → gửi welcome mail kiểu fire-and-forget. `touchLastSeen` là CTE chặn 1 ghi/5 phút, kiêm ghi `user_daily_visits` (DAU) |
| Khách | `pages.signIn: '/'`, đăng nhập qua modal: `LoginPromptProvider` + `useLoginPrompt().promptLogin({vi,en})`. `useEntitlement` không fetch khi chưa đăng nhập. API trả 401. Trợ lý AI bắt buộc đăng nhập. Streak khách lưu local rồi gộp khi đăng nhập. Leaderboard vẫn ghim dòng của người xem kể cả khi `rank: null`. Admin xác định bằng allowlist email hardcode (`src/shared/lib/admin.ts`) |
| Port SB | **Adapt / quyết định**: SB đang dùng Supabase Auth. Nếu giữ Supabase thì chỉ mượn các mẫu (link theo email verified, login modal, merge khách). Nếu chuyển sang NextAuth thì port gần nguyên `auth.ts` |

## 6. DB

| Mục | Chi tiết |
|---|---|
| Client | `src/shared/lib/db/client.ts`: `neon()` HTTP tagged template, **lazy singleton** (thiếu `DATABASE_URL` thì chỉ request cần DB bị lỗi, không sập cả app), `sqlTransaction([...])` cho transaction không tương tác. Không dùng ORM. Admin introspect qua Drizzle (`pnpm db:pull`) |
| Schema | `src/shared/lib/db/schema.sql` (1.156 dòng), idempotent: `create … if not exists`, `alter … add column if not exists`, `do $$` để rename, `create or replace view`. Apply bằng `psql "$DATABASE_URL_UNPOOLED" -f` hoặc `scripts/run-migration.mjs` (DDL phải chạy qua kết nối UNPOOLED). File seed/migration có ngày nằm ở `db/migrations/` |
| Query | Tách theo miền: `queries.ts`, `assistant-queries.ts`, `leaderboard*-queries.ts`, `notification-queries.ts`, `push-queries.ts`… Mẫu atomic một câu lệnh: `on conflict … where`, `update … where status returning`, CTE claim + insert. Ngày lưu theo giờ VN (`(now() at time zone 'Asia/Ho_Chi_Minh')::date`) |
| Bẫy | schema.sql **có thể lệch prod** (đã có ALTER và bảng chưa từng được apply), nên kiểm bằng `to_regclass` / cột trước khi wire. Cùng một Neon dùng chung cho cả CV và admin |
| Port SB | Nếu ở lại Supabase: chuyển SQL thành migration Supabase CLI + RPC (`security definer`, đã có bài học EXECUTE cấp cho anon). Nếu chuyển Neon: port `client.ts` + quy ước schema.sql nguyên trạng |

## 7. SEO

| Mục | Chi tiết |
|---|---|
| OG | `src/shared/lib/og/og-card.tsx`: `renderOgCard({title, subtitle, stat, owl, artefact})` ra ảnh 1200×630, nền brand blue đặc, wordmark, cú đậu trên "tờ giấy" chứa mảnh UI thật. Màu viết literal (Satori không đọc CSS var). Font TTF + PNG cú nằm ở `og/assets`, cache theo instance. Artefact ở `og-artefacts.tsx` (OgRows/OgQuiz/OgArray/OgFlashcard/OgScore). Mỗi segment có `opengraph-image.tsx` riêng, khoảng 20–30 dòng (ví dụ `app/pricing/opengraph-image.tsx`) |
| Bẫy OG | `openGraph` của trang con **thay thế** object của trang cha (không kế thừa ảnh), nên mỗi trang phải có file ảnh riêng. Không in domain lên ảnh. Satori không render được component Phosphor, phải inline path. Root không ghim `twitter.images`. Cần `outputFileTracingIncludes` cho asset |
| Metadata | Root (`app/layout.tsx`): `metadataBase`, title template `'%s | Luyện Phỏng Vấn'`, locale `vi_VN`, robots `max-image-preview: large`. Trang con khai `alternates.canonical`. Không hardcode số đếm vào meta |
| JSON-LD | Root có `WebSite` + `SearchAction` (target là `EntryPoint`) và `EducationalOrganization` (không có Person, ẩn danh tính người làm). Pricing có `SoftwareApplication` + `Offer` lấy giá từ `PLAN_PRICES`. Helper `src/features/dsa/components/json-ld.tsx`. FAQPage đã bỏ |
| robots / sitemap | `app/robots.ts`: chặn `/api/ /account /checkout /u/`. Mở cho answer engine (GPTBot, PerplexityBot, ClaudeBot…), chặn bot thu dữ liệu train AI và bot SEO (lý do chi phí Vercel). `app/sitemap.ts` chạy ISR `revalidate 3600`, sinh từ data thật, lọc trang mỏng. Có `app/llms.txt`, `llms-full.txt`, `manifest.ts` |
| Port SB | **Port nguyên**: og-card + artefacts (thay bằng artefact đồng hồ/heatmap), robots, khuôn JSON-LD. Next 14 có `next/og`, port được |

## 8. Design system và UI primitive

| Thành phần | File | Ghi chú port |
|---|---|---|
| Token | `app/globals.css`: ink×4, surface×4, accent (blue #2563EB), cặp bg/ink ngữ nghĩa ×6, `--radius 8 / --radius-lg 12`, `--app-bar-height 54`, `--fab-*`. Dark mode qua `[data-theme='dark']` (không dùng `.dark`) | Port token trước, mọi primitive dựa vào |
| Button | `ui/button.tsx` + `button.css`: variant primary/secondary/ghost/link/danger, size sm/md/lg, `loading`, `href` thì render `<Link>` | Port nguyên |
| Checkbox | `ui/checkbox.tsx` (port Animate UI, tick tự vẽ) + `ui/choice-row.tsx` | Đổi import radix |
| Modal | `shared/components/modal.tsx` (Radix Dialog + motion, size sm/md/lg/full, `title`/`description` bắt buộc cho a11y) | Đổi import radix |
| BlurFade | `blur-fade.tsx` (Magic UI, có guard reduced motion) | Port nguyên |
| TocSidebar | `toc-sidebar.tsx` (IntersectionObserver + thumb trượt, ẩn dưới 960px) | Ít dùng cho SB |
| Emoji picker | `emoji-picker.tsx` (frimousse + Radix Popover, chạy được bên trong Dialog) | Port nếu có chat |
| Khác | `empty-state.tsx` (cú mặc định), `pill-tabs`/`underline-tabs`/`filter-chip` (luật tab vs chip), `toggle-switch`, `tooltip`, `select` (shadcn, đã đổi sang Phosphor) + `select-native`, `skeleton`, `copy-button`, `number-ticker`, `themed-toaster` | — |
| App bar | `app-bar.tsx/.css`: attribute `data-route` để từng feature tự style header. Không cho wrap: bậc 1480/1360/1220/700, hamburger từ ≤1220. Nút nổi xếp theo biến `--fab-slot-1/2/3` (trợ lý / feedback / scroll-top) | Mượn mẫu |
| Luật thiết kế | Màu đặc, không gradient. Không viền-trái accent, không tô nền card. Không icon Sparkles. Active ở sidebar = nền + đậm chữ. Không trộn tab với chip. CSS ở root layout bị inline ×2 vào mọi trang, nên modal phải lazy-mount | Áp dụng chung |

## 9. Onboarding, guide, thông báo, toast

| Mục | Chi tiết |
|---|---|
| Onboarding | `src/features/account/components/profile-prefs-onboarding.tsx`: 2 bước (vai trò → tech), chỉ hỏi bước còn thiếu, có confetti cho tài khoản mới, snooze 7 ngày, `MAX_SKIPS 3` rồi chuyển sang bắt buộc, `?onboarding=1` để mở ép (demo/QA) |
| Một popup mỗi lúc | `src/shared/stores/use-interrupt-slot.ts` (zustand): `occupy` cho dialog chặn, `claim/release` cho nudge. Lý do: trước đây onboarding + xin quyền push + thẻ daily chồng nhau khiến user bấm "Block" |
| Guide modal | `src/features/dsa/components/dsa-onboarding-modal.tsx`: viết kiểu bài đọc giàu chữ, icon accent ở mỗi mục, số liệu lấy từ data. User **không thích** dạng "list widget" |
| Noti center | `src/features/notifications/` (bell + `/notifications`, store zustand chung). Badge đếm "**chưa xem**" (`profiles.notifications_seen_at`), không phải chưa đọc. Bảng `notifications(category learning/billing/content/transactional, type, title, body, url, action_label, read_at)`. Meta icon theo type ở `lib/notification-meta.ts`. Spec đầy đủ: `docs/notifications.md` |
| Gửi | `src/shared/lib/push/deliver-to-user.ts` là điểm vào duy nhất: luôn ghi in-app, push qua web-push VAPID (`push_subscriptions`), dedupe bằng `push_sends`. Cap group: broadcast 1/ngày, social 3/ngày, transactional không giới hạn. URL push gắn `?ntf=<id>` để tự mark-read. Fan-out theo tập (`claimAndInsertNotifications` + `fanOutPush`). Cron chạy bằng GitHub Actions gọi `/api/cron/push-*` kèm `x-cron-secret`. Noti release **chỉ gửi tay** |
| Xin quyền push | Đã gỡ auto-prompt (chỉ ~6% bật). Hiện dùng `push-opt-in-card.tsx` (inline) + `push-opt-in-toast.tsx` (sonner, hiện từ lần ghé thứ 2, sau khi có tương tác, snooze 7 → 30 ngày → thôi, xin interrupt slot) |
| Toast | `themed-toaster.tsx`: sonner góc dưới phải, 2.8s, tối đa 3, class `fc-toast--{success,error,…}`. Ngoài ra có `assistant-reply-toast.tsx`, `QuizDailyToastHost` |
| Port SB | Port nguyên interrupt slot, ThemedToaster, mẫu onboarding (bước: mục tiêu phút/ngày, môn học), deliverToUser (rất hợp nhắc giờ học/streak, nhưng phải giữ cap ngày) |

## Tổng hợp port

- **Copy gần nguyên** (thuần, không phụ thuộc framework): page-mascot + webp, strip-foreign-script, fallback-model, rate-limit, streak-math, leaderboard-standings/cache, medal catalog/progress/unlocks/art/fireworks, sepay.ts, plan-prices, og-card/artefacts, use-interrupt-slot, Button/BlurFade/EmptyState/ThemedToaster, robots.
- **Adapt**: route chat (`after()`, phiên bản ai/assistant-ui), mọi `*-queries.ts` (Neon → Supabase), auth.ts, useEntitlement (nguồn dữ liệu `/api/me/init`), modal/checkbox (gói radix).
- **Viết mới theo mẫu**: phiên focus do server đóng dấu + token HMAC, họ huy chương riêng của SB, ngưỡng hiệu chỉnh theo dữ liệu SB.

## Câu hỏi chưa giải quyết

1. SB v2 ở lại Supabase (Auth + RLS) hay chuyển sang Neon + NextAuth như CV? Câu trả lời quyết định khoảng một nửa công port.
2. Có nâng SB lên Next 15/16 + React 19 + ai v6 trước khi port không? (`after()`, openai-compatible 2.x, assistant-ui 0.15 đều cần.)
3. Key/ví VietAPI dùng riêng cho SB hay chung với CV? Ví chung từng bị cạn làm prod CV chết; nên tách riêng.
4. Dùng chung tài khoản SePay/ngân hàng? SePay có cho nhiều webhook trên một tài khoản không, hay CV cần forward memo `SBRO-` sang SB?
5. Có dùng lại nhân vật Cú cho Study Bro không (thương hiệu chéo), hay cần nhân vật mới? Hiện không có key nào vẽ ảnh được.
6. Mô hình giá SB có giữ monthly + lifetime như CV, và giá bao nhiêu?
7. Medal system, noti center v3 và admin /ai-models của CV **chưa commit/deploy**. Có chờ chốt rồi mới port không?
8. Luật streak "vào web = giữ chuỗi" có hợp Pomodoro không, hay phải xong ít nhất một phiên focus mới tính?
