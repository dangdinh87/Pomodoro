# Study Bro — cần chuẩn chỉnh những gì (báo cáo tổng hợp)

- Ngày: 2026-10-05 · Nhánh `feat/design-system` (v2, chưa deploy) + production thật (`master` tại `www.pomodoro-focus.site`)
- Gộp từ 4 báo cáo chi tiết (đọc khi cần bằng chứng file:line):
  - SEO + từ khoá: `seo-261005-0022-seo-audit-and-keyword-research.md`
  - Tính năng + UX: `audit-261005-0022-features-and-ux-gaps.md` (ảnh trong `assets-261005-feature-audit/`)
  - Sức khoẻ kỹ thuật: `review-261005-0022-tech-health.md`
  - Thị trường + đối thủ: `researcher-261005-0024-pomodoro-market-and-competitors.md`
- Lỗi P0 nào cũng đã được kiểm lại độc lập: DNS/RDAP domain, `ffmpeg volumedetect` 9 file âm, `session-recorder.ts:125`, `.env:14`.
- Ghi chú về báo cáo thị trường:
  - Báo cáo coi kỳ thi THPT 06/2026 là sắp tới, nhưng kỳ đó đã qua. Mùa cao điểm kế tiếp là THPT **06/2027**, ôn thi rơi vào khoảng tháng 3–5/2027.
  - Số người dùng của đối thủ và các con số % kiểu "+48% retention" là ước đoán hoặc lấy từ blog, chưa kiểm chứng.

---

## 0. Kết luận nhanh

1. **Rủi ro lớn nhất không nằm ở code.**
   - Domain mà code v2 trỏ tới (`pomodorostudy.online`) **chưa ai đăng ký**.
   - Domain đang chạy (`pomodoro-focus.site`) **hết hạn 11/11/2026**.
   - Mất domain cũ là mất toàn bộ index và backlink. Deploy v2 khi domain mới chưa tồn tại thì SEO chết, và **không ai đăng nhập được bằng email**: Resend không verify được domain gửi.
2. **Lõi app chạy được nhưng có lỗ làm hỏng niềm tin:**
   - 9 âm môi trường là file câm.
   - Phiên của khách không được ghi.
   - Thống kê tính ngày theo UTC.
   - App tự chạy phiên khi người dùng đi vắng.
   - Đoạn 70 giây cũng được tính là 1 pomodoro.
3. **SEO v2 tốt hơn prod về kỹ thuật** (SSR, canonical từng trang), **nhưng VI/JA không index được.** Ngôn ngữ lấy theo cookie trên cùng một URL, nên Googlebot chỉ thấy bản EN. Trong khi đó VI/JA lại là thị trường dễ thắng nhất: SERP yếu, đối thủ toàn listicle cũ và tool nhỏ.
4. **Kỹ thuật sạch:** type-check 0 lỗi, lint 0 error, 274 test pass, i18n khớp 1225 key. Nhưng **nhánh chưa từng chạy CI hay `next build`** (31 commit chưa push). Migration Neon chưa nằm trong bước deploy nào. Chưa có error tracking.
5. **Plan v2:**
   - Phase 00–03 xong.
   - 04 (phiên xác thực) khoảng 30%, 05 (đồng hồ) khoảng 60%, 06 (âm và scene) khoảng 40%, 10 (onboarding/SEO) khoảng 45%, 11 (PWA) khoảng 10%.
   - 07 (XP/league), 08 (Pro/SePay), 09 (mascot/AI) chưa bắt đầu.

---

## 1. Việc khẩn cấp — chỉ bạn làm được (hôm nay)

| # | Việc | Vì sao | Thời gian |
|---|---|---|---|
| 1 | **Quyết domain**: mua `pomodorostudy.online` ngay, hoặc giữ `pomodoro-focus.site` làm domain chính | Ai cũng mua được `.online` lúc này. Code, email, chính sách, llms.txt đều đang ghi domain này | 10 phút |
| 2 | **Bật auto-renew `pomodoro-focus.site` ≥ 2 năm** (Hostinger) | Hết hạn 11/11/2026. Cần giữ redirect 301 ít nhất 1 năm sau khi đổi domain | 5 phút |
| 3 | **Rotate Groq API key**; sửa `.env:14` (thiếu xuống dòng nên `NEXT_PUBLIC_GA_ID` dính `GROQ_API_KEY`) | Ở local, key bị chèn vào HTML và gửi sang googletagmanager.com mỗi lần tải trang. Prod và lịch sử git sạch | 10 phút |
| 4 | Dọn `.env` cũ: còn `SUPABASE_SERVICE_ROLE_KEY`, Spotify secret, `MEGALLM_API_KEY`, `NEXT_PUBLIC_MEGALLM_API_KEY`. Code không dùng biến nào trong số này. Rotate nếu key còn sống | Giảm bề mặt lộ key | 15 phút |
| 5 | Mở GSC của domain cũ, xem số trang đã index và query thật. Verify domain mới bằng DNS TXT | Cần dữ liệu thật để chốt từ khoá. Hiện mới có ước lượng | 30 phút |
| 6 | Cấp quyền MCP Vercel, Neon (qua `/mcp`) hoặc tự kiểm env | Chưa ai xem được env Vercel: có `DATABASE_URL` không, Neon đã migrate chưa, region ở đâu | 10 phút |

