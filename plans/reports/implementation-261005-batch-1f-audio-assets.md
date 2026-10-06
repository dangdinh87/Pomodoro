# Batch 1F: âm thanh tổng hợp được (chuông báo + tiếng ồn)

Ngày 2026-10-05 · nhánh `feat/design-system` · commit `631c322` (qua `commit-own.py`).

## File đã sinh

Đo trên mp3 đã giải mã (`ebur128` + `volumedetect`). Chưa nghe thử được, chỉ kiểm bằng số và phổ (spectrogram).

| File | Cỡ | Dài | LUFS | True peak | volumedetect mean / max |
|---|---|---|---|---|---|
| `alarms/bell.mp3` | 42 832 B | 3,00 s | -14,4 | -9,0 dBTP | -14,5 / -9,1 dB |
| `alarms/chime.mp3` | 34 420 B | 2,40 s | -14,5 | -7,9 | -16,3 / -7,9 |
| `alarms/digital.mp3` | 23 449 B | 1,60 s | -14,5 | -7,1 | -16,4 / -7,2 |
| `alarms/wood.mp3` | 27 472 B | 1,90 s | -14,7 | -2,0 | -15,5 / -2,0 |
| `alarms/kitchen.mp3` | 28 203 B | 1,95 s | -14,5 | -6,0 | -17,0 / -6,1 |
| `noise/white-noise.mp3` | 720 710 B | 60,00 s | -20,5 | -11,7 | -23,3 / -12,1 |
| `noise/pink-noise.mp3` | 720 710 B | 60,00 s | -20,4 | -5,7 | -20,0 / -5,7 |
| `noise/brown-noise.mp3` | 720 710 B | 60,00 s | -20,4 | -5,9 | -19,3 / -6,0 |

Chuông: mono, mp3 112 kbps, 44,1 kHz, fade-in 3 ms, fade-out 0,15 đến 0,6 s, giới hạn đỉnh 0,8 tuyến tính (-1,9 dBFS) bằng `alimiter`. Tiếng ồn: mono, 96 kbps. 5 md5 chuông khác nhau (trước: 5 file cùng md5, 133 747 B). Không file nào im lặng. Cả hai script chạy hai lần cho ra file giống từng byte (`cmp`).

Cách làm từng âm (đều `aevalsrc`, cộng các thành phần sin tắt dần):
- **Bell**: chuông gõ hai nhát (0 và 1,1 s), 9 thành phần không điều hòa (hum, prime, tierce, quint, nominal...), thành phần cao tắt nhanh, một bản lệch tần của prime tạo độ rung.
- **Chime**: arpeggio C6-E6-G6 cách 230 ms, mỗi nốt kèm quãng tám nhẹ và bản lệch tần; nốt cuối ngân lâu hơn.
- **Digital**: hai cặp bíp tròn (E6 rồi G6), thêm hài bậc 3 nhẹ, có `aecho` ngắn cho mềm.
- **Wood**: hai nhóm 3 tiếng gõ gỗ (cao, thấp, cao), thân cộng hưởng tắt nhanh + hai thành phần cứng; tiếng "tok" là điểm vào sắc.
- **Kitchen**: đồng hồ bếp lên dây: búa nảy giữa hai chuông nhỏ (1760 và 2217 Hz) 14 nhịp/giây, hai đợt rung, lowpass 6,5 kHz cho đỡ chói.
- **Noise**: `anoisesrc` có `seed` cố định, sinh dài 62 s rồi cắt 60 s, đầu vòng crossfade công suất đều (`acrossfade` qsin, 2 s) với 2 s đuôi thừa, nên mẫu cuối nối thẳng sang mẫu đầu. Đã kiểm: RMS cửa sổ 100 ms ở đầu, cuối, giữa không lệch (white 0,0685 so với 0,0683), độ dốc phổ đúng (pink phẳng theo quãng tám, brown -3 dB/quãng tám từ 500 Hz trở lên). White có lowpass 1 cực 7 kHz. Brown có highpass 25 Hz.

## Lệnh sinh lại

```
scripts/generate-alarm-sounds.sh [OUT_DIR]   # mặc định public/sounds/alarms
scripts/generate-noise-sounds.sh [OUT_DIR]   # mặc định public/sounds/noise
```
Dùng chung `scripts/lib/audio-normalize.sh` (đo LUFS, chỉnh gain lặp tối đa 4 vòng để bù phần limiter ăn mất, encode mp3, in bảng như trên). Cần `ffmpeg` có libmp3lame và `awk`. Chạy khoảng 3 s (chuông), 5 s (ồn).

## Thay đổi catalog và code

