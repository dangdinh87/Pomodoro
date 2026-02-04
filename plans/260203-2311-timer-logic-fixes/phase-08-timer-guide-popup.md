# Phase 08: Timer Guide Popup

## Context

After implementing multiple timer logic fixes and improvements, users need guidance on how to use the timer effectively. A guide popup will help users understand the updated features.

## Overview

**Severity:** MEDIUM (UX)
**Effort:** 1.5h
**Files:** New component + i18n updates

## Requirements

### Functional
1. Show guide popup on first visit OR when major updates occur
2. Explain key timer features:
   - Mode switching (Work/Short Break/Long Break)
   - Session counting and long break trigger (4 valid sessions)
   - What counts as a valid session (>=50% completion)
   - Auto-start settings
   - Keyboard shortcuts (Space, R)
   - Task association
3. "Don't show again" checkbox
4. Persist user preference in localStorage

### Non-Functional
- Mobile responsive
- Accessible (keyboard navigation, screen reader)
- i18n support (en, vi)

## Architecture

### Component Structure
```
src/components/timer/
└── timer-guide-dialog.tsx  (new)
```

### State Management
- localStorage key: `timer-guide-shown-v1`
- Version suffix for future updates (v2, v3...)

### Trigger Logic
```typescript
// In enhanced-timer.tsx or timer page
const [showGuide, setShowGuide] = useState(false);

useEffect(() => {
  const hasSeenGuide = localStorage.getItem('timer-guide-shown-v1');
  if (!hasSeenGuide) {
    setShowGuide(true);
  }
}, []);

const dismissGuide = (dontShowAgain: boolean) => {
  if (dontShowAgain) {
    localStorage.setItem('timer-guide-shown-v1', 'true');
  }
  setShowGuide(false);
};
```

## Design

### Guide Content Structure

```
┌─────────────────────────────────────────────────────┐
│  🎯 Hướng dẫn sử dụng Timer                    [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ⏱️ Chế độ làm việc                                │
│  • Work: 25 phút tập trung                         │
│  • Short Break: 5 phút nghỉ ngắn                   │
│  • Long Break: 15 phút nghỉ dài (sau 4 phiên)      │
│                                                     │
│  ✅ Phiên hợp lệ                                   │
│  • Hoàn thành ≥50% thời gian mới được tính         │
│  • Skip sớm sẽ không tính vào chu kỳ               │
│                                                     │
│  ⌨️ Phím tắt                                       │
│  • Space: Bắt đầu/Tạm dừng                         │
│  • R: Đặt lại timer                                │
│                                                     │
│  📋 Liên kết Task                                  │
│  • Chọn task để theo dõi tiến độ                   │
│  • Pomodoro sẽ tự động ghi nhận vào task           │
│                                                     │
│  ⚙️ Cài đặt                                        │
│  • Tùy chỉnh thời gian trong Settings              │
│  • Bật/tắt tự động chuyển chế độ                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [ ] Không hiện lại          [Đã hiểu, bắt đầu!]  │
└─────────────────────────────────────────────────────┘
```

### Mobile Layout
- Stack vertically
- Scrollable content
- Full-width buttons

## Implementation Steps

### Step 1: Create Guide Dialog Component

