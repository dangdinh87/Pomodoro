---
title: "Study Bro v2 — research tổng hợp"
created: 2026-10-01
sources:
  - ../reports/researcher-261001-2242-competitors-ux.md
  - ../reports/researcher-261001-2241-competitors-deep.md
  - ../reports/researcher-261001-2241-gamification-anticheat.md
  - ../reports/researcher-261001-2241-tech-stack.md
  - ../reports/scout-261001-2241-luyenphongvan-reuse.md
  - ../reports/scout-261001-2241-pomodoro-inventory.md
---

# Research tổng hợp

Bản này gom 6 báo cáo con và **đã sửa những chỗ báo cáo con sai** (ghi rõ ở từng mục). Chi tiết và link nguồn nằm trong các báo cáo gốc ở `plans/reports/`.

## 1. Đối thủ — rút ra gì

| Sản phẩm | Điểm đáng học | Điểm tránh |
|---|---|---|
| Pomofocus | Timer chính là trang chủ, bài viết SEO nằm ngay dưới timer; bản free đủ dùng | Giao diện cũ, không có âm thanh/nền |
| Flocus | Nền + âm thanh + timer trong một khung, rất "aesthetic"; có gói năm và trọn đời ($9/tháng, $5/tháng theo năm, $99 trọn đời — trang giá flocus.com, xem 1/10/2026) | Nhiều tính năng planner làm loãng trọng tâm |
| LifeAt | "Không gian" = nền + âm thanh + công cụ, đổi không gian một chạm | Nặng, nhiều widget |
| Forest | Hình ảnh cây lớn dần theo thời gian tập trung, "mất" cây khi bỏ dở → cảm giác mất mát thật; tiền ảo đổi cây | Cơ chế phạt có thể gây áp lực |
| Focusmate / StudyStream | Trách nhiệm xã hội (học cùng người thật, phòng camera) | Cần cộng đồng đủ đông; camera xâm phạm riêng tư |
| Session / Flow | Nghi thức trước phiên (thở), tối giản, phím tắt | Chỉ macOS/iOS |
| Tide | Âm thanh thiên nhiên chất lượng cao, ít chữ | Ít chiều sâu thống kê |
| YPT (Yeolpumta) | Xếp hạng thời gian học theo nhóm cùng trình độ, nhóm bạn; rất phổ biến với học sinh châu Á (4.5★, ~80k đánh giá trên Play) | Cơ chế chống gian lận không công bố rõ |
| Duolingo (cơ chế) | Streak + "freeze" tự kích hoạt, league tuần theo nhóm ~30–50 người, thăng/hạ hạng | Thông báo dồn dập, cảm giác bị ép |
| Finch | Không phạt khi bỏ lỡ, nhân vật được chăm sóc | — |

**Sửa báo cáo con:** báo cáo "deep" nói *không đối thủ nào bán gói trọn đời* — sai (Flocus có $99 trọn đời; Pomofocus và Focus To-Do cũng có). Báo cáo đầu nhầm mascot là cú — Study Bro dùng **sói**. Con số "30% user burnout" lấy từ blog không có nghiên cứu gốc → không dùng.

**Pattern sẽ theo:**
1. Timer là trang chủ, mở ra là dùng được ngay, không bắt đăng ký (Pomofocus, Flocus).
2. "Không gian" (scene) = nền + âm thanh + kiểu đồng hồ + bộ màu, đổi một chạm (LifeAt, Flocus).
3. Hình ảnh tiến độ có tính "sống" (cây của Forest → quả cà chua 3D chín dần của Study Bro).
4. Streak có freeze kiếm được, tự kích hoạt (Duolingo); không phạt kiểu xấu hổ (Finch).
5. Xếp hạng theo **league tuần ~30 người cùng mức** + bảng bạn bè, không đẩy bảng toàn cầu làm mặc định (YPT, Duolingo).
6. Nghi thức ngắn trước phiên (Session) — tuỳ chọn, tắt được.
7. Bài viết phương pháp có giá trị nằm ngay trên trang (SEO kiểu Pomofocus).