---

## 2. Bản đồ chuẩn chỉnh theo mảng

### 2.1 Hạ tầng và ra mắt v2 (chặn deploy)

| Mức | Việc | Nguồn |
|---|---|---|
| P0 | Domain chuẩn đã đăng ký, gắn Vercel; `NEXT_PUBLIC_SITE_URL` và `EMAIL_FROM` khớp domain thật; Resend verify domain gửi | tech P0-1, SEO P0-1 |
| P1 | Push nhánh, mở PR để CI chạy cả `next build`. Merge khi xanh | tech P1-2 |
| P1 | Migration Neon: chạy `DATABASE_URL=<neon unpooled> pnpm db:migrate`, thêm bước migrate có kiểm soát. `.env.local` chỉ có `NEON_DATABASE_URL`, code đọc `DATABASE_URL` nên trên Vercel sẽ throw nếu thiếu | tech P1-1, feature Q5 |
| P1 | **Ra mắt thẳng trên domain cuối.** Ra mắt trên domain cũ rồi mới chuyển thì khách mất cookie và localStorage | tech P1-5 |
| P1 | Error tracking: Sentry (free) hoặc `onRequestError` | tech P1-4 |
| P1 | Quy trình đổi domain: deploy, kiểm canonical và sitemap, bật `DOMAIN_MOVE=1`, redirect `/leaderboard` và `/chat` về `/` (hiện trả 404), GSC Change of Address | SEO P0-3 |
| P2 | Uptime monitor, `pg_dump` hằng tuần, Preview dùng Neon branch riêng | tech P2-9, P2-10 |
| P2 | CSP: thêm `report-to`; thêm host open-meteo (WIP thời tiết) trước khi enforce | tech P2-4 |

### 2.2 SEO

| Mức | Việc | Nguồn |
|---|---|---|
| P1 | **i18n theo URL**: `src/app/[lang]` với `/` là EN và x-default, `/vi`, `/ja`. Có `alternates.languages` trên mọi trang có bản dịch, sitemap alternates. Switcher đổi URL thay vì đổi cookie. Không auto-redirect theo Accept-Language. Đối thủ đang rank VI/JA (pomodomate, pomodotree) đều dùng thư mục locale | SEO P1-1 |
| P1 | **H1 SSR trên home.** Hiện timer `ssr:false` và heading đầu tiên là H2 | SEO P1-2 |
| P1 | `generateMetadata` theo locale (title VI/JA nhắm keyword) | SEO P1-3 |
| P1 | **Thay `card.jpg`**: ảnh lộ tên và email thật, và còn là UI cũ. Spec rebrand đã có ảnh OG bằng `next/og` | SEO P1-4 |
| P2 | Bỏ `cookies()` ở root layout để trang chạy static/ISR. Hiện **mọi trang dynamic và function đặt ở `cle1`**, nên TTFB của v2 với người dùng VN tệ hơn prod (prod LCP 0.83 s) | SEO P2-1, tech P1-3 |
| P2 | SSR sẵn khung "25:00" để LCP vẽ ngay từ HTML. Bớt preload font (12 file woff2); rebrand cũng đổi font | tech P1-3, P2-11 |
| P2 | JSON-LD: `WebApplication` chỉ đặt ở home, thêm `WebSite` + `Organization`. Có title template `%s \| Study Bro`, sitemap lastmod thật | SEO P2-3, P2-5, P2-6 |
| P3 | `manifest.json` `start_url` `/timer` → `/`; xoá meta `keywords`; cập nhật llms.txt | SEO P2-7, P3 |

**Cơ hội từ khoá** (ước lượng định tính, đo lại khi có GSC):