- `sound-catalog.ts`: danh sách chuông thành `bell, chime, digital, wood, kitchen` (bỏ `gong`, `soft`; xoá 2 file mp3 cũ). Bỏ `hidden` của `white-noise`, `pink-noise`. `brown-noise` đã có sẵn trong catalog, i18n và preset "Deep focus", chỉ thay file (cũ 1,6 MB stereo 175 kbps, độ to lệch LRA 8 LU, chưa rõ có lặp liền mạch; mới 720 KB).
- **Id cũ trong bản lưu**: người dùng đã chọn `gong` hoặc `soft` được ánh xạ sang `bell` và `chime` bằng `resolveAlarmType()` (id lạ khác vẫn về `bell`). Dùng ở `alarm.ts` (phát) và `bell-notifications-section.tsx` (ô chọn hiện đúng thứ sẽ phát). Không sửa `audio-store.ts` (thuộc 1E). `ALARM_NONE` chuyển sang catalog, `alarm.ts` vẫn re-export nên nơi khác không đổi.
- i18n `timerSettings.bell.sounds.{wood,kitchen}` (en/vi/ja), bỏ `gong`, `soft`: EN Wood / Kitchen timer, VI "Gõ gỗ" / "Đồng hồ bếp", JA ウッドブロック / キッチンタイマー. `pnpm i18n:check` xanh (1277 key).

## Test

- `sound-assets.test.ts`: (1) **mỗi chuông một file riêng** (băm sha256, bắt cả hai `id` trỏ cùng file); đã thử copy `wood.mp3` đè `kitchen.mp3`, test đỏ đúng chỗ rồi khôi phục; (2) chuông không phải bản sao `silence.mp3`; (3) âm nền đang hiện không trùng nhau (cũng chạy được cho 3 file noise mới); (4) catalog có white/pink/brown; (5) còn đúng 7 âm ẩn (birds, night-crickets, fireplace, library, coffee-shop, coworking, cat-purring).
- Ngưỡng dung lượng chuông hạ từ 50 KB xuống 10 KB riêng cho chuông vì clip 1,5 đến 3 s ở 112 kbps chỉ 23 đến 43 KB; việc chống file câm của chuông chuyển sang kiểm băm. Ngưỡng 50 KB của âm nền giữ nguyên.
- `alarm.test.ts`: đổi `gong`/`soft` sang `wood`/`kitchen`, thêm ca id cũ `gong` thành bell, `soft` thành chime. `bell-notifications-section.test.tsx`: danh sách 5 chuông + Tắt mới, chọn `wood`, bản lưu `gong` hiện "bell". `timer-settings.test.tsx` đổi `gong` thành `wood`. `audio-store.test.ts`: ca "mọi âm đã bị gỡ" dùng `white-noise` (nay đã hiện) nên đổi sang `cat-purring` (vẫn ẩn).
- Cổng: `pnpm type-check` sạch; eslint 0 lỗi trên file chạm vào; `pnpm test` 927 qua, **6 đỏ**: 1 là `audio-store.test.ts` (đã sửa ở trên, xanh lại), 5 còn lại là `src/lib/weather/weather-mood.test.ts` có từ 1D (WIP thời tiết dùng `birds`, `night-crickets`, `fireplace` đang ẩn; không thuộc batch này).

## Còn cần bản thu thật

7 âm vẫn ẩn, cần mp3 thật rồi bỏ `hidden: true` (test kích thước, băm sẽ kiểm file): `birds`, `night-crickets`, `fireplace`, `library`, `coffee-shop`, `coworking`, `cat-purring`. Thêm: 5 tâm trạng thời tiết vẫn đang trỏ sang `birds`/`night-crickets`/`fireplace` (xem báo cáo 1D).

## Lưu ý

- Chưa nghe thử. Kiểm bằng số, spectrogram (không có chấm lạ, vạch phổ đúng các tần số thiết kế), độ nhảy mẫu (không có click, mẫu đầu/cuối gần 0). Nên nghe tay: bell, kitchen (sáng, 14 nhịp/s) và wood (đỉnh -2 dBTP, hơi sát) là ba file dễ lệch gu nhất. Chỉnh trong script rồi chạy lại.
- Tiếng ồn lặp liền mạch về dữ liệu; mp3 vẫn có độ trễ bộ mã hoá (LAME tag). Chrome cắt theo tag nên vòng `audio.loop` liền; Safari có thể hở vài chục ms mỗi 60 s. Nếu nghe thấy, đổi sang Web Audio `AudioBufferSourceNode` (1E) hoặc đổi định dạng. Chưa đo trên trình duyệt.
- Brown của `anoisesrc` là tích phân rò rỉ (phẳng dưới khoảng 140 Hz), nên ít sub-bass hơn brown lý thuyết; có chủ đích hợp loa laptop.
- `src/stores/audio-store.ts:42` còn comment cũ `'bell' | 'chime' | 'gong' | 'digital' | 'soft'` (file 1E, không đụng). Sửa thành `'bell' | 'chime' | 'digital' | 'wood' | 'kitchen' | 'none'` khi file rảnh.