**Anti-pattern sẽ tránh:** giới hạn số phiên ở bản free; quảng cáo; bảng xếp hạng toàn cầu công khai mặc định; widget dồn đống (LifeAt); phạt mất tiến độ khi lỡ một ngày; bắt bật camera.

## 2. Khác biệt cho người dùng Việt

| Ý tưởng | Impact | Effort | Ghi chú |
|---|---|---|---|
| Đồng hồ 3D độc đáo (cà chua chín dần, đồng hồ cát, split-flap…) | Cao | Cao | Không đối thủ nào làm; là "điểm nhấn" thương hiệu |
| Mùa thi: đếm ngược kỳ thi THPT/học kỳ, mục tiêu giờ học theo tuần | Cao | Thấp | Gắn đúng nhu cầu thật của học sinh VN |
| Thẻ chia sẻ kết quả (ảnh OG tuần/tháng) để đăng Facebook/Zalo | Cao | Thấp | Dùng lại hệ ảnh OG của luyenphongvan |
| League tuần theo nhóm + nhóm bạn (mã mời) | Cao | Trung bình | Thay cho "study room" realtime ở v2 |
| Trợ lý AI tiếng Việt (chia task, tổng kết ngày) | Trung bình | Thấp | Port client VietAPI của luyenphongvan |
| Phòng học realtime (study room) | Cao | Cao | Để v2.1, khi đã có người dùng |

## 3. Quyết định kỹ thuật

| Hạng mục | Chọn | Lý do | Đã loại |
|---|---|---|---|
| Framework | **Next.js 16 + React 19 + Tailwind v4** (nâng cấp ở phase 0) | Cùng stack với luyenphongvan → port được `after()`, AI SDK 6, OG; R3F v9 cần React 19 | Ở lại Next 14 (không port được code AI/OG của cv-app) |
| DB | **Neon Postgres + Drizzle ORM** (schema TS là nguồn sự thật, `drizzle-kit` migrations) | Cùng nhà cung cấp với cv-app; Drizzle nhẹ, chạy tốt serverless, migration có kiểm soát | Supabase mới (đã chết một lần, khoá vào RLS), Prisma (nặng), Turso (thiếu JSONB/FTS) |
| Auth | **Better Auth 1.x** (Google + email OTP + plugin anonymous) | Có sẵn tài khoản khách và gộp tài khoản khách → thật; session lưu DB, thu hồi được; Auth.js nay do nhóm Better Auth bảo trì | NextAuth v5 (như cv-app — không có anonymous, phải tự làm merge) |
| Dữ liệu khách | **IndexedDB (Dexie)** + hàng đợi đồng bộ khi đăng nhập | Dùng được ngay không cần tài khoản; phiên focus là bất biến nên merge đơn giản | localStorage (giới hạn, không truy vấn được) |
| Thanh toán | **SePay** (VietQR chuyển khoản, webhook) — port luyenphongvan | Đã chạy thật; webhook idempotent bằng một UPDATE + `sepay_reference` unique; VIEW `active_entitlements` | Stripe (sinh viên VN ít thẻ), MoMo/VNPay (phí + thủ tục) |
| AI | **VietAPI** qua `@ai-sdk/openai-compatible` (AI SDK 6), port client + chuỗi model dự phòng + bảng `ai_usage` của cv-app | Yêu cầu của chủ dự án; đã có quota/hoàn lượt/lọc ký tự lạ | OpenRouter (báo cáo tech đề xuất — **không theo**, sai yêu cầu) |
| Điểm & xếp hạng | **Server là nguồn sự thật**: phiên do server cấp id + đóng dấu giờ, heartbeat, sổ cái điểm chỉ ghi thêm, bảng xếp hạng là materialized view | Chống chỉnh giờ máy, nhiều tab, gửi lại; sửa sai bằng bút toán đảo | Tin số client gửi (lỗ hổng hiện tại) |
| 3D | **react-three-fiber v9 + drei**, tải động (`next/dynamic`, `ssr:false`), phát hiện WebGL/máy yếu → tự về 2D | Hệ sinh thái lớn nhất; mỗi đồng hồ là một chunk riêng | Spline (nặng, khó điều khiển theo thời gian) |
| Animation | **motion v12** cho UI; **GSAP** (miễn phí toàn bộ plugin từ 2025) cho các cảnh có timeline (onboarding, ăn mừng) | Mỗi thư viện đúng việc của nó | Lottie cho mascot (đổi sang sprite như Cú) |
| Mascot | **Sprite webp nhiều biểu cảm** theo mẫu `page-mascot.tsx` của Cú, nhân vật **sói** của Study Bro | Đã chạy thật ở cv-app, nhẹ, tự xử lý reduced-motion | Rive (đẹp nhưng phải vẽ lại từ đầu bằng công cụ riêng — cân nhắc v2.1) |
| Âm thanh | **Web Audio API** (AudioBuffer loop không khe hở, GainNode cho từng kênh, crossfade) + Media Session | Mixer nhiều kênh cần loop liền mạch; `<audio>` có khe hở khi lặp | Howler (thêm lớp không cần thiết), Tone.js (quá nặng) |
| Nguồn âm thanh/nhạc | Freesound **chỉ CC0**, Pixabay (Content License, dùng thương mại, không cần ghi công nhưng không được phân phối file lẻ), nhạc lofi tự đặt làm hoặc mua giấy phép; YouTube chỉ ở **mini player hiển thị** | Không rủi ro bản quyền | Tách tiếng YouTube chạy ẩn (vi phạm điều khoản YouTube) |
| Nền | Ảnh/video Pexels & Pixabay (giấy phép cho phép thương mại) + **nền shader tự viết** (không lo bản quyền, nhẹ) | Có "nền sống" độc đáo | Video nặng làm mặc định |
| PWA | **Serwist** (cache offline, timer chạy offline, cài đặt app) | Kế nhiệm next-pwa, hỗ trợ App Router | next-pwa (ngừng phát triển) |
| SEO | `/` là app + nội dung SSR bên dưới; trang riêng: `/phuong-phap-pomodoro`, `/pricing`, `/bang-xep-hang`, hồ sơ công khai, pháp lý; ảnh OG từng trang; JSON-LD `WebApplication`, `FAQPage`, `HowTo` | Một trang cho người dùng, vẫn đủ trang cho Google | SPA thuần (không index được) |