1. Landing tool `/vi` và `/ja`: "đồng hồ pomodoro online", "pomodoro online miễn phí", "ポモドーロタイマー". SERP yếu, có tool chạy trên subdomain `vercel.app` vẫn rank.
2. Trang preset VI/JA (50-10, 52-17, 25-5, 90-20) có `?preset=` thật. "hẹn giờ 50 phút nghỉ 10 phút" và "52/17 タイマー" **chưa có tool chuyên**.
3. `/vi/phuong-phap-pomodoro` có timer chạy ngay trong bài, nhắm long-tail (ôn thi, 50/10, 52/17).
4. Ngách khác biệt "pomodoro timer with games" (EN/VI): SERP không có tool chuyên.
5. Off-page: xin vào listicle VN (thegioididong, quantrimang, ybox, fptshop), alternativeto, Product Hunt, note.com (JA), các nhóm học tập trên FB/Zalo.

Không nên ưu tiên: head term EN (pomodoro timer, study timer, focus timer) vì đã bão hoà; "study with me" vì intent là video hoặc phòng học live.

Tổng cộng khoảng 15–25 URL, mỗi trang phải có nội dung riêng. Không nhân bản hàng loạt kiểu doorway.

### 2.3 Tính năng lõi (sửa trước khi ra mắt)

| Mức | Việc | Nguồn |
|---|---|---|
| **P0** | **9/40 âm môi trường là file câm** (bản sao của `silence.mp3`, −84 dB): birds, night-crickets, fireplace, white-noise, pink-noise, library, coffee-shop, coworking, cat-purring. Preset Cafe, Library, Cozy phát ra im lặng. Ẩn ngay hoặc thay file thật; thêm test CI chặn file < 50 KB | feature P0-1 |
| **P0** | **Phiên của khách bị bỏ im lặng** khi khách chưa tạo việc (`session-recorder.ts:125`), trong khi landing hứa "Every finished session is logged". Gọi `ensureSession()` trước khi ghi, sửa cùng giới hạn tạo khách (5/10 phút/IP chặn cả lớp học dùng chung Wi‑Fi) | feature P0-2, P1-7, tech P2-2 |
| P1 | **Ngày thống kê theo UTC.** Phiên lúc 00:31 giờ VN bị tính sang hôm trước, "Hôm nay" hiện 0, streak sai. Client gửi `tz`, server group theo `AT TIME ZONE`, cắt ngày lúc 04:00 như plan §5.2. Aggregate bằng SQL thay vì JS | feature P1-1, tech P2-8 |
| P1 | **Auto-start mặc định bật cả nghỉ lẫn tập trung**, nên rời máy 2 giờ sinh ra khoảng 4 phiên giả. Đổi mặc định `autoStartWork=false`, dừng sau nghỉ dài | feature P1-2 |
| P1 | **Mọi đoạn work +1 pomodoro** (70 giây cũng thành "1 of 1"). Chỉ cộng khi phiên trọn vẹn; thêm idempotency `client_session_id` | feature P1-3, tech P2-3 |
| P1 | Phím R, nút reset và palette xoá tiến độ mà không hỏi. Thêm confirm và lựa chọn "Ghi phần đã làm" | feature P1-4 |
| P1 | **Báo hết phiên không chắc tới tay người dùng**: `setInterval` trên main thread (tab ẩn có thể trễ khoảng 60 s), không có service worker nên Android không nhận thông báo, chữ thông báo tiếng Anh cứng | feature P1-6 |
| P1 | Không có UI chọn chuông và âm lượng chuông, dù có sẵn 5 file chuông | feature P1-5 |
| P1 | Key i18n thô trong dialog hoàn thành việc. 20 chỗ dùng `t() \|\| fallback` không bao giờ ra fallback | feature P1-6c |
| P1 | YouTube phát qua iframe ẩn, có rủi ro ToS. Cần mini player hiển thị | feature P1-8 |
| P2 | Mix âm mất sau reload; Esc không hoàn tác preview scene; toast tiếng Anh cứng; dock bị cắt khi viewport ≤ ~760 px; template là task gắn cờ; ảnh nền base64 trong localStorage; arcade không hiện giờ nghỉ còn lại; copy nói "tối đa 60 phút" nhưng app cho 120 | feature P2-1…P2-19 |

### 2.4 Tiện ích nên thêm (xếp theo giá trị/công sức, giữ YAGNI)

