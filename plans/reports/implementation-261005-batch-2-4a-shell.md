# Batch 2.4a: Khung app Sticker pop (spec §7.1, §7.2 phần khung; SEO P1-2, tech P1-3)

Ngày 2026-10-05, nhánh `feat/design-system`. Xong 7 task + 3 việc bổ sung của điều phối (nhãn tab, nền khối nội dung dưới app, dock không đè nội dung). `pnpm type-check` sạch, `pnpm lint` 0 lỗi (73 warning cũ), `pnpm i18n:check` OK (1353 khoá), `pnpm test` 121/122 file (1139/1144 test). 5 test fail đều là `src/lib/weather/weather-mood.test.ts` (weather WIP), không đụng.

## Commit

| Hash | Nội dung |
|---|---|
| `27f1ba0` | Thanh trên, dock, khay tab mobile, ⌘K đủ lệnh, hộp thoại phím tắt `?`, menu người dùng, khoá locale (3 ngôn ngữ, chỉ stage 2 hunk của mình) |
| `388e4b7` | H1 SSR, skeleton 25:00 trong HTML, khối FAQ/Footer dùng giấy kem |
| `4946c22` | Dock ghim ở đáy khi còn thấy timer, cuộn đi cùng timer |

## Từng việc

1. **Thanh trên** (`app-status-bar.tsx`): Logo 28; `StreakPill` thật (số liệu `useStats`, bấm mở Stats; ẩn khi chuỗi = 0 hoặc chưa có session); pill "N phiên hôm nay" (cùng query `studyTodayDate()` với `DailyProgress` nên chung cache, số ít/nhiều bằng 2 khoá `sessionsTodayOne`/`sessionsToday`); pill ⌘K đọc `⌘K` trên Mac, `Ctrl K` chỗ khác (`platform.ts`); nút cài đặt; avatar (UserMenu). Dưới 640px: pill phiên chỉ còn tomato + số, nút cài đặt ẩn (có trong menu avatar) để vừa 360px. `data-chrome` giữ nguyên.
2. **Dock** (`app-dock.tsx`): ô 52px dùng `IconTile` (Việc butter, Âm thanh sky, Không gian lilac, Hẹn giờ mint, Thống kê tomato, Arcade peach, Toàn màn hình surface; màu nằm ở `panel-registry.ts` để palette và menu dùng chung). Tooltip là `ui/tooltip.tsx` (nền ink). Đang mở: ô lún vào bóng + chấm dưới ô + `aria-pressed`. Focus: vòng 3px `--accent` (đo: `solid 3px rgb(194,51,15)`). Đang phát nhạc: chấm tomato ở góc ô Âm thanh, icon vẫn là AudioLines/YouTube động. Giữ đồng bộ fullscreen (`fullscreenchange`), ẩn ô panel khi focus mode, error boundary ở `panel-loaders` không đụng.
3. **Mobile < 768px**: khay sticker `inset-x-1.5` ở đáy, nhãn dưới icon, `env(safe-area-inset-bottom)`. Đo thực: không tràn ngang ở 360 và 390 (`scrollWidth` = viewport), khay cao 90px, cách đáy thẻ timer 21px (360×740) và 73px (390×844). Nút Toàn màn hình chỉ hiện khi trình duyệt có Fullscreen API (iPhone không có, tránh nút chết); dùng chung ở palette.
4. **⌘K** (`command-palette.tsx`): `top-[14%] max-w-xl`, bỏ `overlayClassName="bg-black/40"` (dùng scrim token), mỗi lệnh có `IconTile` sm. Thêm nhóm "Thao tác nhanh": Thêm việc, Đổi scene, Tắt/Bật tiếng, Toàn màn hình; thêm Bỏ qua phiên (nhóm Hẹn giờ) và Phím tắt (nhóm Mở). **Phím tắt `?`** (`shortcut-help.tsx`): hộp thoại liệt kê Space, R, T, S, B, C, H, G, ⌘K/Ctrl K, ?; dùng chung `shouldIgnoreShortcut` nên không bật khi đang gõ hay đang có dialog.
5. **SSR H1 + LCP**: `page.tsx` render `<h1 class="sr-only">` từ `shell.homeHeading` (EN "Free Pomodoro timer online", VI "Đồng hồ Pomodoro online miễn phí", JA "無料ポモドーロタイマー"). Placeholder `ssr:false` là `app-home-skeleton.tsx` (server-safe): thẻ sticker, Tomo, chip, "25:00" chữ thật, thanh tiến độ, nút. Next render `loading` của `dynamic` ssr:false vào HTML (đã đọc `01-app/02-guides/lazy-loading.md`; `ssr:false` vẫn nằm trong Client Component). Đã gỡ `data-theme="dark"` cứng ở placeholder.
6. Giữ: `?panel=`, Back/Esc, dim chrome, fullscreen sync, panel error boundary (không sửa file nào liên quan).
7. **Bổ sung từ điều phối**: (a) nhãn tab không bẻ giữa từ: `[overflow-wrap:normal] [word-break:keep-all]`, khay `p-1`, nút bỏ padding ngang → cột 48px ở 360px; khoá riêng `shell.fullscreenShort` (EN "Full screen", VI "Phóng to", JA "全画面"); (b) khối FAQ/Footer đổi `bg-surface-page` thành `paper-bg bg-(--stage-tint)` (cùng giấy và hoạ tiết như body, vẫn đặc để scene phía sau không lọt qua chữ); (c) dock không đè nội dung dưới (xem Quyết định).

