# Batch 1D: đa ngữ, copy và âm câm

Ngày 2026-10-05 · nhánh `feat/design-system` · commit qua `commit-own.py`.

## Kết quả gate (cuối batch)

| Gate | Kết quả |
|---|---|
| `pnpm type-check` | xanh |
| `pnpm lint` | 0 lỗi, 90 cảnh báo (có sẵn) |
| `pnpm i18n:check` | xanh, 1276 key |
| `pnpm test` | 892 qua, **5 đỏ** ở `src/lib/weather/weather-mood.test.ts` (xem "Việc cần phiên khác") |

5 test đỏ do `MOOD_PRESETS` của WIP thời tiết dùng `birds`, `night-crickets`, `fireplace` (đúng 3 âm câm đã ẩn): clear-day, clear-night, snow, dawn, dusk. Đây là lỗi thật: 5 tâm trạng thời tiết sẽ phát im lặng.

## Theo task

### 1. Âm câm (P0-1)
- Chọn phương án đơn giản nhất: đánh `hidden: true` trên 9 mục catalog (không xoá), `soundCategories` / `soundCatalog.ambient` / `allAmbientSounds` / `findSound` chỉ thấy âm nghe được, danh mục rỗng (`study`) tự biến mất. Có thêm `hiddenAmbientSounds`. Khi chủ dự án thay mp3 thật, chỉ cần bỏ cờ.
- Preset dựng lại bằng âm thật (đã đo `volumedetect`): Cafe = crowd 60 + keyboard 20; Library = ceiling-fan 60 + clock 25; Cozy = campfire 35 + rain-on-window 30 + vinyl 20 (icon 🛋️). Không ẩn preset nào.
- Test mới: `src/lib/audio/sound-assets.test.ts` (mọi file ambient + alarm có thật và >= 50 KB, 9 âm bị ẩn khỏi mọi danh sách, id không trùng, preset chỉ dùng id còn tồn tại) và `src/stores/audio-store.test.ts` (mix cũ có id đã gỡ: bỏ qua id lạ, không ném lỗi).
- File mp3 giữ nguyên trên đĩa.
- Chạy thật (:3001): panel Sound VI và JA không còn mục câm; Cafe tải `crowd.mp3` + `keyboard.mp3`.
- Commit: `c416c7b`.

### 2. Key thiếu (P1-6c)
- Thêm `timerComponents.taskSelector.taskComplete.{title,description,skip,markDone}` và `errors.fieldRequired` (en/vi/ja). Footer hộp thoại hoàn thành việc tự xuống dòng (`sm:flex-wrap`, nút `h-auto whitespace-normal`). Ảnh 390 px: nút xếp dọc, không tràn.
- Test quét `src/i18n/translation-keys.test.ts`: mọi `t('…')` literal và `*Key: '…'` phải có trong `en.json`; không còn `t(x) || …`; key dựng từ id (âm, danh mục, preset, bộ màu) phải có; placeholder dùng `{x}` đơn và giống nhau giữa 3 ngôn ngữ. Chỉ tìm ra đúng 5 key thiếu như audit, và bắt thêm lỗi `{{count}}` (mục 4).
- Commit: `fd44583`, `e0ddb31`, `9884df3`.

### 3. Bỏ `t('x') || 'fallback'`
- Sửa 13 chỗ ở `task-selector.tsx`, `timer-controls.tsx`, `timer-mode-selector.tsx`, `appearance-settings.tsx` (key đều đã có đủ 3 ngôn ngữ).
- **Bỏ qua**: `src/components/settings/general-settings.tsx` (dòng 42 và 89, `|| p.name`, `|| p.description`) vì file có thay đổi thời tiết chưa commit. Đang nằm trong `FALLBACK_PENDING` của test, xoá dòng đó khi file rảnh. File này còn lặp cả mục Giao diện với `appearance-settings.tsx`.
- Commit: `e0ddb31`.

