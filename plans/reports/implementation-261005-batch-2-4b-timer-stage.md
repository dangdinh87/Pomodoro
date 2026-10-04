# Batch 2.4b: sân khấu timer Sticker pop, Tomo phản ứng, ăn mừng sau phiên (2026-10-05)

Nhánh `feat/design-system`. Làm theo TDD cho phần logic (test đỏ trước), commit qua `commit-own.py`. `pnpm type-check` sạch, `pnpm lint` 0 lỗi (73 cảnh báo cũ, không thêm cái mới), `pnpm i18n:check` OK (1353 khoá), `pnpm test` 120/121 file, 1130/1135 test pass; 5 test fail đều ở `src/lib/weather/weather-mood.test.ts` (weather WIP của phiên khác), không đụng.

## Commit

| Hash | Nội dung |
|---|---|
| `164ed1f` | `pickTomoMood` + test, `useTomoMood`, `useTodayStats`, `celebration-store`, test lời thoại 3 ngôn ngữ, khoá `tomo.*` (chỉ stage hunk `"tomo"` của 3 locale) |
| `1072ead` | 2D clock: `clock-digits` (ô số cố định), digital, analog, flip + test |
| `b4fb968` | Thẻ timer (`EnhancedTimer`, `TimerMascot`, `TimerProgress`, `SessionCycle`, controls, mode chips, task pill, daily progress), `SessionCelebration` + confetti + test, engine báo hoàn thành, `useActiveTask` |
| `50bf8e5` | Analog/colon chỉ chuyển động mượt khi không bật giảm chuyển động (`motion-safe:`) |

## Đã làm

1. **`pickTomoMood`** (`src/features/mascot/pick-tomo-mood.ts`): 6 luật đúng bảng §4.2 theo thứ tự ưu tiên; 31 test, phủ từng nhánh và các ranh giới 17:59/18:00, 22:59/23:00, 03:59/04:00, 11:59/12:00; chọn câu theo ngày học (04:00) xoay vòng đủ 4 biến thể, test 01:00 vẫn là ngày hôm trước. `useTomoMood()` ghép store timer, `celebration-store` và `useStats` (cùng query key với `DailyProgress`, không thêm API), tự đổi giờ mỗi phút và khi tab hiện lại (6 test).
2. **Lời của Tomo** `tomo.lines.<tình huống>.<n>` (7 tình huống x 4 câu x 3 ngôn ngữ) + `tomo.celebration.*`; danh sách đầy đủ ở dưới. Test kiểm: đủ khoá, mỗi câu khác nhau, ngắn, vi/en không có chữ số (không bịa số liệu), `{count}` còn nguyên.
3. **Thẻ timer** (§7.3): `.sticker-lg` (`--radius-xl`, bóng 6px), rộng tối đa 560px (`max-w-140`), mobile sát lề 16px. Thứ tự: Tomo + `TomoBubble` (focus đang chạy: Tomo `focus` 44px cạnh tên việc, hoặc chữ "Tập trung" khi chưa chọn việc; ô giữ cùng chiều cao nên bấm Start không làm thẻ nhảy) → chip chế độ → số → thanh tiến độ 18px có viền và vệt sáng (`TimerProgress`) → `SessionTomatoes` + "Phiên 1/4" → Bắt đầu to (56px) kẹp hai nút tròn Đặt lại / Bỏ qua (48px) → ô chọn việc (nét đứt khi chưa chọn, nổi có viền khi đã chọn). Màu theo `[data-mode]` qua `--accent-solid` (chip, thanh, nút Bắt đầu, chấm hai chấm). Thẻ không bao giờ mờ; chỉ chip chế độ, gợi ý phím và dòng "Hôm nay" (`data-chrome`) mờ đi như cũ (có ảnh `running-chrome-idle`).
4. **Số**: Baloo 2 800, mỗi chữ số nằm trong ô cố định, dấu `:` là hai chấm tròn có viền (CSS). Đo trên trình duyệt: qua 12 lần đổi số (05:00 đến 04:53, các chữ 0,5,9,8,7...) chiều rộng hàng số và toạ độ từng ô không đổi (267,62px; 61,2/118,6/213,9/271,4). Phút 3 chữ số (tới 120) tự thu nhỏ chữ để vừa thẻ.
5. **Đồng hồ 2D**: digital (chữ nâu đậm, hai chấm màu chế độ), analog (mặt kem viền 2,5px, cung thời gian còn lại có viền mực, vạch nâu, kim nâu đậm kết thúc bằng núm chạy trên cung), flip (ô kem viền, bóng cứng, đường bản lề viền). Màu cảnh báo phút cuối giữ cơ chế cũ (hổ phách/hồng). 3D (flip3d, tomato, orbit, solid) chỉ được bọc trong thẻ, giới hạn `max-w-full`, không đổi mô hình; kiểm tomato ở 390: nằm gọn trong thẻ, `scrollWidth` 390.
6. **`SessionCelebration`** (§4.3): dialog sticker `tilt-l`, Tomo `party` nhảy nhẹ, tiêu đề từ `tomo.lines.celebration`, pill "+N phút" (mint) và `StreakPill`, confetti bảng màu kẹo, nút "Nghỉ ngay" (chính) / "Để sau" (ghost). Chỉ mở khi engine báo (hết giờ tự nhiên, không catch-up, không stale), nên bỏ qua, dừng, đặt lại, đổi chế độ, hết giờ lúc đóng app đều không mở. Tự bắt đầu nghỉ bật thì tự đóng sau đúng 5 giây (đo thật: mở lúc 3,7s, đóng lúc 8,6s, giờ nghỉ vẫn chạy). Âm báo và thông báo vẫn ở engine, hộp thoại không phát thêm (có test đếm lời gọi).
7. **Dọn tồn đọng 2.3a**: popover chọn việc đã được batch 2.5a dọn trong `67010d4`; phần còn lại của tôi (pill chọn việc, `text-gold`/`text-white`, chữ tone) quét bằng grep: không còn `text-white`, `text-gold`, `text-ink-faint`, `data-theme="dark"`, `border-border-strong`, `backdrop-blur` trong `src/features/timer/**` (trừ `clock-style-picker.tsx` thuộc 2.5b, và `bg-white/45` cố ý của vệt sáng thanh tiến độ).

