---
phase: 05
title: "Bộ đồng hồ 2D/3D"
status: pending
estimate: 5 ngày
depends_on: 03
---

# Phase 05 — Bộ đồng hồ 2D/3D

## Mục tiêu
Đồng hồ là điểm nhấn thương hiệu. Có bộ 2D gọn và 5 đồng hồ 3D lạ mắt, chọn trong gallery có xem trước trực tiếp.

## Danh sách
| Đồng hồ | Ý tưởng | Kỹ thuật | Gói |
|---|---|---|---|
| Số (2D) | Space Grotesk lớn, thanh tiến độ | DOM | Free |
| Kim (2D) | Mặt kim tối giản | SVG | Free |
| Flip (2D) | Lật số có bóng | CSS 3D | Free |
| Vòng (2D) | Vòng tiến độ | SVG | Free |
| **Cà chua (3D)** | Quả cà chua xoay nhẹ, chín dần từ xanh sang đỏ theo tiến độ; cuối phiên rung nhẹ | R3F, shader màu theo tiến độ | Free |
| Đồng hồ cát (3D) | Hạt cát rơi bằng GPU instancing, số hạt theo thời lượng | R3F + instanced mesh | Pro |
| Orb thuỷ tinh (3D) | Chất lỏng dâng trong quả cầu thuỷ tinh (transmission) | drei `MeshTransmissionMaterial` | Pro |
| Split-flap (3D) | Bảng lật cơ học kiểu sân bay, có tiếng lật | R3F + spring vật lý | Pro |
| Hành tinh (3D) | Mặt trăng quay quanh hành tinh theo phút | R3F | Pro |

## Các bước
1. Hợp đồng chung: mọi đồng hồ nhận `{ remainingSec, totalSec, mode, running, reducedMotion }`, không tự đếm giờ.
2. Mỗi đồng hồ 3D là một chunk `next/dynamic` (`ssr: false`), dùng chung một `<Canvas>` có `frameloop="demand"` khi tạm dừng.
3. Phát hiện năng lực: không có WebGL2, `navigator.deviceMemory < 4`, chế độ tiết kiệm pin hoặc reduced-motion → tự dùng bản 2D tương ứng và báo nhẹ.
4. Ngân sách: ≤ 4 ms/khung trên laptop tầm trung, ≥ 50 fps trên điện thoại tầm trung, mỗi chunk ≤ 250 kB gzip (three dùng chung).
5. Gallery: lưới thẻ có xem trước sống (render thu nhỏ), khoá Pro hiển thị nhẹ nhàng.

## Tiêu chí xong
- Đo fps bằng script trong harness (requestAnimationFrame sampling) cho từng đồng hồ ở 1440 và 390.
- Tab ẩn: không render. Reduced-motion: ảnh tĩnh của từng đồng hồ.

## Rủi ro
- Chất liệu thuỷ tinh nặng trên mobile → giảm độ phân giải render (`dpr` 1–1.5), bản mobile dùng chất liệu đơn giản hơn.
- Dung lượng three.js (~150 kB gzip) → chỉ tải khi chọn đồng hồ 3D.