### 4. Chuỗi cứng và toast (P2-3)
- `use-tasks.ts`: lỗi tạo/sửa/xoá/sắp xếp/nhân bản dùng `tasksUi.errors.*`; bỏ toast thành công của tạo, xoá, nhân bản (UI đã thấy kết quả); giữ toast lỗi, giữ toast 429 riêng.
- `use-templates.ts`: 4 toast qua `tasks.templates.toasts.*` (giữ toast thành công vì thay đổi không thấy ngay).
- `use-youtube-player.ts`: 3 toast tiếng Việt cứng thành `audio.youtube.errors.*`.
- Trang lỗi toàn cục `app/global-error.tsx` (chạy ngoài provider) có bộ chữ en/vi/ja riêng ở `src/lib/i18n/global-error-copy.ts`, đọc cookie `app.lang` rồi ngôn ngữ trình duyệt; test giữ chữ khớp `errors.boundary.*`.
- `{{count}} sound{{plural}}` trong mô tả lưu mix hiện ra `({2} sounds{s})` ở cả 3 ngôn ngữ; đổi sang `{count}` và thêm bản số ít `savePresetDescriptionOne`.
- Alt ảnh YouTube "YouTube Thumbnail" thành `alt=""` (ảnh trang trí).
- Sửa lỗi chưa bắt khi PATCH việc thất bại (đánh dấu xong, Chọn): thêm `catch`.
- Test: `use-tasks.test.tsx` cập nhật theo key, thêm ca "tạo xong không toast" và "clone/reorder lỗi".
- Chạy thật: tạo việc không hiện toast; PATCH lỗi ở JA hiện "タスクを更新できませんでした。もう一度お試しください。".
- Commit: `efc4a0a`, `3462bde`, `d7689b2`, `9884df3`, `5f28e6a`.
- **Không đổi**: `Mixed Ambient` trong `audio-store.ts` (1E đã thêm `audio.ambient.mixedLabel`); tên tạm "YouTube Video/Playlist" trong `use-youtube-player.ts` (logic `startsWith('YouTube')` đang dựa vào, chỉ hiện đến khi oEmbed trả về tiêu đề).

### 5. Copy
- **P2-14**: landing, FAQ, guide ghi tối đa 120 phút, có preset 25/5, 50/10, 52/17, 90/20; "khối 90 phút" chỉ vào preset 90/20 (bỏ "chạy hai phiên"). Ghi chú tự chạy trong guide sửa đúng mặc định mới (nghỉ tự bắt đầu, phiên tập trung kế chờ bạn bấm). Test `src/i18n/timer-limits-copy.test.ts` lấy số từ `DURATION_LIMITS` / `DURATION_PRESETS` nên không lệch lại.
- **Số ít**: `tasksUi.showCompletedOne` ("Show 1 completed task", "Hiện 1 việc đã xong", "完了した 1 件を表示"), component chọn key theo số lượng.
- **Nút "Focus" trên việc**: chọn phương án chỉ chọn việc (không đụng timer), đổi thành **Select / Chọn / 選択**, bỏ chọn là **Deselect / Bỏ chọn / 選択を解除**, huy hiệu **Selected / Đã chọn / 選択中**; icon Play/Stop đổi thành Target/X. Copy trống danh sách việc nhắc nút "Chọn" thay vì "Tập trung".
- Commit: `b01027e`, `ee9dc98`, `f205e12`, `404fcbf`.

### 6. Rà vi/ja và bảng thuật ngữ
Đã đọc toàn bộ key 1A–1C (`errors.*`, `timer.*`, `timerSettings.bell.*`, reset dialog, history, sessions). Sửa:

- VI: `errors.network/unauthorized/forbidden` bớt "Vui lòng" lẫn "nhé", bỏ "tài nguyên"; "phiên làm việc" thành "phiên tập trung" (2 chỗ); `Preset` thành "Mẫu có sẵn" / "bản phối" (lưu mix); "Chuông đồng" thành "Chiêng" (gong); "Trời" thành "Bầu trời"; `cellNone` "không tập trung" (mơ hồ) thành "chưa có phút tập trung nào"; "Không có việc" thành "Không gắn việc"; **`guide2.what.p3` dịch nhầm "focus" thành "chế độ toàn màn hình"**, đã sửa.
- JA: "チャイム" trùng tên âm chuông thành "アラーム" (tiêu đề, âm, nghe thử); "作業セッション" thành "集中セッション"; `tooManyRequests` bỏ "集中" (nhầm với từ Focus); footer "All rights reserved." thành "すべての権利を保有します。"; câu thông báo nền tab tự nhiên hơn.
- Giữ nguyên có chủ đích: JA "フォーカスモード" (toàn màn hình) vì "集中" đã là tên chế độ timer. Chính tả VI giữ kiểu cũ nhất quán ("xoá", "hoà", "Huỷ").

**Bảng thuật ngữ**