| # | Tiện ích | Công | Bằng chứng nhu cầu |
|---|---|---|---|
| 1 | **Báo hết phiên chắc chắn**: hẹn đúng mốc hoặc Worker, preload chuông, Wake Lock, service worker `showNotification` | S–M | Lời hứa cốt lõi của mọi app Pomodoro |
| 2 | **Mục tiêu ngày** (phút hoặc số phiên) + vòng tiến độ trên màn timer | S | Làm nền cho streak và XP sau này |
| 3 | **Ghi chú/đánh giá nhanh sau phiên** | S | Flocus, Focus To-Do có |
| 4 | **Mini timer Picture-in-Picture** (Document PiP) | M | Dùng cạnh IDE hoặc Zoom; đối thủ web làm chưa tốt |
| 5 | **Đồng bộ cài đặt theo tài khoản** (bảng `user_settings` jsonb) | M | Trang chủ đang hứa "keep your data across devices" |
| 6 | Xuất CSV (Free), báo cáo tuần qua email (Pro sau này) | S/M | |
| 7 | Bảng phím tắt `?`, palette đủ lệnh (thêm việc, đổi scene, mute, skip) | XS | Plan phase 03 |
| 8 | **Đếm ngược tới kỳ thi + mục tiêu theo mùa** (THPT 06/2027, đại học, kỳ thi JP tháng 1–3) | S | Không đối thủ nào nhắm đúng mùa thi VN |

Để sau: phòng học chung (body doubling không video), lịch tháng, việc lặp lại, offline đầy đủ.
Không làm: extension chặn web, widget hệ điều hành.

### 2.5 Kỹ thuật (giữ chất lượng)

- **Gate:**
  - Lint còn 94 warning nhưng CI vẫn cho phép 189 → hạ ngưỡng.
  - Coverage thật 26%, ngưỡng mới 14% → nâng lên khoảng 25%.
  - `pnpm audit --prod`: 7 lỗ hổng, đều ở tooling.
- **Hiệu năng:**
  - Import động PGlite để không trace khoảng 10 MB vào serverless function.
  - Tải locale theo ngôn ngữ (cả 3 file, khoảng 228 KB, đang nằm trong bundle).
  - Bỏ preload panel khi bật `saveData`.
- **Bảo mật:** rate limit OTP theo email; giới hạn số task và độ dài tag; CHECK enum ở DB; index `focus_sessions(task_id)`.
- **Dọn dẹp:**
  - Code chết: `animate-ui/**`, `streak-tracker`, `feature-gate`, plan mode, `bro-ai-system`…
  - Dependency thừa: `@react-three/drei`.
  - File Supabase cũ (`supabase_schema.sql`, `migrations/`).
  - `backgrounds-source/` 175 MB nằm trong git (cần quyết có xoá lịch sử không).
  - Thư mục trùng `.Jules/` và `.jules/`.
- **A11y:** `text-ink-faint` không đạt tương phản; 5 nút chỉ có icon thiếu `aria-label`; "Close" của dialog chưa dịch. Rebrand xử lý phần token.

### 2.6 Sản phẩm và thị trường (đã lọc)

- **Định vị:** "Pomodoro web cho học sinh, sinh viên Việt — miễn phí thật, không cần đăng ký, vui như game". Chưa có tool Pomodoro tiếng Việt nào dẫn đầu. YPT (Hàn) và Studyplus (Nhật) mạnh ở nước họ nhưng không nhắm VN.
- **Cơ hội sau ra mắt**, theo thứ tự:
  1. Đếm ngược kỳ thi (S)
  2. Thẻ kết quả tuần để chia sẻ FB/Zalo (S)
  3. League theo nhóm khoảng 30 người, reset theo tuần, sau khi có phiên xác thực (M)
  4. Mixer âm + YouTube mini player (M)
  5. Thiết kế thân thiện ADHD: bắt đầu trong 3 giây, streak có freeze (S)
  6. Trợ lý AI tổng kết ngày (M)
- **Không làm:** bảng xếp hạng toàn cầu mặc định công khai; phòng học có video; nhiều cổng thanh toán (chỉ SePay/VietQR); khoá tính năng theo level.
- **Giá Pro** (39k/tháng, 199k/năm, 499k trọn đời): hợp với thị trường VN. Cân nhắc nâng giá trọn đời (khoảng 699–799k) hoặc thêm gói sinh viên. Chưa cần quyết trước phase 08.
- **Thương hiệu:** "Study Bro" đang trùng với studybro.app (flashcard AI) và một app iOS. Nếu định đổi tên thì nên đổi **trước** khi đầu tư SEO và mua domain.

---

## 3. Lộ trình đề xuất

