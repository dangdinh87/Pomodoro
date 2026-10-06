# Study Bro relaunch — báo cáo tổng kết (05/10/2026)

- **Nhánh:** `feat/design-system`, 209+ commit kể từ `master`. Đã push; **PR nháp #188**: https://github.com/dangdinh87/Pomodoro/pull/188 (không merge, không deploy).
- **Plan:** `plans/261005-0106-study-bro-relaunch/plan.md` (bảng batch), `followups.md` (việc còn treo), `prompt.md` (yêu cầu gốc).
- **Cách làm:** chia thành khoảng 20 batch, mỗi batch giao cho một agent thực thi theo TDD và có báo cáo riêng `plans/reports/implementation-261005-*.md`.
  - Các batch chạy song song trên cùng thư mục làm việc. Commit đi qua khoá chung `commit-own.py`.
  - Với file dùng chung, chỉ stage hunk của mình (`stage-own-hunks.py`). Hunk thời tiết của phiên khác luôn bị loại ra.
- **Ảnh chụp:** `plans/reports/assets-261005-relaunch/` (từng batch) và `assets-261005-final-audit/` (audit cuối). Không commit.

## 1. Đã làm theo giai đoạn

| Giai đoạn | Nội dung chính | Commit (đầu…cuối) | Báo cáo |
|---|---|---|---|
| **1A** Ghi phiên | Khách luôn được ghi phiên (`ensureSession`); rate limit khách 30/10 phút, có toast 429 riêng; chỉ phiên hết giờ tự nhiên mới +1 pomodoro; `client_session_id` unique + migration 0002; `endedAt` thật; trần 24h trong transaction có advisory lock; `switchActiveTask` | b643e24…f292c88 | batch-1a |
| **1B** Thống kê theo múi giờ | Ngày học bắt đầu 04:00 theo tz của người dùng; gom số liệu bằng SQL; streak, lịch sử, tên file export | 3b1f004…9158d8f | batch-1b |
| **1C** Timer | `autoStartWork` mặc định tắt (migrate state đã lưu); đếm phiên reset theo ngày; hỏi trước khi reset (có "Lưu phần đã làm"); `setTimeout` đúng mốc deadline; Wake Lock; mục "Chuông & thông báo"; chữ thông báo i18n | 7d9ab80…fc91ba8 | batch-1c |
| **1D** Đa ngữ | Ẩn 9 âm câm và test kích thước file; thêm 5 key thiếu; test quét key thiếu, `t()\|\|fallback` và placeholder lệch; toast i18n; sửa copy 120 phút và số ít/nhiều; bảng thuật ngữ VI/JA | … 93b50eb | batch-1d |
| **1E** P2 chức năng | Ngừng tự chạy khi vắng; khôi phục bản mix sau reload; Esc hoàn tác scene; đồng bộ fullscreen; error boundary cho panel; cache probe WebGL; ảnh nền dùng IndexedDB; báo khi outbox phải bỏ phiên; redirect `/leaderboard`, `/chat`; GA chỉ chạy với ID hợp lệ | c2223f6…bb8e542 | batch-1e |
| **1F** Âm thanh | Tổng hợp bằng ffmpeg 5 chuông khác nhau và white/pink/brown noise; có script tạo lại; test chống file trùng | 631c322, c360dbb | batch-1f |
| **2.1** Nền móng | Token sáng/tối, `.btn*`/`.sticker*`, nền giấy kem có doodle, font Baloo 2 + Nunito, chọn Sáng/Tối/Hệ thống, 6 bộ màu kèm test tương phản (thấp nhất 4.82) | cdd85b0…a7198ba | batch-2-1 |
| **2.2** Thương hiệu | Tomo SVG 5 biểu cảm, Logo, favicon, icon PWA, manifest, ảnh OG `next/og`; **xoá `card.jpg`** (lộ tên/email); gỡ sói | ac18c60…5d6c5f9 | batch-2-2 |
| **2.3** Primitive | 11 lớp phủ + toàn bộ control; primitive mới IconTile, StickerCard, StreakPill, SessionTomatoes, TomoBubble; trang `/dev/ui` (404 ở production) | 56b34c1…815704d | batch-2-3a/b |
| **2.4** Khung + timer | Status bar, dock, tab bar mobile, ⌘K có thêm lệnh, bảng phím tắt `?`; H1 + khung "25:00" render ở server (CLS 0); thẻ đồng hồ sticker, đồng hồ 2D; `pickTomoMood` (6 luật, test ranh giới 18:00/23:00/04:00); lời Tomo 3 ngôn ngữ; SessionCelebration | 27f1ba0…b1618ea, 164ed1f…536d804 | batch-2-4a/b |
| **2.5** Panel | Việc, Thống kê, Cài đặt, Góp ý, Âm thanh (aria-valuetext), Không gian, Đồng hồ, Arcade (mini timer, tự dừng khi đổi pha) | 67010d4…215a747, c14cd5c…2e84d9b | batch-2-5a/b |
| **2.6** Trang ngoài app | Landing, hướng dẫn (ngày cập nhật, nguồn tham khảo), pháp lý, 404 theo theme, trang lỗi, đăng nhập; viết lại `docs/design-system.md` | 7695916…ab61843 | batch-2-6 |
| **2.7** Dọn dẹp | **Mini player YouTube hiển thị** (bỏ iframe ẩn; sàn 200×200 theo ToS); cài đặt timer/chuông; doodle cà chua; stage co giãn theo `dvh` | 9d1e1c5…e56289f | batch-2-7 |
| **3a** URL đa ngôn ngữ | `src/app/[lang]` (en không prefix, `/vi`, `/ja`); proxy rewrite; `/en/*` redirect 308; `<html lang>` theo URL; `getT(locale)`; switcher giữ `?panel=` và timer; banner gợi ý thay cho tự động chuyển hướng; mỗi trang chỉ tải 1 file ngôn ngữ | caaaaf3…37914e1 | phase-3a |
| **3b** SEO theo ngôn ngữ | Title/description viết riêng từng ngôn ngữ, canonical tự tham chiếu, hreflang en/vi/ja/x-default, sitemap 12 URL có alternates, JSON-LD theo loại trang, OG theo ngôn ngữ (JA dùng subset Zen Maru Gothic), llms.txt | 587fbb0…9505cee | phase-3b |
| **4a** Dọn code | Xoá 20 file chết (khoảng 2.965 dòng), gỡ 3 dependency, timer-store v3 / audio-store v4 có migrate, `requestTimerSkip()` | e9d8968…473ef1b | phase-4a |
| **4b** Hạ tầng | Workflow `db-migrate`, theo dõi lỗi (`onRequestError` + endpoint client-error, Sentry tuỳ chọn, không thêm dependency), OTP giới hạn theo email, endpoint báo cáo CSP + host open-meteo, migration index/CHECK, ratchet lint 50 và coverage 50%, `.env.example` | 5254aee…aaff643 | phase-4b |
| **Rà soát + sửa** | Rà soát code (0 P0 / 2 P1 / 5 P2) và sửa: engine không ghi đè deadline khi quay lại app, máy ngủ rồi thức, id phiên xác định chống đếm đôi, YouTube sau remount, quota báo lỗi, OTP; chặn build production khi thiếu `NEXT_PUBLIC_SITE_URL`/`EMAIL_FROM` | … 1eac46a | code-review-…, review-fixes |
| **Audit giao diện + sửa** | 1 P0 (chip chế độ không bấm được), 3 P1, 10 P2: đã sửa hết trừ phần thuộc WIP thời tiết | 641a8a3…cdc2a7c | visual-audit-…, visual-fixes |
| **Hiệu năng + chuông xuyên trang** | First-load JS `/[lang]` từ 318 xuống **214 KB** gzip; trang nội dung 204 KB (riêng React + Next đã 141 KB); PGlite ra khỏi trace (20 MB → 0); hết cảnh báo baseURL; `DeadlineWatcher` báo chuông cả khi đang ở `/guide` | 75430cc…2a2f312 | perf-and-global-alarm |

