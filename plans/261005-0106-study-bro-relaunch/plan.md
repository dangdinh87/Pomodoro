# Study Bro relaunch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: dùng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans để làm từng task. Các bước dùng checkbox (`- [ ]`) để theo dõi.

**Goal:** đưa nhánh `feat/design-system` tới trạng thái sẵn sàng ra mắt trên `https://studywithbro.com`, gồm 4 việc:
- sửa các lỗi lõi;
- rebrand toàn bộ sang "Sticker pop" với linh vật Tomo;
- dựng URL đa ngôn ngữ chuẩn SEO;
- có CI xanh trên một PR nháp.

**Architecture:** thay tại chỗ, đi từ token. Không dựng hệ song song, không thêm feature flag.
- Lỗi lõi được sửa theo TDD ngay ở module đang có (`lib/timer`, `api/stats`, `stores`).
- Rebrand đổi token trong `globals.css` và primitive trong `components/ui`, rồi đi qua từng màn.
- SEO chuyển app sang segment `[lang]`: `/` là EN (x-default), `/vi`, `/ja`. Trang nội dung render static.
- Ra mắt qua PR nháp để CI chạy `next build`. Không merge, không deploy.

**Tech Stack:** Next.js 16 App Router (`src/proxy.ts`), React 19, Tailwind v4 (`@theme inline`), zustand 5, TanStack Query, Drizzle (PGlite local / Neon prod), Better Auth, `motion/react`, Phosphor icons, vitest + Testing Library, i18n tự viết (`src/i18n/locales/{en,vi,ja}.json`).

**Spec:**
- `docs/superpowers/specs/2026-10-05-sticker-pop-rebrand-design.md`
- prompt chủ dự án `plans/261005-0106-study-bro-relaunch/prompt.md`
- báo cáo tổng `plans/reports/analysis-261005-0022-pomodoro-standardization-master.md`

## Phases & batches

Bốn file `phase-0N-*.md` dự kiến ban đầu không được viết: viết code mẫu đầy đủ trong plan rồi code lại sẽ thành làm hai lần. Thay vào đó, mỗi phase chia thành **batch**. Mỗi batch giao cho một agent thực thi theo TDD, kèm danh sách việc và danh sách file được chạm. Agent ghi kết quả vào `plans/reports/implementation-261005-<batch>.md`.

| Batch | Nội dung | Song song với | Trạng thái |
|---|---|---|---|
| 1A | Ghi phiên: khách luôn được ghi (`ensureSession`), rate limit khách, `completedFullSession`, `client_session_id` + migration, `endedAt`, trần 24h trong transaction | 1B | **xong** b643e24…f292c88 (migration 0002) |
| 1B | Thống kê theo múi giờ người dùng + ranh giới 04:00, aggregate SQL (stats, history, streak, export) | 1A | **xong** 3b1f004…9158d8f |
| 1C | Timer UX: `autoStartWork=false` + ngừng tự chạy, confirm reset, báo hết phiên chắc chắn (setTimeout đúng mốc, preload, Wake Lock), mục "Chuông & thông báo", chữ thông báo i18n | 2.1 | **xong** 7d9ab80…fc91ba8 |
| 1D | i18n: 5 key thiếu, bỏ `t() \|\| fallback`, toast + Close i18n; ẩn 9 âm câm + test; P2 nhanh (scene Esc, fullscreen, manifest, error homeHref, redirect leaderboard/chat, GA ID) — tách 1D (i18n, copy, âm câm — **xong**), 1E (P2 chức năng — **xong** c2223f6…bb8e542), 1F (tổng hợp chuông + noise bằng ffmpeg — **xong** 631c322, c360dbb) | 2.3, 2.5a | **xong** |
| 2.1 | Nền móng: token sáng/tối, `.btn*`/`.sticker*`, nền giấy kem, font Baloo 2 + Nunito, Sáng/Tối/Hệ thống, 6 preset + test tương phản | 1C | **xong** cdd85b0…a7198ba |
| 2.2 | Thương hiệu: Tomo SVG 5 mặt, Logo, favicon, icon PWA, manifest, OG `next/og`, gỡ sói + `card.jpg` | 1C | **xong** ac18c60…5d6c5f9 |
| 2.3 | Primitive: mọi `components/ui/*` + IconTile, StickerCard, StreakPill, SessionTomatoes, TomoBubble; `text-white` → `text-on-accent` — tách 2.3a (overlay) và 2.3b (control + primitive mới, thêm `--control-edge` cho dark) | 1D, 1E | **xong** 56b34c1…815704d |
| 2.4 | Khung app + timer — 2.4a (status bar, dock, tab bar mobile, ⌘K + `?`, H1 + SSR 25:00) và 2.4b (thẻ đồng hồ, đồng hồ 2D, `pickTomoMood`, bong bóng, SessionCelebration — **xong** 164ed1f…536d804) | 2.5 | 2.4a đang làm |
| 2.5 | Panel — 2.5a (việc, thống kê, cài đặt, góp ý) **xong** 67010d4…215a747; 2.5b (âm thanh, không gian, đồng hồ, arcade + mini timer) **xong** c14cd5c…2e84d9b | 2.4 | **xong** |
| 2.7 | Dọn dẹp sau rebrand: mini player YouTube hiển thị (P1-8), timer/bell settings, follow-up #1 #8 #16 #18 #19 | 3a | chưa làm |
| 2.6 | Trang ngoài app: landing, guide/legal, 404/lỗi/đăng nhập; viết lại `docs/design-system.md` | 2.4a, 2.5b | **xong** 7695916…ab61843 |
| 3.x | `[lang]` routing + hreflang + metadata theo locale + static/ISR + JSON-LD + locale tải động + PGlite động | — | chưa làm |
| 4.x | migrate action, error tracking, rate limit OTP, CSP report, DB hardening, ratchet, dọn code chết, push + PR nháp + CI xanh | — | chưa làm |