## Lời của Tomo (VI / EN / JA)

Tomo xưng "mình", gọi "bạn". Ghi chú chọn chữ: VI dùng "chuỗi ngày" và "phiên" đúng bảng thuật ngữ 1D; JA dùng thể です/ます mềm (ましょう, ね, よ) và "連続日数" theo bảng thuật ngữ; EN ngắn, ấm, không số liệu.

#### `tomo.lines.celebration` · Ăn mừng (tiêu đề modal)

| n | VI | EN | JA |
|---|---|---|---|
| 1 | Xong phiên rồi! | Session complete! | セッション完了！ |
| 2 | Quá đỉnh luôn! | Nailed it! | やりましたね！ |
| 3 | Tập trung tốt lắm! | Great focus! | いい集中でした！ |
| 4 | Thêm một quả cà chua vào giỏ rồi! | One more tomato in the basket! | トマトがまたひとつ増えました！ |

#### `tomo.lines.breakTip` · Gợi ý nghỉ (chế độ nghỉ)

| n | VI | EN | JA |
|---|---|---|---|
| 1 | Đứng dậy vươn vai một chút nhé, lưng bạn sẽ cảm ơn đó. | Stand up and stretch. Your back will thank you. | 立ち上がって、軽く伸びをしましょう。背中も喜びます。 |
| 2 | Uống chút nước đi bạn. Một ly là đủ rồi. | Grab some water. One glass is plenty. | 水を一杯飲みましょう。一杯で十分です。 |
| 3 | Nhìn ra xa một lát cho mắt được nghỉ nhé. | Look out the window and rest your eyes on something far away. | 遠くを眺めて、目を休ませましょう。 |
| 4 | Hít thở thật chậm vài hơi. Lúc này chưa cần làm gì cả. | Take a few slow breaths. There's nothing to do right now. | ゆっくり深呼吸。今は何もしなくて大丈夫です。 |

#### `tomo.lines.keepStreak` · Nhắc giữ chuỗi (chuỗi > 0, hôm nay chưa có phút nào, từ 18:00)

