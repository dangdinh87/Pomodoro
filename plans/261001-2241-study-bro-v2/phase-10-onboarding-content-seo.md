---
phase: 10
title: "Người dùng mới, nội dung & SEO"
status: pending
estimate: 3 ngày
depends_on: 03
---

# Phase 10 — Người dùng mới, nội dung & SEO

## Mục tiêu
Người mới hiểu sản phẩm trong 30 giây và chạy được phiên đầu; Google hiểu và xếp hạng được các trang có giá trị.

## Người dùng mới
- Tour 3 bước, bỏ qua được: chọn mục tiêu (học thi / làm việc / đọc sách) → chọn không gian → bắt đầu phiên 25 phút. Mascot dẫn đường.
- Màn trống có hành động kế tiếp; tooltip phím tắt lần đầu.
- Đăng ký chỉ gợi ý sau phiên đầu tiên ("Lưu tiến độ và vào league tuần này").

## Nội dung
- `/phuong-phap-pomodoro` (VI) + bản EN/JA: phương pháp, nguồn gốc, biến thể 52/17 và 90 phút, cách chia việc, cách nghỉ, câu hỏi thường gặp. Viết thật, có nguồn, không bịa số liệu.
- Trang "Cách tính điểm" (minh bạch luật thưởng).
- `/pricing`, `/bang-xep-hang`, `/u/[handle]`, pháp lý.

## SEO
- Metadata đầy đủ; **ảnh OG riêng cho từng trang** (port `renderOgCard`; trang con khai `openGraph` phải có ảnh riêng); thẻ chia sẻ kết quả tuần.
- JSON-LD: `WebApplication` (`/`), `HowTo` + `FAQPage` (bài phương pháp), `Product`/`Offer` (`/pricing`).
- `sitemap.ts`, `robots.ts`, hreflang VI/EN/JA (đường dẫn `/en/…`, `/ja/…` cho trang nội dung; app giữ một đường dẫn).
- Core Web Vitals: LCP < 2,5 s (đồng hồ 2D render ngay, 3D tải sau), CLS < 0,1, INP < 200 ms.

## Câu chữ
- Rà toàn bộ VI/EN/JA: viết hoa đầu câu, xưng "bạn", nhãn nút = động từ + đối tượng, không bịa con số/cam kết; xoá chữ quảng cáo tính năng không còn (Spotify, chat).

## Câu hỏi
- Domain chính vẫn là `pomodoro-focus.site`? Có muốn đổi tên miền theo thương hiệu Study Bro không?