**Sửa báo cáo con:** báo cáo tech ghi "Better Auth v5" — Better Auth đang ở **1.x**; báo cáo đề xuất OpenRouter — **giữ VietAPI** theo yêu cầu. Các số liệu hiệu năng quảng cáo (Tailwind "5× nhanh hơn") không dùng làm lý do quyết định.

## 4. Gamification — bằng chứng chính

- Streak + freeze giảm rời bỏ (Duolingo công bố freeze giảm churn ở nhóm có nguy cơ; người có streak 7 ngày gắn bó hơn rõ rệt). Freeze phải **kiếm được, không bán**.
- Lý thuyết tự quyết (SDT): phần thưởng nên mang tính *ghi nhận* (huy chương, đồ trang trí) chứ không *kiểm soát* (bắt buộc đạt mục tiêu mới được dùng tính năng). Không khoá tính năng cốt lõi sau level.
- Bảng xếp hạng toàn cầu làm nản người ở dưới; league nhỏ cùng mức + bạn bè thì có lợi.
- **Pro không được kiếm nhiều điểm hơn** (không pay-to-win).
- Chống gian lận: server cấp phiên + heartbeat 30 s, một phiên đang chạy mỗi người, giờ server là chuẩn, idempotency key, giới hạn điểm/ngày, phát hiện bất thường, sửa bằng bút toán đảo — và **giải thích cho người dùng vì sao một phiên không được tính**.

Thiết kế chi tiết (công thức) nằm ở `plan.md` §5.

## 5. Tái dùng từ luyenphongvan (port gần nguyên)

