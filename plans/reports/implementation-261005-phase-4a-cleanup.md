# Phase 4a: dọn code chết, dependency thừa, file sót

Ngày 2026-10-05, nhánh `feat/design-system`. Chỉ commit cục bộ, không push.

## Kết quả ngắn

- Xoá 20 file code chết (~2.965 dòng), gỡ 3 dependency, thu gọn 2 store (timer v3, audio v4, đều có `migrate` + test), làm xong follow-up #5 và #21.
- **Chưa làm được: xoá file sót** (`migrations/`, `supabase_schema.sql`, `fix_sessions_rls.sql`, `public/images/*`). Lệnh `rm -r` bị bộ phân loại quyền của phiên chặn ("Irreversible Local Destruction"). Tôi không lách bằng `git rm` hay chia nhỏ lệnh. Xem mục "Việc chờ chủ dự án".

## Cách chứng minh "không dùng"

1. Script đồ thị import riêng (tĩnh, `import()`, `require`, entry là mọi `page/layout/route/...` của `src/app`, `proxy.ts`, `instrumentation.ts`, config và `scripts/`): liệt kê file không với tới được từ entry, tách riêng file chỉ test mới với tới.
2. `pnpm dlx knip --no-progress` (không cài vào dự án): ra đúng cùng 20 file + 3 dependency.
3. `grep -F` tên file, tên export, tên package trên `src scripts docs` và các file cấu hình. Gồm cả `/dev/ui` (route thật, nằm trong đồ thị) và các file WIP thời tiết.
4. Sau khi xoá, chạy lại script đến khi hết file mồ côi (không còn chuỗi xoá dây chuyền).

Không có file nào "chỉ test mới dùng" nên không phải xoá kèm test.

## File đã xoá (commit `e9d8968`)

| File | Bằng chứng |
|---|---|
| `animate-ui/components/animate/{tabs,tooltip}.tsx`, `components/buttons/{button,ripple}.tsx` | 0 import. Dock dùng `ui/tooltip`, không dùng bản animate-ui (dòng tài liệu nói ngược đã xoá khỏi `docs/design-system.md`) |
| `animate-ui/icons/{bot-message-square,clock}.tsx` | 0 import (chỉ `audio-lines` được `app-dock` dùng) |
| `animate-ui/primitives/animate/{tabs,tooltip}.tsx`, `buttons/{button,ripple}.tsx`, `effects/highlight.tsx` | chỉ được các file animate-ui chết ở trên import |
| `lib/get-strict-context.tsx` | chỉ primitives chết ở trên import |
| `components/audio/youtube/index.ts` | barrel, 0 import (mọi nơi import thẳng từng file) |
| `components/focus/streak-tracker.tsx` | 0 import (thư mục `focus/` rỗng nên mất) |
| `components/ui/{animated-icons,animated-list,scroll-area}.tsx` | 0 import |
| `config/feature-gate.ts` | 0 import |
| `features/app-shell/open-panel-button.tsx` | 0 import |
| `lib/prompts/bro-ai-system.ts` | 0 import (chỉ tài liệu `docs/ai/*` cũ nhắc) |

Lưu ý: vì `feature-gate` chưa từng được nối, cờ `NEXT_PUBLIC_FEATURE_HISTORY` chỉ ẩn UI (palette, dock), không chặn `/api/history` và `/api/stats`. Đây vẫn là P3 chưa xử lý, chỉ là giờ không còn file giả vờ làm việc đó.

## Store

| Thay đổi | Chi tiết |
|---|---|
| `timer-store` v2 -> v3 (`a86d1cb`) | Bỏ plan mode (`usePlan`, `plan`, `currentStepIndex`, `repeatPlan`, `TimerPlanStep`, 5 action) và `settings.showClock`. `migrateTimerState` xoá các field đó khỏi localStorage, không sửa object đầu vào. Engine bỏ nhánh `planStep`; `SessionCycle` bỏ điều kiện `usePlan`. Bỏ luôn khoá i18n `timerSettings.labels.showClock` (3 locale, chỉ stage đúng hunk) |
| `audio-store` v3 -> v4 (`6ff4e00`) | Bỏ `favorites`, `recentlyPlayed`, `audioHistory`, `savedAmbientState`, `audioSettings.fadeInOut` và các action `addToHistory`, `addTo/removeFrom/toggleFavorite`, `addToRecentlyPlayed`, `getAudioStats`, `save/restoreAmbientState`, `resetAudioSettings`, `updateCurrentlyPlayingForAmbients`, `playAudio`, cùng khối re-export cuối file. Bỏ 4 hàm tiện ích + import thừa trong `audio-manager.ts`. Migrate xoá field cũ; chuỗi migrate v2 -> v4 vẫn chạy (có test). Dọn 2 comment cũ (`renamed from 'volume'`, `changed from string[]`) = follow-up #5 |
| `docs/audio-system.md` | Sửa theo store mới (mô tả `setActiveSource` lưu/khôi phục ambient đã sai từ trước) |