Thứ tự: 1A ∥ 1B → 1C → 1D → 2.x → 3.x → 4.x. Batch nào sửa locale JSON thì không chạy song song với batch khác cũng sửa locale, trừ khi cả hai chỉ thêm key ở namespace riêng.

## Global Constraints

- Tên **Study Bro**, domain **studywithbro.com**. Không đổi lại.
- Mặc định đã tự chọn khi chủ dự án chưa trả lời:
  - ẩn 9 âm câm;
  - `autoStartWork=false`;
  - chỉ phiên hết giờ tự nhiên mới +1 pomodoro;
  - không chặn arcade, nhưng có mini timer;
  - giữ region `cle1`;
  - không viết lại lịch sử git.
- **Đa ngữ:**
  - Mọi chuỗi mới có đủ en, vi, ja, viết tự nhiên.
  - VI xưng "bạn", Tomo tự xưng "mình", viết hoa đầu câu.
  - JA dùng giọng thân thiện, lịch sự vừa phải.
  - Không dùng mẫu `t('x') || 'fallback'`.
  - `pnpm i18n:check` phải xanh.
- **Phiên khác đang làm tính năng thời tiết trên cùng thư mục**, gồm:
  - `src/app/api/weather/*`, `src/lib/weather/*`, `src/hooks/use-weather-sync*`;
  - `src/components/settings/weather-settings.tsx`, `src/stores/weather-store.ts`;
  - hunk `weather` trong locale, Permissions-Policy trong `next.config.ts`.
  Quy tắc:
  - Không sửa, không stage, không revert phần đó.
  - **Cấm** `git add -A`, `git add .`, `git commit -a`, `git stash`, `git checkout -- <file>`, `git reset --hard`.
  - File dùng chung thì chỉ stage hunk của mình (xem mục bên dưới).
- Làm trên `feat/design-system`, không tạo worktree. Chỉ push và mở PR nháp ở task cuối của phase 04. Không merge, không deploy.
- **Môi trường máy:**
  - Hook chặn lệnh Bash chứa chữ `node_modules`.
  - macOS không có `timeout`.
  - Không kill process theo pattern rộng.
  - Kiểm `df -h /System/Volumes/Data` trước task nặng; dừng nếu còn trống < 5 GB.
  - Không `pnpm build` local khi dev server :3001 đang chạy.
- **Commit:**
  - Nhỏ, theo từng task, message tiếng Việt kiểu conventional giống lịch sử repo.
  - Dòng cuối là `Co-Authored-By: Claude <noreply@anthropic.com>`.
  - Lỗi logic sửa theo TDD: test đỏ trước.
- **Cổng sau mỗi phase:**
  - `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm i18n:check` đều xanh.
  - Chụp Chrome DevTools ở 390×844 và 1440×900, cả sáng và tối, lưu vào `plans/reports/assets-261005-relaunch/` (thư mục ảnh không commit).

### Shared-file staging (dùng cho locale JSON, `next.config.ts` và mọi file có hunk của phiên khác)

```bash
# FILE = file dùng chung; MARK = regex chỉ khớp hunk của mình (vd '"tomo"|taskComplete')
FILE=src/i18n/locales/vi.json; MARK='"tomo"'
python3 plans/261005-0106-study-bro-relaunch/stage-own-hunks.py "$FILE" "$MARK"
git diff --cached -- "$FILE" | grep -i weather && echo "LỖI: lẫn hunk weather" || true
```

`stage-own-hunks.py` stage những hunk khớp `MARK` mà không chứa chữ `weather`, rồi kiểm bản JSON trong index phải parse được.

## Review Focus

Năm loại tình huống mà spec ngầm yêu cầu nhưng dễ lọt test nhất, xếp theo khả năng gây hại cho người dùng:

1. **Khách vừa mở app lần đầu, chưa có phiên ẩn danh, bấm Start rồi để chạy hết giờ.** Phiên phải được ghi và thống kê "Hôm nay" phải tăng. *Test ở phase 01, task phiên khách.*
2. **Người học khuya, phiên chạy từ 23:50 tới 00:15 giờ VN, hoặc tới 03:59.** Phiên phải tính vào ngày học trước, theo ranh giới 04:00 và theo `tz` của người dùng (không phải UTC). Streak không đứt. *Test ở phase 01, task múi giờ.*
3. **Đổi ngôn ngữ giữa phiên** (`/` → `/vi`). Timer, việc đang chọn và panel đang mở (`?panel=`) giữ nguyên, không reload mất trạng thái. Googlebot không gửi Accept-Language thì vẫn nhận 200 kèm HTML đúng ngôn ngữ của URL. *Test ở phase 03, task proxy và switcher.*
4. **Gửi lại cùng một phiên** (mất mạng rồi retry, hoặc hai tab cùng hoàn tất). Chỉ được ghi một lần, không +2 pomodoro. *Test ở phase 01, task `client_session_id`.*
5. **Người dùng bật reduced-motion, dark mode, màn 390px với tiếng Nhật** (chuỗi dài, xuống dòng khác). Không tràn ngang, Tomo và confetti đứng yên, tương phản đạt AA ở mọi bộ màu. *Test ở phase 02: test tương phản preset + checklist chụp màn.*

## Progress log

Mỗi phase xong thì thêm một dòng: ngày, commit đầu và cuối, kết quả 4 gate, đường dẫn ảnh, ghi chú việc bị giữ lại.