## Đo và kiểm (Chrome DevTools, context `relaunch-2-4a`)

- `curl /`: đúng 1 `<h1 class="sr-only">`, có `25:00`; cookie `app.lang=vi|ja` ra H1 tương ứng.
- **Khung skeleton so với app thật** (card x,y,rộng×cao; chữ số): 1440×789 thật `440,64 560×639`, chữ 160px, `y=247`; skeleton `440,64 560×640`, chữ 160px, `y=247`. 390×844 thật `y=135 358×543`, chữ 105.3px, `y=320`; skeleton `y=134 358×543`, chữ 105.3px, `y=320`.
- **CLS = 0** trên `/` thật: 1440×789 (dev) và 390×844 với CPU 4x; phần tử LCP là `div "25:00"` (644 ms và 836 ms, số dev chỉ để tham khảo).
- **Dock không bị cắt**: 1366×768 dock `y 700-752`, 1366×657 dock `y 589-641`, 1440×789 `y 721-773`; đều nằm trong viewport. Cuộn tới FAQ và footer ở 1440×789 và 390×844: dock/khay nằm trong section timer và rời đi cùng nó (không bao giờ ở trên FAQ/footer).
- **Nhãn tab** đo tràn ngang/cắt dòng cho cả 7 tab: EN 360+390, VI 360+390, JA 360 (390 rộng hơn): không tràn, không bị cắt.
- Chức năng thật: ⌘K → "Add a task" mở Tasks và focus ô nhập; "Skip session" chuyển Focus sang Short break; `?` mở hộp thoại.
- Reduced motion: MCP không emulate được; dựa vào khối CSS toàn cục (`transition-duration: .01ms`), `useReducedMotion` ở icon âm thanh, skeleton `.skeleton::after` tắt sẵn.
- Ảnh (không commit) `plans/reports/assets-261005-relaunch/2-4a-*.png`: `before-1366x657-light`, `home-1366x657-light`, `home-1366x657-scrolled-light`, `home-1366x768-panel-light`, `home-1440x789-light`, `dock-tooltip-1440-light`, `dock-focus-1440-light`, `palette-1440-{light,dark}`, `shortcuts-1440-light`, `skeleton-1440-light`, `home-390-light`, `home-360-dark`, `home-360-vi-light`, `tabbar-360-{vi,ja}-light`, `tabbar-390-en-light`, `faq-1440-light`, `footer-390-light`.

## Quyết định (chọn phương án đơn giản, đúng spec)

