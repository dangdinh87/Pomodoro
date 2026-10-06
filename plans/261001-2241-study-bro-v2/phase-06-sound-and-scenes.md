---
phase: 06
title: "Âm thanh & không gian"
status: pending
estimate: 5 ngày
depends_on: 03
decision: "Âm thanh tự làm toàn bộ (chủ dự án chốt 2026-10-01) → tổng hợp bằng code"
---

# Phase 06 — Âm thanh & không gian

## Mục tiêu
Âm thanh **tự làm 100%** bằng tổng hợp âm trên trình duyệt: không file, không bản quyền, không lặp, chạy offline. "Không gian" đổi một chạm. Gỡ toàn bộ file mp3 hiện tại (10/41 file im lặng, file trùng, không rõ nguồn).

## Engine âm thanh (`src/features/sound/engine/`)
- Một `AudioContext` dùng chung, mở khoá ở lần chạm đầu (iOS). Mỗi âm là một **voice** có `start/stop/setParams`, nối vào GainNode của kênh → master → `DynamicsCompressor` (chống vỡ tiếng khi trộn nhiều kênh).
- Nguồn nhiễu tạo bằng **AudioWorklet** (trắng/hồng/nâu), có fallback `AudioBuffer` dài 10 s khi không có worklet.
- Ngẫu nhiên có kiểm soát (seeded PRNG) để âm sống động nhưng tái lập được.
- Crossfade 1,5 s khi đổi scene; tự giảm 50% khi chuông báo; Media Session hiển thị tên scene; dừng engine khi tắt hết kênh để tiết kiệm pin.

## Thư viện âm tổng hợp
| Âm | Cách tạo | Gói |
|---|---|---|
| Tiếng ồn trắng / hồng / nâu | Worklet nhiễu + bộ lọc | Free |
| Mưa nhẹ, mưa to | Nhiễu hồng qua band-pass + hạt mưa (xung ngắn ngẫu nhiên, bộ lọc ngẫu nhiên) | Free |
| Mưa trên mái tôn | Hạt mưa cộng hưởng (bộ lọc comb/resonant như tấm kim loại) | Free |
| Sấm xa | Nhiễu nâu + đường bao dài, low-pass, khoảng cách ngẫu nhiên | Pro |
| Gió | Nhiễu qua band-pass có tần số và biên độ điều biến chậm (LFO ngẫu nhiên) | Free |
| Sóng biển | Nhiễu hồng điều biến biên độ theo chu kỳ 6–12 s | Free |
| Suối | Nhiều band-pass hẹp ngẫu nhiên (bong bóng) trên nền nhiễu | Pro |
| Lửa trại | Nền nhiễu nâu + tiếng nổ lách tách (xung + bộ lọc cao) | Free |
| Dế, côn trùng đêm | Sine/FM có điều biến biên độ nhanh theo nhịp | Free |
| Chim sáng sớm | FM chirp với đường bao tần số | Pro |
| Gõ phím | Xung click + cộng hưởng ngắn, nhịp ngẫu nhiên như người gõ | Pro |
| Đồng hồ tích tắc | Click có cộng hưởng, nhịp 1 s | Free |
| Quán cà phê | Nhiễu dải giọng nói (formant) + tiếng cốc chén (xung kim loại) | Pro |
| **Nhạc lofi tự sinh** | Tone.js (tải động): tiến trình hợp âm jazz ngẫu nhiên theo giọng, piano điện (FM), bass, trống tổng hợp (kick/snare/hat), tiếng đĩa than, swing; không bao giờ lặp | Pro (Free nghe 1 bản/ngày) |
| Chuông báo hết phiên (4 kiểu) | Chuông FM, gỗ, chuông gió, giọng "ding" mềm | Free |

Mỗi âm có preset mặc định đã tinh chỉnh bằng tai; người dùng chỉnh âm lượng từng kênh và lưu mix (Free 2, Pro không giới hạn).

## Không gian (scene)
`{ id, name, background, soundMix, clock, palette, Pro }`. Ví dụ: **Thư viện mưa** (mưa nhẹ + tích tắc, đồng hồ split-flap), **Đêm Đà Lạt** (gió thông + dế, orb thuỷ tinh, nền shader sương), **Mưa mái tôn Sài Gòn** (mưa mái tôn + sấm xa), **Biển Quy Nhơn** (sóng + gió nhẹ), **Lửa trại** (lửa + dế), **Phòng ký túc 2 giờ sáng** (lofi tự sinh + mưa nhẹ). 4 scene Free, còn lại Pro.

## Nền
- **Nền shader tự viết** (ưu tiên, nhẹ, không bản quyền): sương trôi, mưa trên kính, bầu trời sao, ánh lửa, mặt nước.
- Ảnh/video: chỉ dùng nguồn có giấy phép thương mại rõ ràng (Pexels, Pixabay) hoặc tự chụp; ghi `background-manifest.json`. Gỡ toàn bộ ảnh hiện tại không chứng minh được nguồn.
- Lưu ở Vercel Blob (dùng chung tài khoản Vercel), không để trong git.

## Các bước
1. Gỡ `public/sounds/*` cũ và YouTube chạy ẩn (đổi sang mini player hiển thị).
2. Viết engine + 6 âm Free đầu tiên, nghe thử và tinh chỉnh.
3. Hoàn thiện thư viện, mixer, preset, panel Âm thanh.
4. Nhạc lofi tự sinh (Tone.js, chunk riêng).
5. Gallery Không gian + 3 nền shader đầu tiên.

## Tiêu chí xong
- Không còn file âm thanh trong repo (trừ khi tự thu âm); `grep -r "\.mp3"` chỉ còn trong tài liệu.
- CPU âm thanh ≤ 5% trên laptop tầm trung khi trộn 4 kênh; iOS phát được sau chạm đầu; tab ẩn vẫn phát.
- Nghe thử từng âm 10 phút không thấy lặp hay tiếng "bụp".

## Rủi ro
- Âm tổng hợp nghe "điện tử" → tinh chỉnh kỹ (nhiều lớp, lọc, ngẫu nhiên), tham khảo kỹ thuật thiết kế âm thanh thủ tục (procedural audio, Andy Farnell — *Designing Sound*).
- Safari giới hạn AudioWorklet cũ → fallback AudioBuffer.