Mỗi action trên được grep đều 0 tham chiếu ngoài chính store (kể cả test và WIP thời tiết) trước khi xoá.

## ⌘K Skip (follow-up #21, commit `45b18e6`)

- Mới `features/timer/lib/request-skip.ts`: `requestTimerSkip()` + `registerTimerSkip()`, cùng kiểu với `requestTimerReset`.
- `TimerControls` đăng ký handler khi mount (luật skip, xác nhận khi đang chạy, ghi phiên vẫn ở một chỗ). Nút Skip và lệnh ⌘K cùng gọi `requestTimerSkip()`. Bỏ `pressSkipButton` (tìm nút theo aria-label).
- Test: unit `request-skip.test.ts` (đăng ký, thay thế, cleanup cũ không xoá handler mới); `timer-controls-skip.test.tsx` thêm 3 ca (ghi phiên như nút, hỏi xác nhận khi đang chạy, false khi đã unmount); `command-palette.test.tsx` đổi sang kiểm gọi `requestTimerSkip`.
- Kiểm trên trình duyệt: ⌘K -> "Skip session" khi tạm dừng chuyển work -> shortBreak kèm toast "không ghi"; khi đang chạy mở hộp "Skip this session?".

## Dependency (commit `edb7672`)

| Gói | Bằng chứng | Kết quả |
|---|---|---|
| `@react-three/drei` | 0 import ở mọi nơi | gỡ |
| `@radix-ui/react-scroll-area` | chỉ `ui/scroll-area.tsx` (đã xoá) | gỡ |
| `@floating-ui/react` | chỉ `animate-ui/primitives/animate/tooltip.tsx` (đã xoá); knip cũng báo | gỡ |

`pnpm install` chạy một lần ở cuối; lockfile chỉ có dòng xoá (-354, 0 dòng thêm). Ngay sau đó chạy lại type-check và test.

## Giữ có chủ đích

| Mục | Lý do |
|---|---|
| `ui/loader`, `ui/radio-group`, `ui/table` | Báo cáo cũ ghi là chết nhưng hiện được `/dev/ui` (showcase) import; `loader` còn dùng ở `arcade-panel`; `radio-group` nằm trong `primitives-contrast.test` |
| `@radix-ui/react-radio-group` | `color-preset-picker.tsx` import thẳng + `ui/radio-group` |
| `animate-ui/icons/{audio-lines,icon}.tsx`, `primitives/animate/slot.tsx` | `app-dock` dùng `AudioLines` |
| Class `AudioManager` (`play`, `toggleAmbient`, `setFadeSettings`...) và `export default audioManager` | Có test riêng, mock trong test store dựa vào `default`; không có state persist nên để nguyên |
| `isFeatureEnabled('history')` | Còn dùng ở command palette và dock |
| `@testing-library/dom`, `@vitest/coverage-v8` | Peer của RTL / dùng khi chạy coverage, knip không báo |
| `src/hooks/use-confetti.ts` | Đã không còn từ commit `9d1e1c5` |
| `docs/PROJECT_STRUCTURE_REVIEW.md`, `.kilo/worktrees/**` | Tài liệu/bản sao lịch sử nhắc tên file cũ; không phải code chạy |

Knip còn báo "unlisted `server-only`" (4 file) và nhiều export thừa (như `AudioLinesIcon`, các biến thể shadcn `SelectGroup`, `DialogPortal`...). Là hàng chuẩn của shadcn/Next, để nguyên.

## Việc chờ chủ dự án

### 1. File sót chưa xoá (lệnh bị chặn quyền)

