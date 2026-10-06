---
phase: 11
title: "PWA, hiệu năng, QA & ra mắt"
status: pending
estimate: 3 ngày
depends_on: tất cả phase trước
---

# Phase 11 — PWA, hiệu năng, QA & ra mắt

## Các bước
1. **PWA (Serwist):** cài được trên Android/desktop/iOS, timer + scene đã dùng chạy offline, thông báo hết phiên (iOS chỉ khi đã cài app), safe-area.
2. **Hiệu năng:** ngân sách first load `/` ≤ 200 kB JS (3D, mixer, panel tải động); Lighthouse mobile ≥ 90 cho Performance/Accessibility/SEO; đo trên máy Android tầm trung.
3. **Soát toàn bộ bằng harness:** mọi panel và trạng thái (khách, đăng nhập, Free, Pro, rỗng, lỗi, đang chạy, nghỉ, hết quota AI) ở 390/768/1440, dark và light; kịch bản phím tắt.
4. **Accessibility:** focus trap trong panel, Esc đóng, nhãn ARIA, tương phản AA ở mọi scene (lớp phủ tự động), `role="timer"`, thông báo giọng đọc khi hết phiên.
5. **Tải:** giả lập 1.000 phiên đồng thời gửi heartbeat → API và DB đáp ứng; làm mới materialized view không khoá bảng.
6. **Theo dõi:** Vercel Analytics + sự kiện chính (bắt đầu phiên, hoàn thành, đổi scene, nâng cấp), log lỗi; bảng cảnh báo chi phí AI.
7. **Checklist ra mắt:** env prod, migration, seed scene/âm thanh, cron, webhook SePay, trang pháp lý, ảnh OG, sitemap gửi Search Console.

## Tiêu chí xong
- Toàn bộ checklist xanh; không lỗi console ở các luồng chính; build không bỏ qua lỗi.
