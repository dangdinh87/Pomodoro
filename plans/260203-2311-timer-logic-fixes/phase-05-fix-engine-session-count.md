# Phase 05: Fix Engine Session Count

## Context

The timer engine (auto-complete) ALWAYS increments `sessionCount`, while manual skip in timer-controls only increments for valid sessions (>=50%). This creates inconsistency in long break timing.

## Overview

**Severity:** HIGH
**Effort:** 30m
**File:** `src/app/(main)/timer/hooks/use-timer-engine.ts`

## Root Cause

```typescript
// use-timer-engine.ts:131-132 - ALWAYS increments (BUG!)
const newCount = currentSessionCount + 1;
incrementSessionCount();

// timer-controls.tsx:137-138 - CONDITIONAL (correct)
const newSessionCount = sessionCount + 1;
if (isValidSession) incrementSessionCount();
```

Auto-complete always counts as valid because timer ran to 0% remaining (100% completion). However, the logic should be consistent with controls.

## Analysis

For auto-complete, the session is always valid because:
- Timer reached 0 naturally
- 100% completion rate

So technically, auto-complete SHOULD always increment. The issue is actually in Issue #1 (Phase 01) where controls uses `newSessionCount` before the actual increment.

**Verdict:** This is NOT a bug - auto-complete is correct. The issue is in Phase 01.

## Implementation

No changes needed - auto-complete behavior is correct.

## Related

- Phase 01 fixes the actual session count bug in controls
- This phase is for documentation/clarity only

## Todo List

- [x] Analyze engine vs controls session count logic
- [x] Determine if engine behavior is correct
- [x] Document findings

## Success Criteria

- Understand that auto-complete always counts as valid (100% completion)
- Phase 01 addresses the actual inconsistency

## Status

**RESOLVED** - Not a bug. Auto-complete correctly always increments because timer completed naturally.