| Đợt | Nội dung | Ước lượng |
|---|---|---|
| **A. Khẩn cấp** | Mục 1 (domain, key, GSC, env) | Hôm nay, bạn tự làm |
| **B. Sửa lõi** | P0 âm câm + phiên khách; P1 múi giờ/04:00, auto-start, +1 pomodoro, confirm reset, key i18n thô, `client_session_id` | 1–2 ngày |
| **C. Rebrand Sticker pop** (spec đã viết) | Gộp các việc UX nằm trên cùng màn hình (mục 4) để không phải sửa một màn hai lần | Theo plan 7 giai đoạn của spec |
| **D. Sẵn sàng ra mắt** | Route `[lang]` + hreflang + metadata theo locale + H1; static/ISR; region gần châu Á (cùng Neon); CI và build xanh; Neon migrate; Sentry; uptime | 3–5 ngày |
| **E. Ra mắt** | Deploy lên domain cuối, `DOMAIN_MOVE=1`, GSC Change of Address, theo dõi 4–8 tuần | 0.5 ngày + theo dõi |
| **F. Nội dung + tiện ích** | `/vi/phuong-phap-pomodoro`, trang preset VI/JA, trang "timer with games"; báo hết phiên chắc chắn (Worker/SW/Wake Lock), mục tiêu ngày, ghi chú phiên, PiP, đồng bộ cài đặt; off-page | 1–2 tuần |
| **G. Tăng trưởng** (trước mùa thi 2027) | Phase 04 phiên xác thực **trước** phase 07 XP/league; đếm ngược kỳ thi; thẻ chia sẻ; phase 08 Pro/SePay; phase 09 trợ lý AI | Từ tháng 11/2026 đến tháng 3/2027 |

Nguyên tắc thứ tự:
- Không làm XP hay league khi số phút học vẫn do client tự khai.
- Không mở SEO VI/JA trước khi domain cuối đã chạy.
- Không ra mắt trên domain cũ rồi mới chuyển.

---

## 4. Đề xuất bổ sung vào spec rebrand

Những việc nằm đúng trên các màn hình sẽ được vẽ lại, nên làm luôn trong đợt C:

1. H1 hiển thị và SSR khung "25:00" trên màn timer (SEO P1-2, LCP).
2. Mục **"Chuông & thông báo"** trong cài đặt timer: chọn chuông, âm lượng, nghe thử, trạng thái quyền thông báo (feature P1-5).
3. Dialog confirm khi reset có tiến độ (P1-4); dialog hoàn thành việc dùng key i18n đúng (P1-6c).
4. Dock không bị cắt ở viewport thấp: `fixed` hoặc co đồng hồ theo `dvh` (P2-4). Esc đóng scene thì hoàn tác preview (P2-2).
5. Arcade có mini timer hiển thị giờ nghỉ còn lại (P2-12).
6. Toast và nút "Close" đi qua i18n (P2-3, a11y). Tomo thay toast thành công cho thao tác nhỏ.
7. `manifest.json`: `start_url` `/`, theme mới (spec đã có `theme_color`).
8. Ẩn 9 âm câm khỏi catalog và preset cho tới khi có file thật (P0-1).

---

## 5. Câu hỏi cần bạn chốt

1. **Domain:** mua `pomodorostudy.online` hay giữ `pomodoro-focus.site`? Có đổi tên thương hiệu không, vì "Study Bro" đang trùng studybro.app và một app iOS?
2. **Ngôn ngữ mặc định:** `/` là EN (x-default) và `/vi`, `/ja` riêng, hay `/` là VI vì thị trường chính là Việt Nam?
3. **Âm thanh:** mua hoặc thu 9 file mp3 thật, hay chuyển sang âm tự tổng hợp (Web Audio) như plan §6? Trong lúc chờ thì ẩn 9 âm đó.
4. Đổi mặc định **auto-start tập trung thành tắt**? Bỏ qua phiên khi đã chạy ≥ 50% có tính là 1 pomodoro không? Có chặn arcade khi đang tập trung không?
5. **Region:** dời function và Neon sang Singapore/Tokyo (`sin1`/`hnd1`) vì người dùng chủ yếu ở VN/JP?
6. Có xoá `backgrounds-source/` (175 MB) khỏi lịch sử git không? Việc này cần force-push.
7. Xoá tài khoản test local `audit-261005@example.com` trong `.pglite/` không? (Dev server :3001 hiện do agent audit khởi động lại.)
8. Giá trọn đời 499k giữ nguyên hay nâng lên? (Chưa gấp, quyết trước phase 08.)