| Khái niệm | EN | VI | JA |
|---|---|---|---|
| phiên tập trung | focus session | phiên tập trung | 集中セッション |
| nghỉ ngắn / dài | short / long break | nghỉ ngắn / nghỉ dài (chung: giờ nghỉ) | 短い休憩 / 長い休憩 |
| việc | task | việc | タスク |
| hẹn giờ | timer | hẹn giờ (công cụ), đồng hồ (mặt số) | タイマー / 時計 |
| đặt lại | reset | đặt lại | リセット |
| chuông báo | alarm / bell | chuông | アラーム (tên chung), ベル / チャイム (lựa chọn) |
| thông báo | notification | thông báo | 通知 |
| mẫu có sẵn | preset | mẫu có sẵn; bản phối (mix âm) | プリセット |
| mẫu việc | template | mẫu | テンプレート |
| chọn việc | select task | Chọn / Bỏ chọn / Đã chọn | 選択 / 選択を解除 / 選択中 |
| chuỗi ngày | streak | chuỗi ngày | 連続日数 |
| toàn màn hình | focus mode | chế độ toàn màn hình | フォーカスモード |

- Commit: `3980588`, `3e5e17e` (đưa `audio.youtube.errors` ra khỏi `status`), `f205e12`.

## Phát hiện về công cụ commit
`stage-own-hunks.py` có hai lỗi: (1) áp nhiều hunk -U0 trong một patch bị `patch does not apply`; (2) hunk chèn thuần được git đặt theo số dòng **bên mới** nên khi phiên khác thêm dòng thì key bị chèn lệch (ví dụ `audio.youtube.errors` rơi vào trong `status`, `mixedLabel` vào `audio.presets`). Đã sửa (áp từng hunk từ dưới lên, neo số dòng về phía cũ): `05d9360`, `01f8db1`. Các commit trước đó của tôi (`efc4a0a`) và của batch khác có thể đã chèn lệch chỗ; tôi đã dò lại và sửa phần của mình (`3e5e17e`), kéo `audio.ambient.mixedLabel` cho cả 3 ngôn ngữ về đúng chỗ (`9884df3`, `25beb7f`). Working tree còn các hunk "di chuyển" của `shell.panels.*` (`openTimer`, `streak`, `panels`) thuộc batch khác.

## Việc cần phiên khác (không chạm theo luật file)
1. **WIP thời tiết** `src/lib/weather/weather-mood.ts`: thay `birds` (clear-day, dawn), `night-crickets` (clear-night, dusk), `fireplace` (snow). Gợi ý: `wind-in-trees` hoặc `river` thay chim, `wind-in-trees` thay dế, `campfire` thay lò sưởi. Test 5 ca sẽ xanh lại.
2. **5 file chuông giống hệt nhau** (`public/sounds/alarms/*.mp3` cùng md5, 133 747 byte): mục "Chuông & thông báo" của 1C cho chọn 5 chuông mà nghe như một. Cần 4 file thật, hoặc ẩn lựa chọn.
3. `general-settings.tsx`: bỏ 2 `|| p.name`/`|| p.description`, xoá `FALLBACK_PENDING` trong test; mục Giao diện bị lặp với `appearance-settings.tsx`.
4. `use-tags.ts`: `error` không ai hiển thị, thêm thẻ lỗi thì ô nhập vẫn bị xoá im lặng (`tag-manager.tsx`).
5. Vùng thông báo của Sonner có `aria-label` "Notifications alt+T" (tiếng Anh) trong `ui/toaster` (rebrand): nên truyền nhãn dịch.
6. `app/layout.tsx` metadata `title: 'Study Bro App'` còn cứng (1E / 2.2).
7. Mục mixer đã ẩn vẫn nằm trong catalog: khi có mp3 thật cho 9 âm, bỏ `hidden: true` là đủ, test kích thước sẽ kiểm file.

## Ảnh (không commit)
`plans/reports/assets-261005-relaunch/`: `1d-sound-panel-vi-1440.png`, `1d-sound-panel-ja-1440.png`, `1d-task-complete-vi-1440.png`, `1d-task-complete-vi-390.png`, `1d-task-complete-ja-390.png`, `1d-save-mix-ja-1440.png`, `1d-tasks-error-toast-ja-1440.png`.

## Câu hỏi còn mở
- Có muốn chặn luôn lựa chọn chuông khi 5 file chưa khác nhau không (hiện chưa có test bắt, vì sẽ đỏ ngay)?
- Nút "Chọn" có nên đổi thành "chọn + bắt đầu" sau này (kèm 1 dòng tooltip) không? Hiện chỉ chọn việc rồi đóng panel.
