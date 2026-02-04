# Pomodoro Session Management Best Practices

## Issue Summary
Session count inconsistency when skipping <50% sessions + auto-complete recording full duration instead of actual.

## Key Findings

### 1. Session Count Tracking (Increment Timing)
**Standard Practice:** Increment on **completion**, not start. Only count sessions that reach meaningful thresholds.
- Wikipedia/Cirillo: Record pomodoros only after completion
- Apps track interruptions separately, don't decrement session counts
- **Issue Root:** Likely incrementing on start; should require minimum threshold (50%+ duration)

### 2. Long Break Interval Logic
**Standard Rule:** 4 sessions → 15-30 min break
- 25min work + 5min short break (repeated 4x) = 120min total
- Then 15-30min long break
- Sessions must be **completed** to count toward the 4-session cycle
- **Action:** Skipped sessions <50% should NOT count toward the 4-session counter

### 3. Duration Recording
**Best Practice:** Track **actual elapsed time**, not configured duration
- Session/Time Stream: Configurable notifications at set points (2min before end, 10min reminders)
- **Issue Root:** Auto-complete likely records `config.duration` instead of `Date.now() - session.startTime`
- Pause handling: Don't include pause intervals in final duration

### 4. Session Validation Threshold
**Recommendation:** Minimum 50% completion to count as valid session
- Completes: Duration ≥ 50% of configured duration
- Skipped/Abandoned: < 50% = don't increment count, don't start long-break timer
- Use: `actual_duration / config_duration ≥ 0.5`

## Recommended Fixes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Session count jumps on skip | Increment on start | Increment only on completion + validate 50% threshold |
| Auto-complete records full duration | Reading `config.duration` | Use `Date.now() - startTime` minus pause intervals |
| Long break after skipped session | Counting incomplete sessions | Filter: only count sessions where `completion_ratio ≥ 0.5` |

## Implementation Checklist
- [ ] Move session increment to completion handler + add `completion_ratio` validation
- [ ] Change duration recording: `elapsed_time = actual_end - start_time - pause_time`
- [ ] Filter long-break counter: `completed_in_cycle = sessions where completion_ratio ≥ 0.5`
- [ ] Add `completion_ratio` field to session schema
- [ ] Test: skip session at 40% → count=0, skip at 60% → count=1

## Sources
- [Pomodoro Technique 101 - Asana](https://asana.com/resources/pomodoro-technique)
- [Pomodoro Technique - Wikipedia](https://en.wikipedia.org/wiki/Pomodoro_Technique)
- [Session Pomodoro Timer App](https://www.stayinsession.com/)
- [Time Stream Timer Help](https://my.timestream.app/help/timer)
