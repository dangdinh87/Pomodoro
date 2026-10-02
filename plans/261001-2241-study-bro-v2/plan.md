---
title: "Study Bro v2"
status: approved 2026-10-01 (chủ dự án trả lời 8 câu hỏi)
created: 2026-10-01
branch: feat/design-system (làm chung một nhánh, merge fix/security-and-quality-gates vào)
research: ./research.md
---

# Study Bro v2

## 1. Tầm nhìn

Study Bro là **chỗ ngồi học** của học sinh, sinh viên và dev Việt: mở ra là vào phiên tập trung ngay, có không gian đẹp, âm thanh dễ chịu, và thấy rõ công sức của mình cộng dồn mỗi ngày.

- **Việc chính:** bắt đầu một phiên tập trung trong một chạm và ở lại trong phiên.
- **Việc phụ:** giữ danh sách việc ngắn; thấy tiến bộ (streak, giờ học, huy chương); nghỉ đúng cách.
- **Điểm nhấn duy nhất:** đồng hồ. Mọi thứ khác lùi lại. Đồng hồ 3D "quả cà chua chín dần" là hình ảnh thương hiệu.
- **Không AI slop:** không gradient/glow trang trí, không icon Sparkles, không thẻ rời cùng trọng lượng, không nhãn viết hoa toàn bộ, không số liệu bịa.

## 2. Kiến trúc thông tin — một trang

`/` là app (khách dùng ngay, không cần đăng ký). Mọi thiết lập mở tại chỗ, không chuyển trang.

```
┌──────────────────────────────────────────────────────────────┐
│ Study Bro                          🔥 12  ◔ Lv 7   (avatar)  │  ← trạng thái, mờ dần khi đang tập trung
│                                                              │
│                ( Tập trung )  Nghỉ ngắn   Nghỉ dài           │
│                                                              │
│                        [ ĐỒNG HỒ ]                           │  ← 2D hoặc 3D, theo scene
│                 ━━━━━━━━━━━━━━━━━━━━━──────                  │
│                    Phiên 2/4 · ● ● ○ ○                       │
│                  ↺   [ ▶ Bắt đầu tập trung ]   ⏭             │
│               ◎ Ôn chương 3 Giải tích      2/4 ▾             │
│                                                              │
│   [Việc] [Âm thanh] [Không gian] [Đồng hồ] [Thống kê] [⋯]    │  ← dock (mobile: thanh dưới)
└──────────────────────────────────────────────────────────────┘
```

| Lớp | Mở bằng | Dạng |
|---|---|---|
| Việc cần làm | dock, phím `T` | sheet trái (mobile: bottom sheet) |
| Âm thanh (mixer, nhạc tập trung, YouTube mini player) | dock, `S` | sheet phải |
| Không gian (scene = nền + âm thanh + đồng hồ + màu) | dock, `B` | popup gallery có xem trước |
| Đồng hồ (2D/3D) | dock, `C` | popup gallery có xem trước trực tiếp |
| Thống kê, streak, huy chương | dock, `H` | sheet |
| League và bạn bè | biểu tượng streak/level | sheet |
| Trợ lý (mascot sói) | bấm mascot | bong bóng → panel |
| Cài đặt, tài khoản, gói Pro | avatar | dialog nhiều tab |
| Mọi lệnh | `⌘K` / `Ctrl K` | command palette (cmdk) |

- Một popup mỗi lúc (store kiểu luyenphongvan); deep link bằng `?panel=` để chia sẻ/hướng dẫn.
- Khi timer chạy và người dùng không thao tác 3 s, chỉ còn đồng hồ, thanh tiến độ, nút tạm dừng và tên việc.
- **Trang riêng chỉ giữ cho SEO/pháp lý:** `/phuong-phap-pomodoro` (bài hướng dẫn, VI/EN/JA), `/pricing`, `/bang-xep-hang` (công khai, SSR), `/u/[handle]` (hồ sơ công khai), `/privacy`, `/terms`. Các route cũ (`/timer`, `/tasks`, `/history`, `/settings`, `/entertainment`…) chuyển hướng 308 về `/?panel=…`.
- Phần dưới màn đầu của `/` (chỉ hiện với khách) là nội dung SSR: cách hoạt động, phương pháp, câu hỏi thường gặp — để Google index và người mới hiểu sản phẩm.