## 2. Kết quả kiểm

- **Build sạch HEAD** (bản `git archive`, mô phỏng CI Node 22): xem mục 5. Lần build trước ở da320f6 đã xanh, 32 trang SSG.
- **Trong repo:** type-check sạch, lint 0 lỗi, i18n OK.
  - `pnpm test` khoảng 1.770 test xanh.
  - 5 test đỏ đều ở `src/lib/weather/weather-mood.test.ts`. Đây là WIP thời tiết chưa commit của phiên khác, nên không nằm trong HEAD và không ảnh hưởng CI.
- **Audit giao diện cuối:**
  - Không cuộn ngang ở 360–1440.
  - Không còn key i18n thô.
  - Tương phản AA cả sáng lẫn tối; CLS 0; Lighthouse a11y 94–95, SEO 100.
  - Giảm chuyển động hoạt động đúng.

## 3. Mặc định tự chọn (chủ dự án đổi nếu muốn)

- **Âm thanh:** ẩn 7 âm môi trường cần bản thu thật; white/pink/brown noise và 5 chuông được tổng hợp bằng máy.
- **Timer:**
  - `autoStartWork` mặc định tắt.
  - Phiên tập trung chỉ tự bắt đầu nếu có tương tác kể từ đầu phiên trước.
  - Chỉ phiên hết giờ tự nhiên mới được +1 pomodoro.
  - Phiên trễ hơn 15 phút (máy ngủ) không ghi, chỉ hiện thông báo nhẹ.
- **Đa ngôn ngữ:** không tự chuyển hướng theo ngôn ngữ trình duyệt; chỉ hiện banner gợi ý. Slug giữ tiếng Anh (`/vi/guide`).
- **Giao diện:**
  - Dark mode dùng `--control-edge` `#8A7465` cho viền control (đạt WCAG 1.4.11), lệch spec có chủ đích.
  - Heatmap đổi màu theo bộ màu người dùng chọn.
