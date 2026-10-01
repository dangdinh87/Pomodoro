---
phase: 03
title: "App một trang"
status: pending
estimate: 3 ngày
depends_on: 01
---

# Phase 03 — App một trang

## Mục tiêu
`/` là app. Mọi thiết lập mở bằng dock → popup/sheet, hoặc `⌘K`. Không chuyển trang trong lúc dùng.

## Thiết kế
- **Sân khấu:** nền scene full màn, đồng hồ giữa, chip chế độ, nút chính, dòng việc đang làm.
- **Thanh trạng thái** (trên): logo, streak, vòng level, avatar. Mờ khi đang tập trung và không thao tác (`data-chrome`, đã có).
- **Dock** (dưới giữa; mobile thành thanh dưới 5 ô + "Thêm"): Việc, Âm thanh, Không gian, Đồng hồ, Thống kê.
- **Popup registry:** một store zustand giữ `activePanel`; mỗi panel khai báo `{ id, kind: 'sheet-left'|'sheet-right'|'dialog'|'gallery', hotkey, labelKey, Pro? }`. Đồng bộ với `?panel=` để deep link.
- **Command palette** (`cmdk`, đã có trong deps): mọi lệnh — đổi chế độ, mở panel, đổi scene, thêm việc, bật/tắt âm thanh.
- **Mobile:** sheet thành bottom sheet có kéo (vaul hoặc Radix Dialog tuỳ chỉnh), vùng bấm ≥ 44 px, safe-area.
- **Dark/light:** cả hai được thiết kế; mặc định theo hệ điều hành; nền scene tự thêm lớp phủ để chữ đọc được ở cả hai chế độ.

## Các bước
1. Tạo `src/features/app-shell/` (stage, status bar, dock, panel host, command palette) và `src/features/panels/*` (tasks, sound, scenes, clocks, stats, settings, account).
2. Chuyển nội dung các trang cũ (tasks, history, settings, entertainment) thành panel; route cũ → 308 về `/?panel=…`.
3. Nội dung SSR dưới màn đầu cho khách (cách hoạt động, phương pháp, FAQ) — nối với phase 10.
4. Phím tắt: Space (bắt đầu/tạm dừng), R (đặt lại), T/S/B/C/H (mở panel), `⌘K`, `?` (bảng phím tắt).
5. Bỏ khung top bar/tab bar của bản trước (giữ lại component dùng được).

## Tiêu chí xong
- Từ `/` làm được mọi việc mà không đổi URL path; Back của trình duyệt đóng panel.
- Soát harness mọi panel ở 390/768/1440, dark và light, bàn phím (focus trap, Esc).

## Rủi ro
- Một trang quá tải → giới hạn mỗi lúc một panel, panel tải động (code split).
- SEO của route cũ → giữ redirect 308 và sitemap mới.