## 3. Phương pháp và người dùng mới

- Chế độ có sẵn: Pomodoro 25/5 (dài 15 sau 4 phiên), 50/10, 52/17, 90/20 (chu kỳ ultradian), tuỳ chỉnh. Mỗi chế độ có một dòng giải thích "dành cho ai".
- **Tour lần đầu** (3 bước, bỏ qua được): chọn mục tiêu → chọn không gian → bắt đầu phiên đầu tiên. Không bắt đăng ký trước phiên đầu.
- Màn trống luôn có hành động kế tiếp ("Thêm việc đầu tiên", "Bắt đầu phiên 25 phút").
- Bài `/phuong-phap-pomodoro`: giải thích phương pháp, nguồn gốc (Francesco Cirillo), khi nào nên dùng 52/17 hay 90 phút, cách chia việc, cách nghỉ đúng; kèm các câu hỏi thường gặp (JSON-LD `FAQPage`, `HowTo`).

## 4. Free và Pro

Nguyên tắc: **bản Free phải đủ dùng thật**, không giới hạn số phiên, không quảng cáo. Pro bán chiều sâu, thẩm mỹ, AI và phân tích — **không bán điểm**.

| Tính năng | Free | Pro |
|---|---|---|
| Timer, mọi chế độ, việc cần làm, phím tắt | ✓ không giới hạn | ✓ |
| Đồng bộ nhiều thiết bị (cần tài khoản) | ✓ | ✓ |
| Đồng hồ | 4 kiểu 2D + "Cà chua" 3D | Toàn bộ 3D (đồng hồ cát, orb thuỷ tinh, split-flap, …) |
| Không gian | 4 không gian | Toàn bộ + nền động (shader) + nền video |
| Âm thanh | Bộ âm thanh môi trường cơ bản (~12 âm), 2 preset | Toàn thư viện + nhạc tập trung + preset không giới hạn |
| Thống kê | 30 ngày, heatmap streak | Toàn bộ lịch sử, phân tích giờ học hiệu quả, báo cáo tuần, xuất CSV |
| Streak, freeze, huy chương, league, bạn bè | ✓ | ✓ (cùng luật, cùng điểm) |
| Trợ lý AI (VietAPI) | 10 lượt/ngày | 200 lượt/ngày + tổng kết ngày tự động |
| Đồ trang trí mở bằng huy chương/level | ✓ | ✓ + khung hồ sơ Pro |

**Giá đã chốt:** Pro tháng **39.000đ** · Pro năm **199.000đ** (~16.600đ/tháng) · Trọn đời **499.000đ**. Mốc tham chiếu: luyenphongvan 49.000đ/tháng, 299.000đ trọn đời; Flocus $9/tháng, $99 trọn đời. Thanh toán SePay (VietQR), kích hoạt tự động qua webhook; mọi quyền Pro kiểm tra ở server.

## 5. Hệ điểm, streak, huy chương, league

### 5.1 Điểm (XP) — chỉ từ phiên đã xác thực
- **1 XP cho mỗi phút tập trung đã xác thực** (chế độ Tập trung; thời gian tạm dừng và nghỉ không tính).
- **+5 XP** khi một phiên chạy đủ thời lượng đã đặt (khuyến khích hoàn thành).
- **+3 XP** khi đánh dấu xong một việc có ít nhất một phiên đã xác thực gắn với nó trong ngày (tránh bấm hoàn thành lấy điểm).
- **Trần theo ngày:** sau 240 phút đã xác thực trong ngày, XP còn 0,5/phút; quá 480 phút không cộng thêm (chống cày, nhắc nghỉ).
- Pro và Free nhận XP như nhau. Không bán XP, không bán freeze.

