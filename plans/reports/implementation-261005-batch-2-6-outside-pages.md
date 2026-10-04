# Batch 2.6 — Trang ngoài app theo Sticker pop + `docs/design-system.md` (spec §7.5)

Ngày 2026-10-05, nhánh `feat/design-system`. Xong 5 task, 3 commit code/docs + 1 commit báo cáo. `pnpm type-check` sạch, `pnpm lint` 0 lỗi (73 warning cũ), `pnpm i18n:check` OK (1353 khoá), `pnpm test`: chỉ còn 5 ca lỗi ở `src/lib/weather/weather-mood.test.ts` (weather WIP, bỏ qua theo yêu cầu). Lần chạy đầu có thêm vài ca `timer-settings.test.tsx` đỏ do batch 2.4b đang sửa dở; chạy lại thì hết. Không chạy `pnpm build`. Ổ đĩa còn 8.8 GB.

## Commit

| Hash | Nội dung |
|---|---|
| `7695916` | Landing (`FeaturesSSR`, `HowItWorks`, `FAQ`, `Footer`, `site-header`), `doc-layout`, `legal-page`, `(landing)/layout.tsx`, trang hướng dẫn, 12 ca test mới, khoá locale `guide2.updated` + `guide2.sources.*` (3 ngôn ngữ, chỉ stage hunk của mình) |
| `3d0da2e` | `not-found.tsx` (theo theme), `global-error.tsx` (tự đủ), `route-error.tsx`, `login-form.tsx`, test 404 và `RouteError` |
| `409cbb7` | `docs/design-system.md` viết lại (273 dòng) |

## Từng task

1. **Landing dưới màn đầu.** Mọi khối vẫn là server component, JSON-LD không đụng (`page.tsx` nguyên, FAQ dùng chung `getFaqItems`).
   - `FeaturesSSR`: 7 `StickerCard` nghiêng xen kẽ (`tilt-l`/`tilt-r`), `IconTile` cỡ lg theo màu **dock** (đồng hồ mint, việc butter, thống kê tomato, âm thanh sky, không gian lilac, arcade peach, tài khoản surface), Tomo `happy` cạnh tiêu đề (ẩn dưới 640px để nhường chỗ). Lưới 4 cột, thẻ đầu chiếm 2 cột như cũ.
   - `HowItWorks`: thanh chu kỳ viền sticker tô theo chế độ timer (tomato, mint, sky), chữ `text-on-accent` (hết `text-white` và hex cứng), 3 thẻ chế độ nghiêng xen kẽ có `IconTile` (Timer, Coffee, Armchair) và pill thời lượng; đoạn "Vì sao hiệu quả" giữ 68ch. Đoạn 5 phút có `min-w` để nhãn không tràn ở 390px.
   - `FAQ`: Tomo `happy`, mỗi câu hỏi là một ô `.sticker-sm` (vẫn `<details>` gốc, không JS, câu trả lời luôn nằm trong HTML), nút mở là chấm butter đổi sang mint khi mở, vòng focus `.focus-ring`.
   - `Footer`: viền trên `--outline-w` trên nền `surface-raised`, tiêu đề cột Baloo thường (bỏ chữ hoa `ink-faint` khó đọc, nhất là dấu tiếng Việt), liên kết gạch chân khi hover. `site-header`: viền dưới sticker, liên kết dạng pill.
   - Thứ bậc heading: trên `/` chỉ H2/H3 (curl: đúng 1 `<h1>`, 8 `<details>`, câu hỏi và trả lời đầy đủ trong HTML). Không còn nhắc chat, bảng xếp hạng, AI coach, Spotify (test chặn).
2. **Hướng dẫn, quyền riêng tư, điều khoản.** `DocLayout` làm lại: đầu trang (H1 `text-balance`, đoạn dẫn `text-pretty`), pill "Cập nhật lần cuối" là `<time dateTime>`, mục lục dạng chip có số tròn màu kẹo (một hàng cuộn ngang ở điện thoại vì 9 chip xếp dọc chiếm gần hết màn hình, bọc từ `sm` trở lên), toàn bộ nội dung nằm trên một thẻ `.sticker-lg`. Độ rộng đọc `68ch`, tiếng Nhật `42em` (qua `:lang(ja)`), cao dòng 1.75 (JA 1.95) để dấu tiếng Việt và chữ Nhật không dính dòng. Bảng nhịp và phím tắt thành khung `border-sticker`, tiêu đề cột Baloo.
   - Trang hướng dẫn thêm **ngày cập nhật** (05/10/2026) và mục 9 **Nguồn tham khảo** (Cirillo 2018; DeskTime 2014, ghi rõ là phân tích nội bộ của một công ty, không phải nghiên cứu đối chứng), đủ VI/EN/JA. Không bịa tựa bài DeskTime hay đường dẫn. Trang pháp lý có `<time dateTime="2026-10-02">`.