```typescript
// src/components/timer/timer-guide-dialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/contexts/i18n-context';
import { Timer, CheckCircle, Keyboard, ListTodo, Settings } from 'lucide-react';

interface TimerGuideDialogProps {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export function TimerGuideDialog({ open, onClose }: TimerGuideDialogProps) {
  const { t } = useI18n();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <Dialog open={open} onOpenChange={() => onClose(dontShowAgain)}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎯 {t('timerGuide.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Modes Section */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Timer className="h-4 w-4" />
              {t('timerGuide.modes.title')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• {t('timerGuide.modes.work')}</li>
              <li>• {t('timerGuide.modes.shortBreak')}</li>
              <li>• {t('timerGuide.modes.longBreak')}</li>
            </ul>
          </div>

          {/* Valid Session Section */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {t('timerGuide.validSession.title')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• {t('timerGuide.validSession.rule')}</li>
              <li>• {t('timerGuide.validSession.skip')}</li>
            </ul>
          </div>

          {/* Keyboard Section */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              {t('timerGuide.keyboard.title')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd> {t('timerGuide.keyboard.space')}</li>
              <li>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">R</kbd> {t('timerGuide.keyboard.reset')}</li>
            </ul>
          </div>

          {/* Task Section */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              {t('timerGuide.task.title')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• {t('timerGuide.task.select')}</li>
              <li>• {t('timerGuide.task.auto')}</li>
            </ul>
          </div>

          {/* Settings Section */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('timerGuide.settings.title')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• {t('timerGuide.settings.customize')}</li>
              <li>• {t('timerGuide.settings.autoStart')}</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Checkbox
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            {t('timerGuide.dontShowAgain')}
          </label>
          <Button onClick={() => onClose(dontShowAgain)}>
            {t('timerGuide.gotIt')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 2: Add i18n Strings

**en.json:**
```json
{
  "timerGuide": {
    "title": "Timer Guide",
    "modes": {
      "title": "Work Modes",
      "work": "Work: 25 min focused work",
      "shortBreak": "Short Break: 5 min rest",
      "longBreak": "Long Break: 15 min rest (after 4 sessions)"
    },
    "validSession": {
      "title": "Valid Sessions",
      "rule": "Complete ≥50% to count as valid",
      "skip": "Early skip won't count toward cycle"
    },
    "keyboard": {
      "title": "Keyboard Shortcuts",
      "space": "Start/Pause",
      "reset": "Reset timer"
    },
    "task": {
      "title": "Task Linking",
      "select": "Select a task to track progress",
      "auto": "Pomodoros auto-record to task"
    },
    "settings": {
      "title": "Settings",
      "customize": "Customize durations in Settings",
      "autoStart": "Toggle auto-start between modes"
    },
    "dontShowAgain": "Don't show again",
    "gotIt": "Got it, let's start!"
  }
}
```

**vi.json:**
```json
{
  "timerGuide": {
    "title": "Hướng dẫn sử dụng Timer",
    "modes": {
      "title": "Các chế độ",
      "work": "Work: 25 phút tập trung",
      "shortBreak": "Short Break: 5 phút nghỉ ngắn",
      "longBreak": "Long Break: 15 phút nghỉ dài (sau 4 phiên)"
    },
    "validSession": {
      "title": "Phiên hợp lệ",
      "rule": "Hoàn thành ≥50% mới được tính",
      "skip": "Skip sớm sẽ không tính vào chu kỳ"
    },
    "keyboard": {
      "title": "Phím tắt",
      "space": "Bắt đầu/Tạm dừng",
      "reset": "Đặt lại timer"
    },
    "task": {
      "title": "Liên kết Task",
      "select": "Chọn task để theo dõi tiến độ",
      "auto": "Pomodoro tự động ghi nhận vào task"
    },
    "settings": {
      "title": "Cài đặt",
      "customize": "Tùy chỉnh thời gian trong Settings",
      "autoStart": "Bật/tắt tự động chuyển chế độ"
    },
    "dontShowAgain": "Không hiện lại",
    "gotIt": "Đã hiểu, bắt đầu!"
  }
}
```

### Step 3: Integrate into Timer Page

```typescript
// In enhanced-timer.tsx or timer page.tsx
import { useState, useEffect } from 'react';
import { TimerGuideDialog } from '@/components/timer/timer-guide-dialog';

const GUIDE_VERSION = 'v1'; // Increment on major updates
const GUIDE_STORAGE_KEY = `timer-guide-shown-${GUIDE_VERSION}`;

export function EnhancedTimer() {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem(GUIDE_STORAGE_KEY);
    if (!hasSeenGuide) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setShowGuide(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseGuide = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem(GUIDE_STORAGE_KEY, 'true');
    }
    setShowGuide(false);
  };

  return (
    <>
      {/* Existing timer content */}
      <TimerGuideDialog open={showGuide} onClose={handleCloseGuide} />
    </>
  );
}
```

## Todo List

- [ ] Create `timer-guide-dialog.tsx` component
- [ ] Add i18n strings to en.json
- [ ] Add i18n strings to vi.json
- [ ] Integrate into enhanced-timer.tsx
- [ ] Test on desktop and mobile
- [ ] Test "don't show again" functionality
- [ ] Verify version-based reset works

## Success Criteria

1. Guide popup appears on first visit
2. "Don't show again" persists preference
3. Version suffix allows forcing guide on major updates
4. Content is clear and helpful
5. Responsive on mobile devices
6. Accessible via keyboard

## Future Enhancements

- Add step-by-step carousel/wizard format
- Include GIF/video demonstrations
- Add "Show guide" button in settings for manual access
- Track analytics on guide completion