Đã grep: không file nào tham chiếu; Drizzle dùng `drizzle/` (`drizzle.config.ts` `out: './drizzle'`, `src/test-utils/test-db.ts` `migrationsFolder: 'drizzle'`); README/CI chỉ nhắc `drizzle/**`.

| Đường dẫn | Ghi chú |
|---|---|
| `migrations/` (12 file SQL, 2 file rỗng) | di sản Supabase (RLS, leaderboard, chat) |
| `supabase_schema.sql` | còn `DROP TABLE` |
| `fix_sessions_rls.sql` | di sản Supabase |
| `public/images/content_1/pomodoro_explain.png` | 3,9 MB, 0 tham chiếu trong `src`, `scripts`, config, `llms.txt`, manifest |
| `public/images/file.svg` | 18 KB, 0 tham chiếu (thêm vào, cùng thư mục) |

Chạy khi đồng ý (mọi thứ vẫn nằm trong git, khôi phục được):

```sh
git rm -r migrations supabase_schema.sql fix_sessions_rls.sql public/images
```

Sau đó commit bằng `commit-own.py --files` liệt kê các đường dẫn đó.

### 2. `.Jules/` và `.jules/`

Cả hai cùng được track: `.Jules/palette.md` (6 dòng) và `.jules/{bolt,palette,sentinel}.md`. Trên đĩa không phân biệt hoa thường chỉ có một thư mục, nội dung file trên đĩa trùng byte với `HEAD:.jules/palette.md` (9 dòng). Git so sánh nó với bản `.Jules/palette.md` 6 dòng nên luôn báo "modified +3". Đã kiểm: khác biệt chỉ là 3 dòng trống, **không có chỉnh sửa thật nào từ phiên khác**. Tôi không động vào.

Cách sửa (một commit, ngoài batch này): `git rm --cached .Jules/palette.md` để chỉ còn `.jules/` (đã là bản đầy đủ hơn). `.vercelignore` đã liệt kê cả hai tên nên không cần đổi.

### 3. `backgrounds-source/`

175 MB, 26 file được track (lớn nhất 21 MB), `prebuild` (`optimize-backgrounds.mjs`) đọc từ đây nên **không xoá khỏi cây làm việc**. Giảm dung lượng clone cần viết lại lịch sử (`git filter-repo` + force-push) hoặc chuyển sang Git LFS/storage riêng, và cần chủ dự án duyệt. Gợi ý: để nguyên đến khi quyết định `card.jpg` (follow-up #7), làm chung một lần viết lại lịch sử.

## Kiểm tra

| Cổng | Kết quả |
|---|---|
| `pnpm type-check` | sạch (trước và sau `pnpm install`) |
| `pnpm lint` | 0 lỗi, 42 cảnh báo (không thêm; bỏ được 1 cảnh báo `state` thừa ở `pauseTimer`) |
| `pnpm test` (sau `pnpm install`) | 1559 pass, 5 fail, toàn bộ ở `weather-mood.test.ts` (WIP thời tiết, follow-up #9) |
| `pnpm i18n:check` | OK, 1366 khoá |
| Trình duyệt :3001 (context `relaunch-4a`) | `/`, `/vi`, `/?panel=sound`, `/?panel=tasks`, `/dev/ui` đều 200, render đủ |

Phát hiện phụ trên trình duyệt, không do batch này:

- `/?panel=sound`: ảnh thumbnail YouTube `img.youtube.com/vi/04RM0CQPLHQ/hqdefault.jpg` trả 404 (video gợi ý trong `src/data/youtube-suggestions.ts` đã bị xoá). Nên thay video khác.
- `/?panel=tasks`: cảnh báo Radix "Missing `Description` or `aria-describedby`" cho `DialogContent` của panel (2 lần). Có sẵn từ trước.
- Trang `/` trong dev có thông báo CSP Report-Only chặn `va.vercel-scripts.com` (chỉ gặp ở dev, thuộc phần CSP của 4b).

## Câu hỏi còn mở

1. Có cho phép xoá `migrations/`, 2 file SQL gốc và `public/images/` không (lệnh ở trên)?
2. `NEXT_PUBLIC_FEATURE_HISTORY` có cần chặn thật ở `/api/history` + `/api/stats` không, hay bỏ hẳn cờ?