- **YouTube:** player hiển thị tối thiểu 200×200. Trên mobile nằm trong luồng trang dưới thẻ đồng hồ. Player ở `z-40` nên bị panel che khi panel mở (lý do ghi trong design-system).
- **Hạ tầng:**
  - CSP vẫn ở chế độ Report-Only.
  - Theo dõi lỗi không cần dependency; Sentry chỉ bật khi có `SENTRY_DSN`.
  - OTP: mỗi IP 3 lần, mỗi email 7 lần trong 10 phút.
  - Giữ region `cle1`.

## 4. Việc chủ dự án phải tự làm

1. **Mua `studywithbro.com`** và gia hạn `pomodoro-focus.site` (hết hạn **11/11/2026**) thêm từ 2 năm trở lên. Giữ redirect 301 ít nhất 1 năm.
2. **Rotate Groq key.** Sửa `.env:14` (thiếu xuống dòng nên GA ID dính Groq key) và dọn các key cũ (Supabase service role, Spotify, MegaLLM).
3. **Env trên Vercel Production:**
   - `NEXT_PUBLIC_SITE_URL=https://studywithbro.com` và `EMAIL_FROM=Study Bro <no-reply@studywithbro.com>`. Thiếu một trong hai thì build production sẽ cố ý dừng.
   - `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
   - `DATABASE_URL` (Neon, pooled).
   - `RESEND_API_KEY`, và verify domain gửi trên Resend.
   - `NEXT_PUBLIC_GA_ID` dạng `G-…` hoặc `GTM-…`.
   - Nên có `SENTRY_DSN`.
   - Môi trường Preview dùng Neon branch riêng.
4. **GitHub secret `DATABASE_URL`** (Neon unpooled) cho workflow `db-migrate`. Chạy workflow này bằng tay một lần trước lần deploy đầu.
5. **GSC:** verify domain mới bằng DNS TXT. Sau khi deploy, dùng Change of Address từ property cũ và submit sitemap mới.
6. **Xoá file sót:** `git rm -r migrations supabase_schema.sql fix_sessions_rls.sql public/images`. Bộ kiểm quyền đã chặn lệnh xoá nên agent không làm; đã grep, không còn chỗ nào tham chiếu.
7. Quyết `git rm --cached .Jules/palette.md` (va chạm hoa/thường với `.jules/`).
8. Quyết có viết lại lịch sử git không: để gỡ `card.jpg` (tên, email) và `backgrounds-source/` (175 MB). Việc này cần force-push.
9. Cung cấp bản thu thật cho 7 âm còn ẩn. WIP thời tiết đang dùng 3 âm trong số đó (birds, night-crickets, fireplace).

## 5. Build cuối và PR

- **Build sạch HEAD `2a2f312`** (`git archive`, Node 22, `CI=true`, `BETTER_AUTH_SECRET` placeholder giống `ci.yml`):
  - install `--frozen-lockfile`, type-check, lint `--max-warnings 50` (0 lỗi / 41 cảnh báo), i18n:check: đều xanh.
  - Test: 182 file / **1730 test xanh**.
  - `next build`: xanh, 32 trang tĩnh.
- **Kiểm trước khi push:**
  - Không commit nào chứa file thời tiết hay `.env*`.
  - Quét diff `master..HEAD` không thấy secret (`gsk_`, `sk-`, `service_role`, `re_`).
- **PR #188 (nháp):** mọi check đều **pass**: `verify` (CI GitHub), `Vercel` (build preview), `Vercel Preview Comments`.
- **Preview** `https://pomodoro-focus-git-feat-desig-47e0f1-nguyendangdinh47s-projects.vercel.app` đang bật Vercel Deployment Protection (trả 302 tới trang đăng nhập Vercel). Mở bằng trình duyệt đã đăng nhập Vercel để xem. Nên kiểm `/opengraph-image` trên preview (follow-up #6).
- **Thư mục build nháp** `scratchpad/final-check/` chưa xoá được: lệnh xoá bị chặn vì đó là thư mục làm việc hiện tại của phiên. Thư mục nằm trong vùng tạm `/private/tmp/claude-501/...`, có thể xoá tay.

## 6. Câu hỏi còn mở

1. Phiên đang làm tính năng thời tiết sẽ commit khi nào? Trong WIP có `geolocation=(self)` (Permissions-Policy) và các key locale; màn cài đặt thời tiết đang kẹt ở "Detecting your area…".
2. `NEXT_PUBLIC_FEATURE_HISTORY` chỉ ẩn UI, chưa chặn `/api/history` và `/api/stats`. Nối cờ vào 2 route, hay bỏ cờ?
3. Trang nội dung còn 204 KB JS. Có muốn làm tiếp không: cho bộ chọn ngôn ngữ chỉ nạp Radix Select khi người dùng tương tác, bớt khoảng 20 KB?
4. Chuông báo xuyên trang đã có (`DeadlineWatcher`), nhưng thông báo trên Android vẫn cần Service Worker (phase PWA).