| n | VI | EN | JA |
|---|---|---|---|
| 1 | Chuỗi ngày đang chờ bạn hôm nay đó. Một phiên ngắn là giữ được rồi! | Your streak is waiting for today. One short session keeps it going! | 連続日数、続けたいですよね。1セッションだけでもつながりますよ！ |
| 2 | Hôm nay vẫn còn trống nè. Chỉ cần một phiên là giữ được chuỗi. | Psst, today is still empty. Even one session saves your streak. | 今日はまだ空っぽです。1セッションあれば連続日数を守れます。 |
| 3 | Mình không muốn chuỗi của bạn bị đứt đâu. Làm một phiên nhé? | I'd hate to see your streak end. Just one session? | 連続日数が途切れたら悲しいです…。1セッションだけどうですか？ |
| 4 | Vẫn chưa muộn đâu! Một phiên thôi là chuỗi ngày vẫn còn nguyên. | It's not too late! One session and your streak lives on. | まだ間に合います！1セッションで連続日数はつながりますよ。 |

#### `tomo.lines.sleep` · Nhắc ngủ (23:00 đến 03:59)

| n | VI | EN | JA |
|---|---|---|---|
| 1 | Khuya rồi. Ngủ là lúc não ghi nhớ những gì bạn vừa học đó. | It's late. Sleep is how your brain keeps what you studied. | もう遅い時間です。睡眠は、学んだことを定着させる大切な時間ですよ。 |
| 2 | Đến giờ đi ngủ rồi! Nghỉ ngơi đi, mai mình học tiếp nhé. | Past bedtime! Rest now and we'll pick this up tomorrow. | そろそろおやすみの時間です。続きは明日にしましょう。 |
| 3 | Mình buồn ngủ quá… Dừng ở đây thôi nhé, mai bạn sẽ cảm ơn mình. | Yawn... Maybe call it a night? Tomorrow-you will thank you. | ふわぁ…眠くなってきました。今日はここまでにしませんか？ |
| 4 | Ngủ đủ giấc thì mai học mới vào. Đi ngủ sớm nhé bạn! | Your brain does its best filing while you sleep. Time for bed? | ぐっすり眠ると、明日の集中力が違いますよ。早めに休みましょう。 |

#### `tomo.lines.greetingMorning` · Chào buổi sáng (04:00 đến 11:59)

| n | VI | EN | JA |
|---|---|---|---|
| 1 | Chào buổi sáng! Mình bắt đầu một phiên nhé? | Good morning! Ready for a first session? | おはようございます！まず1セッション始めましょうか？ |
| 2 | Sáng rồi, chọn một việc rồi mình cùng làm nhé. | Morning! Pick one thing and let's get started. | 朝ですね。ひとつ決めて、一緒に始めましょう。 |
| 3 | Ngày mới bắt đầu rồi. Làm một phiên cho ấm máy nha? | A fresh day. Shall we begin with one session? | 新しい一日の始まりです。ウォームアップに1セッションどうですか？ |
| 4 | Chào bạn! Sáng nay mình tập trung vào một việc thôi nhé. | Morning! Got your coffee? Then let's focus. | おはようございます。今日もひとつずつ進めましょう。 |

#### `tomo.lines.greetingAfternoon` · Chào buổi chiều (12:00 đến 17:59)

| n | VI | EN | JA |
|---|---|---|---|
| 1 | Chiều rồi! Mình làm thêm một phiên nhé? | Afternoon! A good time for a session. | こんにちは！もう1セッション、いかがですか？ |
| 2 | Ăn trưa xong rồi hả? Vào việc nhẹ nhàng với một phiên nha. | Back from lunch? Let's ease in with one session. | お昼のあとは、軽めの1セッションから始めましょう。 |
| 3 | Buổi chiều dễ buồn ngủ lắm. Một phiên ngắn sẽ tỉnh táo hơn đó! | Feeling the afternoon slump? A short session helps. | 午後はつい眠くなりますよね。短く集中してみましょう。 |
| 4 | Hôm nay bạn làm tới đâu rồi? Mình cùng tập trung tiếp nhé. | How's the day going? Let's keep the momentum. | 今日はどこまで進みましたか？続きを一緒にやりましょう。 |

#### `tomo.lines.greetingEvening` · Chào buổi tối (18:00 đến 22:59)

