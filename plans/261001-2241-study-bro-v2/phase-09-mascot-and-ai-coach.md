---
phase: 09
title: "Mascot & trợ lý AI"
status: pending
estimate: 3 ngày
depends_on: 02, 08
---

# Phase 09 — Mascot & trợ lý AI

## Mục tiêu
Sói Study Bro có cá tính, xuất hiện đúng lúc, và một trợ lý AI tiếng Việt giúp chia việc và tổng kết ngày — chi phí trong tầm kiểm soát.

## Mascot
- Nguồn: thư viện sói có giấy phép thương mại — LottieFiles (Lottie Simple License: dùng thương mại, sửa, không cần ghi công). Chọn một bộ đồng phong cách với `wolf_cute` hiện có; lưu giấy phép từng file vào `mascot-manifest.json`. Render bằng `@lottiefiles/dotlottie-react` (hỗ trợ state machine), tải động.
- Cách điều khiển trạng thái theo mẫu `page-mascot.tsx` của luyenphongvan (một component, đổi trạng thái theo sự kiện; reduced-motion → khung tĩnh).
- Bộ biểu cảm: chào, tập trung (cúi đọc), nghỉ (vươn vai), ăn mừng, buồn ngủ (23:00–04:59), lo (streak sắp mất), bất ngờ (đạt huy chương), nói chuyện (khi trợ lý trả lời).
- Máy trạng thái gắn với sự kiện timer: khi đang tập trung, mascot thu nhỏ ở góc và không nói; khi nghỉ, gợi ý một hoạt động ngắn.
- Nếu thư viện không đủ biểu cảm cùng phong cách: ghép nhiều hoạt hình cùng tác giả, hoặc dùng `wolf_cute` làm khung tĩnh cho trạng thái thiếu.

## Trợ lý (VietAPI)
- Port client của cv-app: `@ai-sdk/openai-compatible`, chuỗi model dự phòng (chờ byte đầu 15 s), lọc ký tự Hán/Thái trên stream, `after(consumeStream)` + `consumeSseStream`.
- Tác vụ: (1) chia một việc lớn thành các phiên có ước lượng; (2) gợi ý khi nghỉ; (3) tổng kết ngày từ dữ liệu đã xác thực; (4) hỏi đáp ngắn về phương pháp.
- Quota trong `ai_usage`: Free 10 lượt/ngày, Pro 200; giữ lượt trước khi gọi, hoàn khi lỗi; giới hạn token đầu ra; ghi log để theo dõi chi phí.
- **Không bao giờ** chạy kiểm tra model hàng loạt (`check-models --all`); chỉ đo model rẻ khi cần.
- Giọng: thân thiện, ngắn, xưng "bạn", tối đa 1 emoji mỗi câu trả lời, không bịa số liệu học tập.

## Tiêu chí xong
- Trợ lý trả lời tiếng Việt đúng ngữ cảnh việc của người dùng; hết quota hiển thị thông báo rõ.
- Mascot không xuất hiện khi đang tập trung, trừ khi người dùng bấm vào.

## Đã chốt
- VietAPI dùng chung key/ví với luyenphongvan → ghi `app = study-bro` vào `ai_usage`, đặt trần chi tiêu theo ngày riêng cho Study Bro để không ảnh hưởng cv-app.
- Mascot sói lấy từ thư viện (LottieFiles).
