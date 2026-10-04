# Batch 1B — thống kê theo múi giờ người dùng, ngày học bắt đầu 04:00

Ngày 2026-10-05, nhánh `feat/design-system`. Kết quả: xong cả 6 việc, 4 commit mã + 1 commit báo cáo. Không đụng schema, `drizzle/`, `lib/timer`, `api/tasks`, `lib/auth*`, `use-timer-engine*`, weather. Vẫn đọc cột `focus_sessions.created_at` như cũ nên khớp với 1A (đang ghi giờ kết thúc thật vào đúng cột này).

## Thay đổi theo việc

| Việc | Commit | Nội dung |
|---|---|---|
| 1. Helper ngày học | `3b1f004` | `src/lib/stats/study-day.ts` (thuần JS, dùng được ở client): `isValidTimeZone`, `resolveTimeZone` (sai/thiếu thì `UTC`), `getBrowserTimeZone`, `studyDayOf(date, tz)`, `studyDayRange(day, tz)` → `{start, end}` UTC (nửa mở), `addDays`, `eachDay`, `parseDayParam`, `studyTodayDate`. `study-day-sql.ts`: `studyDaySql(col, tz)`. `study-query.ts`: parse `tz/startDate/endDate` + điều kiện `[from, to)` dùng chung cho stats và history |
| 3. `/api/stats` | `a02e8bd` | Gom bằng SQL `GROUP BY` ngày học + mode, cùng shape JSON cũ (`summary`, `dailyFocus`, `distribution`) nên UI không phải đổi shape |
| 4. `/api/history` | `a02e8bd` | Lọc khoảng ngày học theo `tz`, giữ limit 50 (mặc định) / 1000 (có khoảng ngày) |
| 5. Streak | `a02e8bd` | `computeStreaks` giữ nguyên thuật toán (hôm nay chưa học thì chưa đứt, đứt khi qua hết ngày), giờ nhận khoá ngày học và `today = studyDayOf(now, tz)`; thêm test |
| 2. Client gửi tz | `f963db9` | `use-stats`, `use-history` gửi `tz`, query key `['stats'|'history', tz, from, to]` (prefix `['stats']` vẫn bị `invalidateQueries` của recorder trúng). `stats-panel`, heatmap, week-chart, `daily-progress` lấy "hôm nay" bằng `studyTodayDate()` thay cho `new Date()`; `daily-progress` bỏ `useMemo([])` để qua 04:00 tự sang ngày mới |
| 6. Export | `ad06297` | Server: `?tz=` hợp lệ thì tên file theo ngày học trong tz, không có/sai thì giữ ngày UTC như cũ. Client `account-settings.tsx` mới là nơi đặt tên file thật (`a.download`), nên đổi cả nó sang `studyDayOf` và gửi `tz` |

## SQL

Ngày học (tz là tham số bind, ranh giới là hằng số từ `DAY_START_HOUR`, không nối chuỗi):

```sql
to_char((created_at AT TIME ZONE $tz) - interval '4 hours', 'YYYY-MM-DD')
```

`/api/stats`, truy vấn gom:

```sql
select <day>, mode, coalesce(sum(duration_sec),0)::int, count(*)::int
from focus_sessions
where user_id = $2 and created_at >= $from and created_at < $to   -- from/to chỉ có khi có startDate/endDate
group by 1, 2
```

Khi có khoảng ngày, chạy thêm truy vấn streak toàn thời gian (`select <day> ... where user_id and mode='work' group by 1`). Không có khoảng ngày thì dùng luôn các dòng trên (đã là toàn thời gian). Lọc khoảng bằng mốc UTC từ `studyDayRange` nên dùng được index `(user_id, created_at)`.

## Quyết định