### 5.2 Ngày, streak, freeze
- Ngày học tính theo giờ Việt Nam, **ranh giới 04:00** (người học khuya không bị cắt đôi phiên).
- Một ngày "giữ streak" khi có **≥ 25 phút tập trung đã xác thực**.
- **Freeze:** nhận 1 khi đạt mỗi mốc 7 ngày liên tục, giữ tối đa 2, tự dùng khi lỡ một ngày; hiển thị bông tuyết trên lịch. Không mua được.

### 5.3 Level
- Tổng XP để lên level *n*: `100 × (n − 1)^1.5` (L2 = 100, L5 = 800, L10 = 2.700 ≈ 45 giờ, L20 ≈ 8.300, L50 ≈ 34.300).
- Level chỉ mở đồ trang trí, không khoá tính năng.

### 5.4 Huy chương — 10 họ × 4 bậc (Đồng/Bạc/Vàng/Kim cương)
| Họ | Ngưỡng 4 bậc |
|---|---|
| Giờ tập trung | 10 / 50 / 200 / 1000 giờ |
| Streak | 7 / 30 / 100 / 365 ngày |
| Phiên trọn vẹn | 10 / 100 / 500 / 2000 phiên |
| Phiên sâu (≥ 50 phút) | 5 / 25 / 100 / 300 |
| Dậy sớm (bắt đầu trước 7:00) | 5 / 20 / 50 / 150 |
| Đều đặn (tuần có ≥ 5 ngày học) | 1 / 4 / 12 / 52 tuần |
| Việc hoàn thành | 10 / 100 / 500 / 2000 |
| League (lần thăng hạng) | 1 / 5 / 15 / 40 |
| Bạn học (bạn được mời có streak ≥ 3) | 1 / 3 / 10 / 25 |
| Mùa thi (đạt mục tiêu tuần trong mùa thi đã đặt) | 1 / 3 / 6 / 12 tuần |

Huy chương tính từ dữ liệu đã xác thực, có hiệu ứng ăn mừng khi đạt (GSAP, tắt được, tôn trọng reduced-motion).

### 5.5 League tuần
- Tuần chạy từ thứ Hai 04:00 đến thứ Hai 04:00 (giờ VN). Chỉ người có ≥ 1 phiên đã xác thực trong tuần được xếp nhóm.
- Nhóm ~30 người cùng hạng, 10 hạng mang tên theo vòng đời quả cà chua (Hạt → Mầm → Lá non → Nụ → Hoa → Quả xanh → Ửng → Chín → Chín mọng → Vàng).
- Top 7 lên hạng, 5 cuối xuống hạng (trừ hạng thấp nhất); vừa lên hạng thì được bảo vệ một tuần.
- Bảng bạn bè (mời bằng mã/link) luôn có. Bảng toàn cầu chỉ ở `/bang-xep-hang`, chỉ hiện người **chọn công khai**.

