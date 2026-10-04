# Batch 1C: hành vi timer, reset an toàn, báo hết phiên chắc chắn (2026-10-05)

Nhánh `feat/design-system`, TDD (test đỏ trước, trừ `alarm.ts` viết kèm test), commit qua `commit-own.py`. Không đụng file của batch 2.1 hay phần thời tiết.

## Kết quả theo task

| Task | Commit | Nội dung |
|---|---|---|
| 1. Auto-start (P1-2) | `7d9ab80` (store), `24d9817` (engine), `72bd107` (skip) | `autoStartWork=false` mặc định. Persist `version` 1 lên 2, `migrateTimerState` lật `autoStartWork:true` đã lưu về false đúng một lần (từ v0/v1), v2 giữ nguyên. Helper `mayAutoChain` (`lib/timer/auto-chain.ts`): không tự nối sau nghỉ dài; dừng khi 2 pha liên tiếp không có tương tác (pointerdown/move, keydown, touch, wheel, focus, tab hiện lại). Engine đếm `idlePhases`; bấm Skip ở nghỉ dài cũng không tự chạy phiên focus kế. Hint `autoStartWorkHint` đổi cho đúng. |
| 2. Đếm phiên theo ngày (P3) | `7d9ab80`, `24d9817` | `sessionCountDay` (ngày học 04:00, dùng `study-day.ts` của 1B) lưu cùng `sessionCount`. Về 0 khi rehydrate sang ngày khác, khi `incrementSessionCount`, và khi `syncSessionDay()` (engine gọi lúc mount, lúc tab hiện lại, và trước khi tính nghỉ dài ở mỗi lần hoàn thành). |
| 3. Confirm reset (P1-4) | `72bd107` | `requestTimerReset()` dùng chung cho phím R, nút ↺, palette. Có tiến độ thì mở `ResetTimerDialog` (mount trong `EnhancedTimer`): Lưu phần đã làm (ghi đoạn lẻ `completedFullSession:false` rồi reset), Đặt lại không lưu, Hủy/Esc. Không có tiến độ thì reset ngay. Tách `recordPendingFocus` dùng chung với `switchActiveTask`. Hộp thoại tự đóng nếu pha đã đổi khi đang mở. Mode-change confirm giữ nguyên. |
| 4. Báo chắc chắn (P1-6 a/b) | `24d9817` (setTimeout, preload), `3f08798` (Wake Lock) | Engine hẹn thêm `setTimeout` đúng deadline, hẹn lại khi start/pause/resume (effect chạy lại) và `visibilitychange` (bắt kịp ngay deadline đã qua). Vẫn idempotent: mutex `isCompletingRef` + `claimCompletion`; interval vẫn giữ để vẽ. `preloadAlarm()` khi bắt đầu chạy, `playAlarm` dùng lại audio đã preload. Wake Lock (`use-screen-wake-lock.ts`): chỉ khi bật cài đặt, đang chạy và là pha focus; lấy lại khi tab hiện lại; feature-detect. |
| 5. Chuông & thông báo (P1-5, P2-10) | `3f08798` | Mục `BellNotificationsSection` trong Timer settings: chọn chuông (5 file + Tắt), thanh âm lượng 10 đến 100, nút Nghe thử, quyền thông báo (Bật / Đang bật / Đã chặn kèm hướng dẫn / Không hỗ trợ), công tắc giữ màn hình sáng (ẩn nếu không có Wake Lock). Timer settings **lưu ngay** (bỏ nút Save, chỉ báo "Đã lưu"); Reset to defaults gọi `updateSettings(defaults)` nên lưu thật, gồm chuông. |
| 6. Chữ thông báo (P1-6c) | `24d9817` | `notifyPhaseComplete(mode, t)`; key `timer.notifications.{focusDone,breakDone,longBreakDone}.{title,body}` en/vi/ja. Engine giữ `t` qua ref (cập nhật trong effect, `98f0d70`). |

Phụ: `Slider` chuyển `aria-label` xuống thumb (không có tên truy cập được trước đó); bỏ key chết `timerSettings.actions.save/saveChanges`, `timerSettings.toasts.saved` (`3f08798`, `98f0d70`).

## Quyết định tự chọn

- **"Cả một chu kỳ không tương tác" = 2 pha liên tiếp không có người** (một focus + một nghỉ). Mount hook tính là có mặt. Hệ quả: người bấm Start rồi bỏ đi sẽ chạy tối đa focus 1, nghỉ, focus 2 rồi dừng ở start screen (3 pha, 2 phiên focus ghi). Muốn chặt hơn thì hạ `MAX_IDLE_PHASES` xuống 1.
- **Tương tác tính theo từng tab**, không đồng bộ giữa tab. Tab nền thắng claim hoàn thành mà người dùng đang ở tab khác có thể dừng chuỗi sớm; tab đang xem thường thắng vì timer chính xác hơn. Chưa đồng bộ qua localStorage (YAGNI).
- **Migration lật mọi `autoStartWork:true`** đã lưu, vì không phân biệt được mặc định với lựa chọn của người dùng (đúng yêu cầu). Người dùng bật lại thì được giữ.
- **`sessionCount` cũ chưa có ngày bị reset về 0 một lần** khi nâng cấp (không biết là của ngày nào).
- **Reset: nút Lưu chỉ hiện khi pha là focus và có >= 1 giây chưa ghi.** Nghỉ hoặc vừa bấm Start chỉ có Đặt lại / Hủy. Timer vẫn chạy khi hộp thoại mở; không tự pause.
- **Chuông tối thiểu 10%** (giữ như `alarm.ts`), nên slider chạy 10 đến 100; muốn im thì chọn "Tắt chuông" (`alarmType='none'`, `playAlarm` im lặng, Preview và slider bị tắt).
- **Wake Lock mặc định tắt**, lưu trong `settings.keepScreenOn` của timer-store (cùng nơi, được Reset to defaults đụng tới).
- **Thông báo chỉ hiện khi tab ẩn** (như cũ). Nút "Bật" gọi `Notification.requestPermission()`; lời nhắc quyền khi bấm Start giữ nguyên.
- **Lưu ngay** chọn thay vì hỏi khi đóng: đơn giản hơn, khớp panel Cài đặt chung. Gõ số vẫn chặn đến blur/Enter để không clamp giữa chừng.