3. **404, lỗi, đăng nhập.**
   - `not-found.tsx`: thẻ sticker-lg nghiêng trái, Tomo `sleepy` có `title`, pill 404 butter, đúng một nút chính. **Theo theme**: tự bọc `ThemeProvider` của `next-themes` (cùng `attribute`/`defaultTheme`/`storageKey` với app), nên chọn Tối thì 404 tối ngay lúc tải (không nháy). Đã kiểm trên trình duyệt: `data-theme="dark"` khi `localStorage.theme=dark`. Bỏ `bg-surface-page` để hoạ tiết giấy hiện.
   - `RouteError` (dùng cho `(main)/error.tsx` và `(landing)/error.tsx`): Tomo `worried`, thẻ thẳng `role="alert"`, "Thử lại" là nút chính, "Về đồng hồ/trang chủ" là nút phụ.
   - `global-error.tsx`: vẫn có `<html>`/`<body>` riêng và copy 3 ngôn ngữ riêng, nhưng giờ **không phụ thuộc Tailwind hay `globals.css`**: một khối CSS thuần (chép token), Tomo `worried` (khai các biến `--candy-*`/`--outline`/`--on-accent` ngay trong khối đó), font hệ thống, theme đọc từ `localStorage.theme` sau khi mount (mặc định sáng, `system` theo `prefers-color-scheme`). Đã kiểm bằng cách render ra HTML tĩnh và mở bằng `file://` (không có CSS nào của app): đọc rõ ở sáng và tối.
   - `LoginForm`: thẻ sticker, Tomo `happy` thay logo (chuyển `worried` khi có lỗi), nút gửi mã/đăng nhập cỡ lg, Google là nút phụ, thông báo lỗi là ô viền `danger`. **Không có trang đăng nhập riêng**: đăng nhập là panel `login` trong `panel-host.tsx` (của 2.4a).
4. **`docs/design-system.md`** 273 dòng, tiếng Việt: nguyên tắc, token sáng/tối (bảng), `--control-edge` và lý do (WCAG 1.4.11, 1.3:1 so với 3.5:1), 6 bộ màu và ràng buộc tương phản, tone, hình khối + utility, ánh xạ class Tailwind (có cảnh báo `text-accent` ≠ primary), chữ (Baloo/Nunito, quy tắc VI/JA), icon + `IconTile`, chuyển động + reduced motion, bảng primitive, Tomo + bảng `pickTomoMood`, trang ngoài app, dark mode, quy tắc viết VI/EN/JA kèm bảng thuật ngữ 1D, nên/không nên, danh sách việc còn nợ. Đối chiếu với báo cáo 1D, 2.1, 2.2, 2.3a, 2.3b và `pick-tomo-mood.ts` hiện tại; các batch 2.4/2.5 chưa có báo cáo nên chỉ ghi phần đã thấy trong code.
5. **Test** (đều pass): `landing-ssr.test.tsx` (FAQ, features, how-it-works render qua `renderToString` ở **en/vi/ja**: đủ 8 câu hỏi và trả lời trong HTML, 8 `<details>`, khớp `getFaqItems`, 1 H2 và 0 H1, thẻ nghiêng xen kẽ 4/3, không còn từ khoá tính năng đã gỡ), `not-found.test.tsx` (Tomo `sleepy` có title truy cập được, 1 H1, liên kết về `/`, **theo theme**: `localStorage.theme=dark` → `data-theme="dark"`, mặc định sáng), `route-error.test.tsx` (Tomo `worried`, retry gọi `reset`, digest), `doc-layout.test.tsx` (1 H1, chip khớp mục, `<time>`, slot `after`).

## Ảnh kiểm (`plans/reports/assets-261005-relaunch/`, không commit)

Chrome DevTools MCP, context `relaunch-2-6`, 390×844×2 (mobile, touch) và 1440×900. Đã đo: không tràn ngang (`scrollWidth` 390 ở `/guide` và `/`), `/guide` và `/` mỗi trang đúng 1 `<h1>`, 404 trả 404 + `noindex`.

- `2-6-guide-1440-light`, `2-6-guide-390-light`, `2-6-guide-1440-dark-ja`
- `2-6-home-features-1440-light`, `2-6-home-how-1440-light`, `2-6-home-faq-1440-light`, `2-6-home-features-1440-dark-vi`, `2-6-home-features-390-dark-vi`
- `2-6-privacy-1440-dark-vi`
- `2-6-404-1440-light`, `2-6-404-1440-dark`, `2-6-404-390-dark-vi`
- `2-6-login-390-light`, `2-6-error-390-light` (qua trang xem tạm, đã xoá), `2-6-global-error-390-light`, `2-6-global-error-1440-dark`

Chưa có ảnh: `/terms` (cùng `LegalPage` với `/privacy`), đăng nhập ở dark, 404 tiếng Nhật, `global-error` tiếng Việt/Nhật (copy đã có test sẵn từ trước).

## Quyết định và phát hiện