- **Dock "fixed" thành khung sticky**: `fixed` thuần sẽ đè FAQ/footer khi cuộn. Dùng khung `absolute inset-0` phủ section timer, trong đó hộp `sticky top-0 h-dvh` chứa nav ở đáy. Còn thấy timer thì dock ghim ở đáy màn hình (màn thấp không bị đẩy xuống dưới nếp gấp), hết section thì trôi đi cùng. Không cần JS/IntersectionObserver và không để lại nút ẩn mà vẫn focus được. Không sửa `app-home.tsx` (section của nó đã `relative`).
- **Bỏ qua phiên** trong palette bấm chính nút Skip của `TimerControls` (tìm theo `aria-label` = `timer.controls.skip_hint`), để giữ hộp xác nhận và luật ghi phần dở; không nhân đôi logic. Hạn chế: phụ thuộc nhãn đó (có test).
- **Thêm việc** mở panel Tasks rồi focus ô thêm nhanh (tìm theo `tasksUi.quickAddLabel`, chờ panel lazy mount, tối đa 3 giây). **Đổi scene** mở panel Scene (chuyển ngẫu nhiên scene là việc của 2.5b/weather, YAGNI).
- Pill phiên/chuỗi ẩn khi chưa có session (khách chưa đăng nhập chưa có dữ liệu); chuỗi 0 thì ẩn, số phiên 0 vẫn hiện.
- H1 là `sr-only`: thẻ timer là thứ đầu tiên người dùng thấy; SEO audit chấp nhận tối thiểu là sr-only.
- Khay mobile là khay nổi (có viền + bóng), không phải thanh dính mép, để cùng ngôn ngữ sticker.

## File bỏ qua / không sửa

- `src/features/app-shell/app-home.tsx`: có dòng `useWeatherSync` chưa commit của phiên weather. Vẫn còn `data-theme="dark"` cứng ở đó (vô hại nhờ selector gốc `:root[data-theme='dark']`); gỡ khi weather commit xong.
- `panel-host.tsx`, `panel-loaders.tsx`, `use-panel-hotkeys.ts`, `panel-store.ts`: không cần đổi (tiêu đề sheet nằm ở panel của 2.5a/2.5b).
- `src/features/timer/**`, panel Việc/Âm thanh/Scene: không đụng.
- Dev server: có lúc 500 vì `FeaturesSSR`/`HowItWorks` của batch 2.6 đang sửa dở (import `*Icon` không tồn tại). Tôi dựng trang tạm `src/app/dev/shell-tmp` để đo và đã xoá, chưa từng stage.

## Follow-up

1. **Phase 3 (H1/metadata theo ngôn ngữ)**: H1 mới chỉ có tiêu đề; chưa có câu mô tả 1–2 dòng (audit P1-2). `metadata` ở `page.tsx` vẫn là EN tĩnh, chưa có hreflang/canonical theo ngôn ngữ. `shell.homeHeading` là nơi sửa chữ H1.
2. **Re-đo skeleton nếu `EnhancedTimer` đổi bố cục** (khối: hàng bong bóng 72px, chip 60px, đồng hồ+tiến độ+cà chua 238px ở 1440, nút+gợi ý phím+chọn việc 157px). Công thức: so `getBoundingClientRect` của thẻ và `[role=timer]` với skeleton ở 390 và 1440.
3. **Màn rất thấp**: thẻ timer cao ~640px, ở 1366×657 thẻ che dock ở khung nhìn đầu (cuộn 143px mới thấy hết). Dock không còn bị cắt, nhưng nên cho 2.4b co chữ số/khoảng cách theo `dvh` (ví dụ `min(27vw, 160px, 22dvh)`).
4. **Khay mobile ở PWA standalone** (safe-area ~34px): khay cao ~124px so với `pb-24` (96px) của section; nếu thấy chạm đáy thẻ, nâng `pb` ở `app-home.tsx` sau khi weather commit.
5. `requestTimerSkip()` kiểu `requestTimerReset` (store) thay cho tìm nút theo nhãn, khi 2.4b rảnh sửa `timer-controls.tsx`.
6. Dark mode: bóng ô dock đen trên nền nâu đậm mờ (đúng spec §3.2, cùng nhận xét ở 2.3b); ô surface của dock đọc ổn nhờ icon `text-ink`.

## Câu hỏi còn mở

- H1 sr-only đủ hay muốn một dòng H1 hiển thị (ví dụ dưới thẻ timer)? Cần quyết định trước phase 3.
