# Phase 03b Enhancement Roadmap

**Status:** Cần triển khai thêm
**Priority:** P1
**Created:** 2026-02-05

## Tình trạng hiện tại

### Đã hoàn thành ✅
- [x] Mascot floating hiển thị trên tất cả trang
- [x] Speech bubble với tips tiếng Việt
- [x] Click mascot → hiện random tip
- [x] Thu nhỏ/mở rộng mascot
- [x] Message queue tránh overlap
- [x] Greeting khi load app lần đầu
- [x] Page-aware expressions (timer→focused, tasks→encouraging)

### Chưa hoàn thành ❌
| Feature | Vấn đề | Độ ưu tiên |
|---------|--------|-----------|
| **SESSION_END event** | Đã định nghĩa nhưng chưa gọi khi timer hết | P0 |
| **TASK_COMPLETE event** | Chưa gọi khi hoàn thành task | P0 |
| **MILESTONE_REACHED** | Chưa gọi khi đạt milestone (5, 10 pomodoros) | P1 |
| **Idle detection** | Chưa có tip khi idle 5+ phút | P2 |
| **Lottie animations** | Dùng placeholder URL, cần asset thật | P2 |
| **Settings toggle** | Chưa có tùy chọn ẩn/hiện mascot | P2 |

---

## Lộ trình phát triển

### Sprint 1: Event Integration (P0) - 2h

**Mục tiêu:** Kết nối các event đã định nghĩa với hành động thực tế

#### 1.1 SESSION_END - Khi hoàn thành pomodoro
```typescript
// src/app/(main)/timer/hooks/use-mascot-events.ts
// Cần detect khi timeLeft = 0 và mode = 'work'
```

**Tasks:**
- [ ] Thêm listener cho `timeLeft === 0` trong `use-mascot-events.ts`
- [ ] Gọi `handleEvent('SESSION_END')` khi pomodoro hoàn thành
- [ ] Hiện speech bubble "Một pomodoro nữa hoàn thành! 🍅"

#### 1.2 TASK_COMPLETE - Khi hoàn thành task
```typescript
// src/stores/task-store.ts hoặc wherever tasks are completed
// Cần inject mascot event khi task.status = 'completed'
```

**Tasks:**
- [ ] Tìm nơi task được mark complete
- [ ] Import `useMascotStore` hoặc dùng `useMascot` hook
- [ ] Gọi `handleEvent('TASK_COMPLETE')` khi complete task
- [ ] Hiện celebration speech bubble

#### 1.3 MILESTONE_REACHED - Khi đạt cột mốc
```typescript
// Detect khi completedPomodoros đạt 5, 10, 15, 20...
```

**Tasks:**
- [ ] Track số pomodoros trong ngày
- [ ] Gọi `handleEvent('MILESTONE_REACHED')` ở các mốc
- [ ] Hiện confetti + celebration message

---

### Sprint 2: Enhanced Interactions (P1) - 3h

**Mục tiêu:** Mascot thông minh và tương tác hơn

#### 2.1 Contextual Tips
- [ ] Tip khác nhau dựa trên page hiện tại
- [ ] Timer page: tips về tập trung
- [ ] Tasks page: tips về quản lý công việc
- [ ] Progress page: tips về theo dõi tiến độ

#### 2.2 Time-aware Behavior
- [ ] Sáng (5-12h): Greeting buổi sáng, tips năng lượng
- [ ] Trưa (12-14h): Nhắc ăn trưa, nghỉ ngơi
- [ ] Chiều (14-18h): Tips duy trì năng suất
- [ ] Tối (18-22h): Tips cân bằng cuộc sống
- [ ] Khuya (22-5h): Nhắc nghỉ ngơi, đừng thức khuya

#### 2.3 Idle Detection
- [ ] Track user idle time (no clicks, no timer running)
- [ ] Sau 5 phút idle → hiện encouragement tip
- [ ] Sau 15 phút idle → hiện "Bạn còn đó không?"
- [ ] Không spam - max 1 idle tip mỗi 30 phút