- **Phosphor: không dùng bí danh `*Icon`.** Lúc đầu tôi đổi sang `ArmchairIcon` v.v. (tên cũ bị đánh dấu deprecated) thì Turbopack báo "Can't resolve …/ssr/ArmchairIcon", vì `next.config.ts` có `modularizeImports` ánh xạ tên import sang tên file. `tsc` không bắt được. Đã trả về tên cũ ở mọi file, và ghi vào design-system mục 5.
- **Đăng nhập: thẻ bị cắt viền.** `DialogPanel id="login"` (trong `panel-host.tsx`, của 2.4a) có `overflow-y-auto`, làm mất viền trên/trái và bóng của thẻ đặt sát mép (đã chứng minh: đổi `overflow: visible` bằng DevTools thì hết). Cách xử lý trong phạm vi của tôi: thẻ `m-1.5`. Gỡ `overflow-y-auto` ở panel-host (hoặc thêm `overflow-visible` cho panel login) thì bỏ được `m-1.5`.
- `error.tsx` giữ prop `reset` (Next 16.3 truyền cả `reset` và `retry`; doc khuyên `retry()` vì tải lại dữ liệu server). Để nguyên hành vi vì ngoài phạm vi; ghi ở follow-up.
- Mục lục dạng chip làm mất mục lục **sticky** ở desktop (cột trái cũ). Đổi lấy đúng yêu cầu "chip" và đọc ở 390px; bù lại các mục có `scroll-mt-24`.
- Thẻ 404 nghiêng (trang trí) còn thẻ lỗi thì thẳng.
- `faq-accordion.tsx` không còn trong repo (FAQ đã là `<details>` gốc), nên không có client wrapper nào cho FAQ.

## File bỏ qua (không phải của tôi)

`src/app/(main)/page.tsx` và `src/features/app-shell/**` (2.4a, kể cả `panel-host.tsx`, `app-home.tsx`), `src/app/layout.tsx` (metadata root), `globals.css` (không cần sửa), `src/features/mascot/**` (2.4b), file locale chỉ stage hunk `guide2.updated`/`guide2.sources`.

## Follow-up

Cho 2.4a / người điều phối:
1. `(main)/page.tsx`: khối landing đang `bg-surface-page` đặc nên **mất hoạ tiết giấy** và thấy rõ một đường nối so với phần app phía trên (ảnh `2-6-home-features-*`). Đổi sang `bg-transparent`, hoặc `paper-bg` cho cả khối.
2. **Dock cố định đè lên nội dung landing** khi cuộn xuống (các ảnh `2-6-home-*`): cần ẩn dock ở vùng landing, hoặc chừa `padding-bottom` cho khối này.
3. `panel-host.tsx` `DialogPanel id="login"`: `overflow-y-auto` cắt viền, xem ở trên.
4. Tiêu đề tab của 404 và trang lỗi là "Study Bro App" (metadata root `app/layout.tsx`).

Cho phase 3 (chuyển trang ngoài app xuống `src/app/[lang]`):
5. Ngôn ngữ hiện lấy từ cookie `app.lang` (`getT()`, `InitialLangProvider`). Khi có `[lang]` trong URL thì `(landing)/layout.tsx`, `not-found.tsx` (root không có `params`; cân nhắc `global-not-found` đang experimental hoặc `not-found` theo từng `[lang]`) và `buildPageMetadata` (canonical, hreflang, `og:locale`) cần đọc `params.lang`. `global-error` không có `params`, giữ cách cookie + `navigator.language`.
6. Ngày cập nhật đang là chuỗi riêng từng ngôn ngữ (`guide2.updated`, `legal.updated`) + `dateTime` hằng trong code. Khi có nhiều bản nên đưa ngày ISO vào một nơi (config) và format bằng `Intl.DateTimeFormat`; cân nhắc thêm `dateModified` vào JSON-LD của trang hướng dẫn (hiện giữ nguyên theo yêu cầu).
7. Trang ngoài app không chạy `ThemeRestorer` nên **bộ màu người dùng chọn (Bạc hà, Bơ…) và font không áp dụng** ở landing, hướng dẫn, 404. Nên gom thành một `OutsideProviders` dùng chung (theme + restorer + i18n) khi dựng `[lang]`.
8. `retry` thay `reset` cho `error.tsx` (thử lại có tải lại dữ liệu server), cần test tay.
9. Ảnh OG đa ngôn ngữ cần font tiếng Nhật (ghi sẵn ở 2.2).
10. Mục "Việc còn nợ" ở cuối `docs/design-system.md` liệt kê tooltip/button của animate-ui chưa theo sticker, hoạ tiết cà chua giống giọt nước, dark mode bóng mờ; cập nhật khi các mục đó xong.

## Câu hỏi còn mở

- Mục lục có cần sticky trở lại ở desktop (cột trái hẹp, chip xếp dọc) không, hay chip ngang như hiện tại là đủ?
- Ngày "Cập nhật lần cuối" của trang hướng dẫn đặt 05/10/2026 (ngày thêm nguồn tham khảo). Chủ dự án muốn đặt ngày khác thì đổi 3 khoá `guide2.updated` và `metaDateTime` trong `guide/page.tsx`.