| n | VI | EN | JA |
|---|---|---|---|
| 1 | Chào buổi tối! Làm một phiên nhẹ nhàng trước khi nghỉ nhé? | Good evening! One calm session before you wind down? | こんばんは！休む前に、ゆったり1セッションどうですか？ |
| 2 | Tối rồi, mình chốt nốt một việc cho hôm nay nha. | Evening! Let's finish one last thing for today. | 夜ですね。今日の分をひとつだけ片づけましょう。 |
| 3 | Một phiên nhỏ buổi tối vẫn tính là có học đó! | A small session tonight still counts. | 小さな1セッションでも、ちゃんと積み重なりますよ。 |
| 4 | Tối nay bạn muốn xong việc nào? Chọn một việc nhỏ thôi cũng được. | What's one small thing to finish tonight? | 今夜は何を終わらせますか？小さなことからで大丈夫です。 |

#### `tomo.celebration.*`

| khoá | VI | EN | JA |
|---|---|---|---|
| takeBreak | Nghỉ ngay | Take a break | 休憩する |
| later | Để sau | Later | あとで |
| minutes | +{count} phút | +{count} min | +{count}分 |
| summary | Bạn vừa tập trung {count} phút. | You just focused for {count} min. | {count}分間、集中しました。 |

## Đo và ảnh (`plans/reports/assets-261005-relaunch/2-4b-*.png`, không commit)

Chrome DevTools MCP, context `relaunch-2-4b`, `emulate` 1440x900 và 390x844x2 mobile/touch.

| Ảnh | Nội dung |
|---|---|
| `idle-greeting-1440-light`, `idle-390-light`, `idle-390-dark` | idle, bong bóng của Tomo (lúc chụp là 03:xx nên ra câu nhắc ngủ), số digital |
| `running-focus-1440-light`, `running-task-1440-light` | đang chạy: Tomo `focus` nhỏ + tên việc, ô việc đã chọn |
| `running-chrome-idle-1440-light` | chuột đứng yên: chip/gợi ý mờ, thẻ không mờ |
| `break-idle-1440-light`, `break-running-1440-light` | nghỉ ngắn: Tomo `sleepy` + mẹo nghỉ, nền và nút màu bạc hà, "1 of 4 sessions done" |
| `celebration-1440-light`, `celebration-ja-390-light` | modal ăn mừng (EN và JA) |
| `clock-analog-1440-light`, `clock-analog-390-light`, `clock-flip-1440-light`, `clock-flip-vi-390-dark`, `clock-3d-tomato-390-light` | các kiểu đồng hồ |
| `task-picker-1440-light` | popover chọn việc dưới thẻ |

Kiểm: `scrollWidth` 390 ở mọi trạng thái đã chụp; VI (flip, tối, 390) và JA (modal, sáng, 390) đọc tự nhiên, không tràn chữ; tương phản (tính tay) chữ gợi ý `ink-muted` trên thẻ 5,58:1 (sáng) và 6,96:1 (tối), `on-accent` trên cà chua 5,39:1, bạc hà 10,15:1, trời 9,2:1, viền nét đứt tối `--control-edge` 3,5:1. Giảm chuyển động: MCP không giả lập được `prefers-reduced-motion`; dựa vào code và test (confetti không bắn, Tomo không thở/nhảy, thanh tiến độ và cung analog không transition), chưa xem trên trình duyệt.

## Quyết định tự chọn