### 5.6 Chống gian lận — server là nguồn sự thật
1. `POST /api/focus/start` → server trả **token ký HMAC** (giờ bắt đầu theo giờ server, thời lượng đặt). **Không ghi DB lúc đang chạy** — trạng thái phiên nằm trong token, server chỉ kiểm chữ ký.
2. Client gửi **beat mỗi ~60 s** (tab ẩn có thể giãn); server cộng thời gian theo khoảng cách giữa hai beat, mỗi khoảng tối đa 75 s (máy ngủ, mất mạng không được cộng) và trả token mới — vẫn không ghi DB.
3. `POST /api/focus/finish`: phút xác thực = `min(tổng đã cộng, thời gian thực theo giờ server, thời lượng đặt × 1,1)`; **một lần ghi DB** (unique theo id phiên → gửi lại không cộng hai lần); phiên chồng thời gian với phiên đã ghi bị từ chối. Không bao giờ dùng giờ của client.
4. XP ghi vào **sổ cái chỉ ghi thêm** (`xp_ledger`), khoá duy nhất theo `(nguồn, id nguồn, loại)` → gửi lại không cộng hai lần. Sửa sai bằng bút toán đảo, không xoá.
5. Giới hạn tần suất API; cờ bất thường (> 14 giờ/ngày, phiên chồng nhau) đưa vào hàng chờ xem xét, không tự trừ điểm.
6. Phiên offline/khách: vẫn ghi vào thống kê cá nhân với nhãn "chưa xác thực", **không** cộng XP hay xếp hạng. Khi đăng ký, lịch sử khách được nhập vào dưới dạng chưa xác thực.
7. Minh bạch: trang "Cách tính điểm" công khai công thức; mỗi phiên không được tính có lý do cụ thể ("Máy ngủ 12 phút nên chỉ tính 13/25 phút").
8. Không còn ghi DB từ trình duyệt: mọi truy cập DB qua route server có validate (zod).

## 6. Không gian, âm thanh, đồng hồ

- **Không gian (scene)** gói 4 thứ: nền, bộ âm thanh mặc định, kiểu đồng hồ, bộ màu. Ví dụ: "Thư viện mưa" (nền thư viện, mưa + lật trang, đồng hồ split-flap, màu gỗ ấm); "Đêm Đà Lạt" (nền shader sương, gió thông + dế, orb thuỷ tinh); "Quán cà phê Hà Nội" (nền video, tiếng quán, flip).
- **Âm thanh — tự làm toàn bộ bằng tổng hợp âm (procedural/generative):** mưa, gió, sóng, suối, lửa trại, dế, chim, tiếng ồn trắng/hồng/nâu, mưa mái tôn, tiếng gõ phím, đồng hồ tích tắc đều được sinh bằng Web Audio (AudioWorklet + bộ lọc + điều biến ngẫu nhiên) → không lặp, không file, không bản quyền, chạy offline. **Nhạc tập trung lofi tự sinh** (tiến trình hợp âm, trống, tiếng đĩa than) bằng Tone.js tải động. Chuông báo cũng tự tổng hợp. Mixer từng kênh, crossfade khi đổi scene, Media Session, tự giảm âm khi chuông báo. YouTube chỉ ở mini player hiển thị.
- **Đồng hồ:** 2D (số, kim, flip, vòng) và 3D: **Cà chua** (quả chín dần từ xanh sang đỏ theo tiến độ), **Đồng hồ cát** (hạt cát GPU instancing), **Orb thuỷ tinh** (chất lỏng dâng), **Split-flap** (bảng lật cơ học có âm thanh), **Hành tinh** (quỹ đạo theo phút). Mỗi kiểu là một chunk tải động; tự về 2D khi không có WebGL, máy yếu hoặc tiết kiệm pin; giữ 60 fps, tạm dừng render khi tab ẩn.

## 7. Mascot và trợ lý AI
- Mascot **sói** lấy từ thư viện có giấy phép thương mại (LottieFiles — Lottie Simple License, chọn bộ đồng phong cách với `wolf_cute`), nhiều trạng thái (theo cách Cú của luyenphongvan điều khiển trạng thái): chào, đang tập trung (cúi đọc sách), nghỉ (vươn vai), ăn mừng, buồn ngủ (khuya), lo lắng (streak sắp mất). Xuất hiện đúng lúc, không làm phiền khi đang tập trung.
- Trợ lý (VietAPI, port từ cv-app): chia việc lớn thành các phiên, gợi ý hoạt động khi nghỉ, tổng kết ngày (tuỳ chọn), động viên ngắn sau phiên. Quota theo gói, giữ lượt trước khi gọi và hoàn lại khi lỗi.

## 8. Roadmap

