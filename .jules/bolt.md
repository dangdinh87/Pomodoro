## 2024-05-24 - [Unused Dependencies]
**Learning:** `svg-dotted-map` was found to be unused in `src`.
**Action:** Removed `svg-dotted-map` on 2025-02-18 (simulated).

## 2025-02-18 - [Streak Tracking]
**Learning:** Streak tracking backend uses UTC dates, which may mismatch with frontend local dates. Future improvement should pass client timezone to backend.
**Action:** Refactored `StreakTracker` to use server-side data despite this limitation.