- **Nút chính dùng "Bắt đầu" (`timer.controls.start`) thay vì "Bắt đầu tập trung"** (`timerUi.startFocus`): ở 390 nút nằm giữa hai nút tròn chỉ rộng ~190px, câu dài vi/ja tràn. Chip chế độ đã nói là Tập trung. Khoá `timerUi.startFocus` nay không ai dùng (chưa xoá, nằm ở hunk không phải của tôi).
- **Ô số cố định là 0,9ch, không phải 1ch.** Baloo 2 rộng nhất ở "0" (97 đơn vị ở 160px) nên 1ch để hở ~27px giữa "2" và "5"; 0,9ch vẫn cố định và chữ rộng nhất không chạm nhau (nhìn ở ảnh). Đổi một ký tự nếu muốn đúng 1ch tuyệt đối.
- **Ngưỡng "giữ chuỗi" = 1 phút** (`KEEP_STREAK_MINUTES`): máy chủ tính một ngày có chuỗi khi có bất kỳ phiên focus nào (`computeStreaks`), nên nhắc "giữ chuỗi" chỉ khi hôm nay chưa có phút nào. Hook làm tròn lên (`ceil`) để 40 giây cũng đã giữ chuỗi.
- **Số ngày trên modal**: số liệu thống kê chưa chứa phiên vừa xong (ghi nền). Nếu hôm nay đang 0 phút thì hiển thị `streak + 1`, ngược lại `max(streak, 1)`. Nhờ vậy số không nhảy khi stats về.
- **"+N phút" là độ dài cả pha** (cài đặt, hoặc bước của kế hoạch tuỳ chỉnh), không phải đoạn ghi cuối. Đổi việc giữa phiên làm đoạn ghi cuối ngắn hơn nhưng người dùng vừa tập trung trọn pha.
- **Tự bắt đầu nghỉ bật: giữ hai nút**, "Nghỉ ngay" chỉ đóng modal vì giờ nghỉ đã chạy. Chọn phương án giống spec nhất, không thêm khoá copy mới.
- **5 giây chỉ tính khi tab đang hiện**; tab ẩn thì chờ hiện lại (và confetti cũng bắn lúc đó), để người vừa quay lại vẫn thấy lời chúc. Có test.
- **Engine thôi tự bắn confetti** (hàm cũ bị bỏ, và nó bắn kể cả khi bật giảm chuyển động): `SessionCelebration` bắn, có tôn trọng giảm chuyển động. Engine chỉ gọi `announceFocusComplete`.
- **Bong bóng ẩn thì nhớ chung một khoá `timer-mood`** cho cả lời chào, mẹo nghỉ và nhắc chuỗi (đúng nghĩa "ẩn trong phiên làm việc" của spec). Tomo ở giữa thẻ khi bong bóng ẩn.
- **Analog không có kim xuyên tâm** (số ở giữa), kim ngắn từ vòng số tới cung kết thúc bằng núm; đây là cách đọc "kim nâu đậm" của spec.
- `progress` không vẽ cho analog/tomato/orbit (chúng đã tự vẽ tiến độ), như cũ.
- Cỡ 2D clock vẫn dùng `vw`/`vmin`, không dùng `cqw`: bộ chọn đồng hồ của 2.5b đo và co các component thật bằng `ScaleToFit`/`w-max`, container query sẽ làm nó đo ra 0.

## Việc cần phiên khác / tiếp theo

1. `src/hooks/use-confetti.ts` (ngoài phạm vi): nút Bỏ qua khi tiến độ >= 50% vẫn bắn confetti cũ (bảng màu cũ, không tôn trọng giảm chuyển động) và đó không phải kết thúc tự nhiên. Nên bỏ hoặc cho qua `useReducedMotion`.
2. Focus tạm dừng giữa phiên (không chạy) hiện lời chào buổi, đúng bảng spec nhưng hơi lạc ("Mình bắt đầu một phiên nhé?" khi đang dở). Muốn sát thực tế thì thêm luật "đang dở" vào `pickTomoMood` (cần chủ dự án chốt lời).
3. Chế độ nghỉ không có ô chọn việc nên thẻ thấp hơn ~50px so với focus; cần thì thêm chỗ giữ cùng chiều cao.
4. Thẻ đồng hồ cao hơn màn hình khi chọn analog cỡ lớn hoặc 3D ở 1440x900 (trang cuộn); khung `AppHome` (2.4a) có `min-h-dvh` nên không vỡ, chỉ cuộn.
5. `timerUi.startFocus` thành khoá chết.
6. `data-chrome` mờ cả dòng "Hôm nay"; nếu muốn dòng này luôn thấy thì bỏ thuộc tính ở `daily-progress.tsx`.
7. Viền thẻ ở dark mode vẫn thấp tương phản (đã nêu ở 2.3b); thấy rõ ở `idle-390-dark`.

## Câu hỏi còn mở

- Giữ ô số 0,9ch hay đúng 1ch như spec?
- Có muốn modal ăn mừng chỉ còn một nút "Ok" khi giờ nghỉ đã tự chạy?
- Lời Tomo nhắc ngủ lúc 23:00 đến 03:59 có thể gây phiền với người học khuya; có cần cài đặt tắt không?