---

### Sprint 3: Rich Animations (P2) - 4h

**Mục tiêu:** Mascot sinh động với Lottie

#### 3.1 Acquire Lottie Assets
**Option A: LottieFiles marketplace**
- Tìm free Shiba Inu animations
- Cần 6 states: happy, focused, sleepy, excited, worried, celebrating

**Option B: AI Generate**
- Dùng AI tools để tạo Shiba animations
- Export sang Lottie format

**Option C: Custom Design**
- Thuê designer tạo Lottie animations
- Đảm bảo consistent style

#### 3.2 Local Asset Storage
- [ ] Download/create Lottie files
- [ ] Store in `/public/mascot/`
- [ ] Update `LottieMascot.tsx` URLs to local paths
- [ ] Fallback to SVG nếu Lottie load fail

#### 3.3 Animation Transitions
- [ ] Smooth transition giữa các expression states
- [ ] Reaction animation khi click (bounce, wiggle)
- [ ] Celebration animation với confetti

---

### Sprint 4: Settings & Preferences (P2) - 2h

#### 4.1 Mascot Settings
- [ ] Toggle show/hide mascot
- [ ] Toggle speech bubbles on/off
- [ ] Tip frequency: High/Medium/Low/Off
- [ ] Animation toggle (respects reduced motion)

#### 4.2 Persistence
- [ ] Save preferences to localStorage
- [ ] Sync với existing settings store

---

### Sprint 5: Gamification Integration (P3) - 3h

**Phụ thuộc:** Phase 04 Gamification

#### 5.1 XP Display
- [ ] Mascot speech bubble hiện "+10 XP!" khi earn XP
- [ ] Animation khi XP gain

#### 5.2 Level Up Celebration
- [ ] Full screen celebration khi level up
- [ ] Mascot với party hat expression
- [ ] Confetti burst

#### 5.3 Achievement Unlocks
- [ ] Mascot announce achievements
- [ ] Special expression cho mỗi achievement type

---

## Implementation Priority

```
Sprint 1 (P0) ─────────────────────────────►
              Event Integration (2h)

Sprint 2 (P1) ────────────────────────────────────────────►
              Enhanced Interactions (3h)

Sprint 3 (P2) ────────────────────────────────────────────────────►
              Rich Animations (4h)

Sprint 4 (P2) ────────────────────────────────────────────────────────────►
              Settings (2h)

Sprint 5 (P3) ──────────────────────────────────────────────────────────────────►
              Gamification (3h) [depends on Phase 04]
```

---

## Quick Wins (Có thể làm ngay)

### 1. Fix SESSION_END event (30 min)
```typescript
// use-mascot-events.ts - thêm vào useEffect
const timeLeft = useTimerStore((state) => state.timeLeft);

useEffect(() => {
  if (timeLeft === 0 && prevModeRef.current === 'work') {
    handleEvent('SESSION_END');
  }
}, [timeLeft, handleEvent]);
```

### 2. Fix TASK_COMPLETE event (30 min)
```typescript
// Tìm task completion handler và thêm:
import { useMascotStore } from '@/stores/mascot-store';

const handleEvent = useMascotStore.getState().handleEvent;
handleEvent('TASK_COMPLETE');
```

### 3. Add more tips (15 min)
```typescript
// src/components/mascot/messages/tips.ts
// Thêm nhiều tips hơn cho variety
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Events triggered correctly | 100% |
| Speech bubbles display properly | No overflow/cutoff |
| Animation smoothness | 60fps, no jank |
| User engagement | Click rate > 5% |
| Message variety | >20 unique messages |

---

## Next Steps

1. **Immediate:** Implement Sprint 1 (Event Integration)
2. **This week:** Complete Sprint 2 (Enhanced Interactions)
3. **Next week:** Sprint 3-4 (Animations + Settings)
4. **After Phase 04:** Sprint 5 (Gamification Integration)
