---
phase: 08
title: "Free/Pro & thanh toán"
status: pending
estimate: 2.5 ngày
depends_on: 02
---

# Phase 08 — Free/Pro & thanh toán

## Mục tiêu
Phân tầng rõ (bảng ở `plan.md` §4), thanh toán SePay tự động, mọi quyền Pro kiểm tra ở server, paywall mềm.

## Các bước
1. Port từ cv-app: tạo đơn + mã đơn (tiền tố `SB`), QR VietQR, webhook SePay (một câu UPDATE idempotent + `sepay_reference` unique), cộng dồn hạn gói tháng/năm, VIEW `active_entitlements`, hook `useEntitlement`, kích hoạt tay khi webhook không bắn, email xác nhận.
2. `entitlements.ts`: danh sách quyền (`clock3d.all`, `scenes.all`, `sounds.library`, `stats.full`, `ai.quota.pro`, …) → kiểm tra ở API và ở UI.
3. Paywall mềm: thẻ Pro trong gallery có biểu tượng khoá nhỏ; bấm vào → xem trước 30 giây (đồng hồ/scene chạy thật) rồi gợi ý nâng cấp; không chặn timer.
4. `/pricing`: bảng so sánh, câu hỏi thường gặp, JSON-LD `Product`/`Offer`, ảnh OG riêng.
5. Popup thanh toán trong app (không rời trang): QR + số tiền + nội dung chuyển khoản, tự cập nhật khi webhook về (polling 5 s).

## Tiêu chí xong
- Test webhook: gửi trùng, sai số tiền, sai mã đơn, gói tháng cộng dồn.
- Gọi API Pro khi là Free → 403 với mã lỗi rõ ràng; UI hiển thị gợi ý nâng cấp.

## Rủi ro
- SePay không có chữ ký webhook → xác thực bằng API key header + đối chiếu số tiền/mã đơn (như cv-app).

## Đã chốt
- Giá: **39.000đ/tháng · 199.000đ/năm · 499.000đ trọn đời**.
- Dùng chung tài khoản SePay với luyenphongvan → mã đơn có tiền tố riêng (`SB`) để webhook phân biệt sản phẩm; kiểm tra SePay có cho nhiều webhook URL trên một tài khoản không, nếu không thì webhook của cv-app chuyển tiếp đơn `SB…` sang Study Bro.