## Test

Mới/đổi (554 test toàn repo, gồm test của batch khác):
- `timer-store.test.ts` (+11): migration v0/v1/v2, mặc định mới, ngày học (ranh giới 04:00 Asia/Saigon), persist version 2.
- `use-timer-engine.test.tsx` (+21): chuỗi tự chạy (nghỉ dài, đủ 2 pha vắng, từng loại tương tác giữ chuỗi, đếm lại từ 0, bấm Start lại), đếm ngày (không kích nghỉ dài của hôm qua), setTimeout đúng mốc khi `setInterval` bị chặn (pause, resume, visibilitychange, StrictMode, claim của tab khác, unmount, preload).
- `auto-chain.test.ts`, `alarm.test.ts`, `notifications.test.ts`, `partial-segment.test.ts`, `reset-timer-dialog.test.tsx` (ba lựa chọn + Esc + nghỉ + tự đóng), `use-timer-hotkeys.test.tsx`, `timer-controls-reset.test.tsx` (nút ↺ + skip nghỉ dài), `command-palette.test.tsx`, `use-screen-wake-lock.test.tsx`, `bell-notifications-section.test.tsx`, `timer-settings.test.tsx` (lưu ngay, clamp, preset, Reset lưu thật, đóng không hỏi).

Cổng cuối: `pnpm type-check` sạch; `pnpm lint` 0 lỗi / 93 warning (bằng trước batch); `pnpm test` 63 file / 554 test xanh; `pnpm i18n:check` OK (1251 key).

## Kiểm chạy thật (dev server :3001 có sẵn, Chrome DevTools, context `relaunch-1c`)

- Phím R với 10:00 đã chạy: hộp thoại "Reset timer?" hiện đúng. "Lưu phần đã làm" đưa đồng hồ về 25:00 và đưa vào outbox đoạn 600 giây `completedFullSession:false`. Console không lỗi/cảnh báo.
- Bell settings hiển thị đúng ở VI và JA; bật công tắc giữ màn hình sáng lưu ngay vào `timer-storage` kèm "保存しました".
- `sessionCount` 2 của ngày cũ (1999) hiện lại "Session 1 of 4".
- Hoàn thành thật với deadline gần: chuông phát sau deadline 3 ms; với `document.hidden=true` giả lập, chuông phát 1 ms sau deadline và thông báo VI "Hết giờ nghỉ dài / Sẵn sàng cho vòng tiếp theo chưa?" hiện; sau nghỉ dài, `autoStartWork=true` vẫn dừng ở pha focus chưa chạy.
- Ảnh: `plans/reports/assets-261005-relaunch/1c-reset-dialog-en.png`, `1c-reset-dialog-vi-390.png` (thực tế vẫn viewport 1440, `resize_page` không đổi khung chụp), `1c-bell-settings-vi.png`, `1c-bell-settings-ja.png` (không commit).

## Chưa làm / hạn chế

- **Throttle thật của tab ẩn lâu (> 5 phút) chưa đo được trên trình duyệt**; chỉ có test giả lập `setInterval` không chạy. Hẹn một `setTimeout` đơn lẻ vốn không bị intensive throttling, nhưng cần đo tay trên Chrome và Safari. Chưa có Service Worker `showNotification` (Android không cho `new Notification()`), và iOS có thể chặn phát chuông nền khi chưa "mở khoá" audio bằng cử chỉ: để lại cho một batch sau.
- Chưa kiểm khung 390 px thật cho hộp thoại reset (3 nút ở VI/JA dài), mới xem ở 1440; footer `AlertDialog` xếp cột ở màn nhỏ nên dự kiến ổn.
- Câu `timer.skip_confirm.description` vẫn nói "dưới 50%" cả khi đã quá 50% (đã nêu ở 1A, thuộc batch copy).
- Không cập nhật bảng trạng thái trong `plan.md` (file đang có sửa đổi chưa commit của phiên khác).
- Chưa kiểm cross-tab thật (hai tab) cho cờ tương tác.

## Câu hỏi còn mở

- Có muốn siết còn 1 pha vắng (`MAX_IDLE_PHASES=1`) để người bỏ đi không ghi nổi phiên focus thứ hai?
- Có nên tự đồng bộ "có người" giữa các tab qua localStorage?