| # | Phase | Mục tiêu | Ước lượng | Phụ thuộc |
|---|---|---|---|---|
| 00 | [Nền móng & hợp nhất nhánh](phase-00-foundation-and-branch-merge.md) | Commit/merge, dọn code chết, gỡ tài sản nặng khỏi git | 1,5 ngày | quyết định commit |
| 01 | [Nâng cấp framework](phase-01-framework-upgrade.md) | Next 16, React 19, Tailwind v4, AI SDK 6; bật gate type/lint | 2 ngày | 00 |
| 02 | [Dữ liệu & đăng nhập](phase-02-data-and-auth.md) | Neon + Drizzle, Better Auth, chế độ khách + đồng bộ | 4 ngày | 01 |
| 03 | [App một trang](phase-03-one-page-app-shell.md) | `/` là app, dock, popup/sheet, ⌘K, redirect | 3 ngày | 01 |
| 04 | [Timer v2 & phiên xác thực](phase-04-timer-and-verified-sessions.md) | Phiên server, heartbeat, chế độ, thông báo | 3 ngày | 02, 03 |
| 05 | [Bộ đồng hồ 2D/3D](phase-05-clock-gallery-2d-3d.md) | 5 đồng hồ 3D + 2D, fallback, ngân sách hiệu năng | 5 ngày | 03 |
| 06 | [Âm thanh & không gian](phase-06-sound-and-scenes.md) | Engine âm thanh, thư viện có giấy phép, scene, nền động | 4 ngày | 03 |
| 07 | [Điểm, streak, huy chương, league](phase-07-points-streaks-medals-leagues.md) | Sổ cái XP, streak/freeze, huy chương, league, bạn bè | 5 ngày | 04 |
| 08 | [Free/Pro & thanh toán](phase-08-free-pro-and-payments.md) | Entitlement, SePay, trang giá, paywall mềm | 2,5 ngày | 02 |
| 09 | [Mascot & trợ lý AI](phase-09-mascot-and-ai-coach.md) | Sprite sói, trạng thái, trợ lý VietAPI, quota | 3 ngày + vẽ asset | 02, 08 |
| 10 | [Người dùng mới, nội dung & SEO](phase-10-onboarding-content-seo.md) | Tour, bài phương pháp, OG, sitemap, i18n | 3 ngày | 03 |
| 11 | [PWA, hiệu năng, QA & ra mắt](phase-11-pwa-performance-qa-launch.md) | Serwist, Lighthouse, soát toàn bộ, checklist | 3 ngày | tất cả |

Tổng ước lượng: **~39 ngày làm việc** (một người + AI). Âm thanh tự tổng hợp nên không tốn thời gian mua/chọn file; mascot lấy từ thư viện có sẵn. 05, 06, 08, 10 chạy song song được sau 03.

## 9. Quy trình cho mỗi tính năng
1. Research (đọc lại `research.md` + nguồn gốc nếu cần).
2. Spec ngắn trong file phase.
3. Làm.
4. Soát bằng harness (`~/Personal/pomodoro-ui-harness`) ở 1440 và 390, khi đăng nhập và khi là khách, dark và light.
5. Typecheck, test, build. Không commit/push khi chủ dự án chưa đồng ý.

## 10. Câu hỏi cần chủ dự án chốt
Đã chốt ngày 2026-10-01:
1. Làm chung một nhánh (commit feat/design-system, merge nhánh fix vào).
2. DB mới hoàn toàn: **Neon + Drizzle** (Supabase free tự tạm dừng sau 1 tuần không hoạt động, không có backup — nguyên nhân project cũ chết).
3. Giá 39.000đ/tháng · 199.000đ/năm · 499.000đ trọn đời.
4. VietAPI và SePay dùng chung với luyenphongvan.
5. Mascot sói lấy từ thư viện (LottieFiles).
6. Âm thanh tự làm hết (tổng hợp bằng code).
7. Resend + domain hiện tại: tuỳ, giữ nguyên.
8. Xoá hết thứ không cần thiết. Riêng xoá khỏi **lịch sử git** cần force-push → hỏi lại trước khi làm vì ảnh hưởng người cộng tác.