| Hệ thống | File gốc (cv-app) | Cách dùng ở Study Bro |
|---|---|---|
| Mascot sprite | `page-mascot.tsx`, sprite webp 9 hướng × 9 biểu cảm | Làm bộ sprite sói cùng cấu trúc; trạng thái: chào, tập trung (cúi đọc), nghỉ (vươn vai), ăn mừng, buồn ngủ (đêm) |
| AI VietAPI | client + model fallback (chờ byte đầu 15 s) + lọc ký tự Hán/Thái + `ai_usage` (giữ lượt trước, hoàn khi lỗi) | Trợ lý: chia task, tổng kết ngày; quota Free/Pro |
| SePay | tạo đơn, QR, webhook idempotent, `active_entitlements`, `useEntitlement`, kích hoạt tay | Gói Pro tháng/năm/trọn đời |
| Huy chương | 10 họ × 4 bậc, tính lúc đọc | Đổi sang tính từ sổ cái điểm + phiên đã xác thực |
| Leaderboard | cache 10 phút, dòng của người xem tính trực tiếp | Giữ mẫu, nguồn dữ liệu là materialized view |
| OG/SEO | `renderOgCard`, `robots.ts`, JSON-LD | Ảnh OG từng trang + thẻ chia sẻ kết quả tuần |
| UI | Button, Modal, EmptyState, toaster, store "một popup mỗi lúc" | Store popup dùng cho kiến trúc một trang |

**Bẫy đã biết:** VietAPI chèn 1.7–4.4k token prompt ẩn mỗi lượt; **không bao giờ** chạy `check-models --all`; `after(consumeStream)` phải đi cặp với `consumeSseStream`; trang con khai `openGraph` riêng sẽ mất ảnh OG của trang cha; paywall chỉ chặn ở client là vô dụng.

## 6. Hiện trạng Pomodoro ảnh hưởng tới plan (từ báo cáo inventory)

| Phát hiện | Hệ quả cho v2 |
|---|---|
| Supabase chết; repo không có `CREATE TABLE` cho `tasks`/`sessions` (tạo bằng Prisma trước đây), `user_id` là TEXT không khoá ngoại | Dựng DB mới từ đầu bằng Drizzle. Dữ liệu cũ chỉ lấy lại được nếu khôi phục được project Supabase để dump |
| 28 file import Supabase; người đã đăng nhập ghi thẳng được vào bảng `sessions`/`streaks`/`tasks` từ trình duyệt | Bỏ truy cập DB từ client hoàn toàn; mọi ghi đi qua API server có validate |
| Timer: quy tắc ≥50% chỉ áp khi bỏ qua và chỉ ở client; chỉnh giờ máy hoặc đặt phiên 1 phút vẫn được tính | Phiên do server xác thực (phase 04) |
| 10/41 file mp3 là cùng một đoạn im lặng 0.5 s; `brown-noise` trùng `wind`; 5 tiếng báo thức là cùng một file; không có ghi chép giấy phép cho âm thanh và ảnh nền | Thay toàn bộ thư viện âm thanh/nền bằng nguồn có giấy phép, kèm `license manifest` cho từng file |
| YouTube chạy ẩn 0×0 chỉ để lấy tiếng | Vi phạm điều khoản YouTube → đổi sang mini player hiển thị |
| `backgrounds-source/` 181 MB nằm trong git | Chuyển tài sản gốc ra kho riêng (Vercel Blob/R2), repo chỉ giữ manifest |
| AI chat dùng MegaLLM (Kimi K2), không giới hạn token ở bản hiện tại | Thay bằng VietAPI + quota |
| ~35 file không còn ai import; 8 dependency thừa; 120 lỗi TS (17 trong code app); build bỏ qua lỗi type/lint | Dọn ở phase 00–01, bật lại gate typecheck/lint trong build |
| Nhánh `fix/security-and-quality-gates`: sửa open redirect, chi phí chat, validate input, header, ghi trùng nhiều tab; thêm CI, feature flag, xuất/xoá tài khoản, PWA icon, trang lỗi. 46 đường dẫn trùng với working tree (rủi ro nhất: `task-management.tsx`, `timer-controls.tsx`, 2 layout, `globals.css`, 3 file locale) | Merge ở phase 00 trước mọi thay đổi khác |

## 7. Câu hỏi còn mở (đưa vào phần hỏi chủ dự án)
- Key/ví VietAPI riêng hay dùng chung với cv-app? Tài khoản SePay chung hay riêng?
- Ai vẽ bộ sprite sói (không có công cụ tạo ảnh trong phiên)?
- Giá cụ thể (đề xuất ở `plan.md` §4).
