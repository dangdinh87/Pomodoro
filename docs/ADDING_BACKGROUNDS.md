# Thêm background mới

Hướng dẫn thêm ảnh tĩnh hoặc video background mới vào website để hoạt động đúng với hệ thống pack, tối ưu dung lượng và hiển thị trong Settings.

---

## Tổng quan luồng

1. **Nguồn**: Ảnh/video đặt trong `backgrounds-source/{tên-pack}/`.
2. **Build**: Chạy script `optimize-backgrounds.mjs` → sinh file trong `public/backgrounds/` (AVIF, WebP, thumbnail).
3. **Data**: Khai báo pack và item trong `src/data/background-packs.ts`.
4. **i18n**: Thêm key dịch trong `src/i18n/locales/` (en, vi, ja).

---

## 1. Ảnh tĩnh (static image)

### 1.1. Thêm vào pack có sẵn

**Bước 1 – Đặt file nguồn**

- Thư mục pack hiện có: `travelling`, `classic`, `cyberpunk`, `anime-cozy`, `fantasy`.
- Đặt ảnh vào đúng thư mục pack, ví dụ:
  - `backgrounds-source/classic/my-new-desk.jpg`
- **Tên file = id** (dùng cho code và URL), nên:
  - Chữ thường, nối bằng dấu gạch ngang, ví dụ: `my-new-desk.jpg` → id `my-new-desk`.
  - Tránh khoảng trắng và ký tự đặc biệt.
- Định dạng: `.jpg`, `.jpeg`, `.png`, `.webp`.

**Bước 2 – Chạy script tối ưu**

```bash
node scripts/optimize-backgrounds.mjs
```

Script sẽ tạo:

- `public/backgrounds/full/{id}.avif` (rộng 1920px)
- `public/backgrounds/full/{id}.webp`
- `public/backgrounds/thumb/{id}.webp` (400px, dùng trong picker)

**Bước 3 – Khai báo trong `src/data/background-packs.ts`**

Trong pack tương ứng, thêm một entry bằng helper `img(id, nameKey)`:

```ts
// Ví dụ: thêm vào pack classic
{
  id: 'classic',
  nameKey: 'settings.background.packs.classic',
  descriptionKey: 'settings.background.packDescriptions.classic',
  icon: '🖼️',
  items: [
    img('landscape-cartoon', 'settings.background.presets.background1'),
    img('chill-shiba', 'settings.background.presets.chillShiba'),
    img('study-desk', 'settings.background.presets.studyDesk1'),
    img('my-new-desk', 'settings.background.presets.myNewDesk'),  // ← mới
  ],
},
```

**Bước 4 – Thêm i18n**

Trong `src/i18n/locales/en.json` (và tương tự `vi.json`, `ja.json`), thêm key preset:

- Trong `settings.background.presets`:

```json
"myNewDesk": "My new desk"
```

Không cần thêm key pack nếu pack đã có (ví dụ `classic`).

---

### 1.2. Thêm pack mới (danh mục mới)

**Bước 1 – Tạo thư mục nguồn**

```text
backgrounds-source/my-pack/
  image-1.jpg
  image-2.png
```

**Bước 2 – Cho script biết pack mới**

Mở `scripts/optimize-backgrounds.mjs`, tìm mảng `PACKS` và thêm tên thư mục:

```js
const PACKS = ['travelling', 'classic', 'cyberpunk', 'anime-cozy', 'fantasy', 'my-pack'];
```

Sau đó chạy:

```bash
node scripts/optimize-backgrounds.mjs
```

**Bước 3 – Khai báo pack trong `background-packs.ts`**

Thêm một object mới vào `backgroundPacks` (thứ tự tùy ý, thường đặt trước `travelling` nếu muốn xuất hiện sớm trong danh sách):

```ts
{
  id: 'my-pack',
  nameKey: 'settings.background.packs.myPack',
  descriptionKey: 'settings.background.packDescriptions.myPack',
  icon: '🖼️',
  items: [
    img('image-1', 'settings.background.presets.myPackImage1'),
    img('image-2', 'settings.background.presets.myPackImage2'),
  ],
},
```

**Bước 4 – i18n cho pack và từng ảnh**

Trong `settings.background`:

- `packs.myPack`: tên tab danh mục (ví dụ `"My pack"`).
- `packDescriptions.myPack`: mô tả ngắn hiển thị dưới tab (ví dụ `"Static images for my theme."`).
- `presets.myPackImage1`, `presets.myPackImage2`: tên hiển thị từng ảnh.

Thêm tương tự trong `vi.json` và `ja.json` để đa ngôn ngữ.

---

## 2. Video (ảnh động)

Video dùng cho tab **Ảnh động**, hiện chỉ có pack **lofi-video**.

**Bước 1 – Đặt file**

Đặt file `.mp4` vào:

```text
backgrounds-source/lofi-video/
  my-video.mp4
```

Script sẽ **copy nguyên file** (không encode lại) sang `public/backgrounds/my-video.mp4`.

**Bước 2 – Chạy script**

```bash
node scripts/optimize-backgrounds.mjs
```

**Bước 3 – Khai báo trong `background-packs.ts`**

Trong pack `lofi-video`, thêm item `kind: 'video'` với `value` là đường dẫn public:

```ts
{
  id: 'lofi-video',
  nameKey: 'settings.background.packs.lofiVideo',
  descriptionKey: 'settings.background.packDescriptions.lofiVideo',
  icon: '🎬',
  items: [
    { id: 'day-chill', nameKey: 'settings.background.presets.lofiDay', kind: 'video', value: '/backgrounds/day.mp4' },
    { id: 'night-chill', nameKey: 'settings.background.presets.lofiNight', kind: 'video', value: '/backgrounds/night.mp4' },
    { id: 'my-video', nameKey: 'settings.background.presets.myVideo', kind: 'video', value: '/backgrounds/my-video.mp4' },
  ],
},
```

**Bước 4 – i18n**

Thêm `settings.background.presets.myVideo` (ví dụ `"My video"`) trong en/vi/ja.

---

## 3. Quy ước kỹ thuật

### ID và tên file

- **ID** = tên file không có đuôi (ví dụ `my-scene.jpg` → id `my-scene`).
- Dùng chữ thường, gạch ngang; tránh khoảng trắng và ký tự đặc biệt để tránh lỗi URL và code.

### Đường dẫn sau khi build

- Ảnh full: `/backgrounds/full/{id}.avif` hoặc `.webp` (trình duyệt chọn theo format hỗ trợ).
- Thumb: `/backgrounds/thumb/{id}.webp`.
- Video: `/backgrounds/{tên-file}.mp4`.

### Pack “system”

- Pack **system** có thể vừa có option “System solid color” vừa có ảnh (ví dụ Night light).
- Ảnh đó vẫn nằm trong một thư mục nguồn được script xử lý (ví dụ `cyberpunk/`), id dùng trong `img(...)`; trong `background-packs.ts` có thể đưa item đó vào pack `system` thay vì pack nguồn.

### Migration (nếu đổi đường dẫn cũ)

Nếu trước đây có lưu background theo đường dẫn cũ (ví dụ `/backgrounds/old-name.jpg`), thêm mapping trong `src/data/background-migration.ts`:

```ts
export const PATH_TO_ID_MAP: Record<string, string> = {
  // ...
  '/backgrounds/old-name.jpg': 'new-id',
};
```

Để user đã lưu nền cũ vẫn thấy đúng ảnh sau khi đổi id/path.

---

## 4. Checklist nhanh

- [ ] File nguồn đặt đúng `backgrounds-source/{pack}/`, tên file = id (kebab-case).
- [ ] Chạy `node scripts/optimize-backgrounds.mjs` (với pack mới thì đã thêm vào `PACKS` trong script).
- [ ] Thêm/khai báo pack và item trong `src/data/background-packs.ts` (dùng `img(id, nameKey)` cho ảnh, object `kind: 'video'` cho video).
- [ ] Thêm key trong `settings.background.presets` (và nếu pack mới: `packs.*`, `packDescriptions.*`) ở en, vi, ja.
- [ ] (Tùy chọn) Thêm mapping trong `background-migration.ts` nếu có đổi path/id cũ.

Sau các bước trên, background mới sẽ xuất hiện trong Settings → Background, đúng tab (Ảnh tĩnh / Ảnh động) và hoạt động với opacity, brightness, blur như các background hiện có.