1. **Gom theo vị trí cột (`GROUP BY 1, 2`).** Đã kiểm chứng: viết lại biểu thức ngày ở `select` và `groupBy` thì Postgres thấy hai tham số `$1`/`$2` khác nhau và báo lỗi "must appear in the GROUP BY". Ghi chú ngay trong `study-day-sql.ts`.
2. **Ngày học tính theo giờ đồng hồ tường (wall clock) trừ 4 giờ**, giống hệt ở JS và SQL; có test so khớp JS với PGlite trên 6 múi giờ và các mốc DST (New York 8/3 và 1/11, Lord Howe nửa giờ). Ngày DST của New York dài 23h/25h, đúng theo quy tắc.
3. **Phiên thuộc ngày học của `created_at` (giờ kết thúc).** Phiên 03:50 → 04:15 tính sang ngày sau; phiên 23:50 → 00:15 tính ngày trước. Khớp với 1A ghi giờ kết thúc vào cùng cột.
4. **Đề bài có một câu tự mâu thuẫn:** "phiên 00:31 tính cho hôm nay lúc 09:00" và "03:30 tính ngày học trước". Theo quy tắc 04:00, 00:31 cũng thuộc ngày học trước. Chọn quy tắc nhất quán: lúc 00:45 (ngày học vẫn là hôm qua) phiên 00:31 nằm trong "Hôm nay" (đúng lỗi P1-1 trong audit: trước đây ra 0); sang 09:00 thì nó nằm ở hôm qua. Test mô tả cả hai thời điểm.
5. **`startDate/endDate` giữ nguyên là khoá ngày `YYYY-MM-DD`**, giờ hiểu là ngày học trong `tz`; server đổi sang mốc UTC. Client tính "hôm nay/tuần/tháng/12 tuần" bằng cùng helper (`studyTodayDate` trả ngày 00:00 local của ngày học để date-fns vẫn dùng được), không dùng `new Date()` thô.
6. `tz` sai hoặc thiếu → UTC. Chặn kiểu offset `+07:00` vì Intl nhận mà Postgres hiểu ngược dấu. Đã thử mọi múi giờ của `Intl.supportedValuesOf('timeZone')` (427) với PGlite: Postgres nhận hết.
7. Trần 366 ngày cho biểu đồ giữ như cũ. Không thêm trường `sessions` theo ngày vì UI chưa dùng (YAGNI).
8. Không sửa locale, không có chuỗi mới.

## Test

- Mới: `study-day.test.ts` (20), `study-day-sql.test.ts` (4: so khớp JS↔SQL, bind tham số, group by thật, khớp `studyDayRange`), `streak.test.ts` (+3), `use-stats.test.tsx` (5), `study-today.test.tsx` (2), `account/export/route.test.ts` (+2).
- `api/stats/route.test.ts` viết lại với đồng hồ giả: 03:59 vs 04:00, 23:50 → 00:15 giữ một ngày và streak không đứt, 00:31 ở 00:45 và 09:00, streak sống tới hết ngày rồi đứt, múi giờ New York (DST 8/3), heatmap 78 ngày, trần 366, tz/ngày sai, 401; history: lọc theo ngày học, rơi về UTC khi thiếu tz, limit 50/1000.
- Đã thấy đỏ trước khi code (các ca 00:31/03:30, tz, export).

## Cổng

| Cổng | Kết quả |
|---|---|
| `pnpm lint` | 0 lỗi, 93 warning (không có warning mới của tôi) |
| `pnpm i18n:check` | xanh, 1226 key |
| `pnpm test` | 350 qua, **7 fail đều ở `src/app/api/tasks/session-complete/route.test.ts`**, là việc dở của batch 1A (file đang sửa, chưa commit) — không thuộc 1B |
| `pnpm type-check` | 2 lỗi cũ `src/hooks/use-tasks.test.tsx(185,203)` TS2349 (`list(url, init)`); file không bị sửa so với HEAD, có từ trước. Không có lỗi ở file của batch này |

Kiểm runtime: không có dev server nghe :3001 (`lsof` rỗng), nên chỉ dựa vào test.

## Việc nối tiếp (ngoài phạm vi, không làm)

- Index gợi ý (cần sửa schema, 1A/lead): `(user_id, mode, created_at)` để truy vấn streak quét index-only. Hiện mỗi lần gọi `/api/stats` vẫn quét mọi phiên `work` của người dùng để tính streak toàn thời gian; nếu chậm thì cân nhắc bảng cộng dồn theo ngày.
- `['history']` chưa bị invalidate khi ghi phiên (`use-session-recorder.ts` chỉ invalidate `stats` và `tasks`, thuộc `lib/timer` của 1A). Nên thêm `['history']`.
- Nếu Neon có tzdata cũ hơn Node và không biết một múi giờ mới thì `/api/stats` trả 500 cho người đó; có thể bắt lỗi rồi thử lại với UTC. Chưa làm vì PGlite nhận hết các tên hiện có.
- `stats-panel` vẫn cố định khoảng ngày lúc mở panel (`useMemo`); để tab mở qua 04:00 thì phải mở lại panel.
- Cập nhật cột "Trạng thái" batch 1B trong `plan.md` thành xong (tôi không sửa file đó).
