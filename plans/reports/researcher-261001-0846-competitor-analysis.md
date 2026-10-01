# Study Bro Competitor Analysis Report

## 1. FEATURE MATRIX

| Feature | Pomofocus | Forest | Focusmate | Flocus | Toggl | Be Focused | Notion Templates | PomoSpot | NoDistraction |
|---------|-----------|--------|-----------|--------|-------|-----------|------------------|----------|---------------|
| PWA/Offline | ✓ | ✗ | ✗ | Partial | ✗ | ✗ | ✗ | ✓ | ✗ |
| Background Notifications | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Streaks/Daily Goals | ✗ | ✓✓ | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Weekly Reports/Email | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Calendar Integration | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓✓ | ✗ | ✓ |
| Data Export (CSV) | ✗ | ✗ | ✗ | ✗ | ✓✓ | ✗ | ✓ | ✗ | ✗ |
| Body-Doubling/Co-working | ✗ | ✗ | ✓✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Social/Friends | ✗ | ✓ | ✓✓ | ✗ | ✗ | ✗ | Partial | ✗ | ✗ |
| Gamification (Trees/XP/Badges) | ✗ | ✓✓✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Cross-Device Sync | ✗ | ✓ | ✓ | ✓ | ✓✓ | ✓ | ✓ | Partial | ✓ |
| Keyboard Shortcuts | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Distraction Blocking (Extension) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (Pro) | ✗ | ✗ | ✓✓ |
| Mobile App (Native) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Spotify/Music Integration | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | Partial | ✓✓ | ✗ |
| Templates/Presets | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓✓ | ✗ | ✗ |
| Accessibility (WCAG) | ✗ | Partial | Partial | ✗ | Partial | ✗ | ✗ | ✗ | ✗ |

**Key:** ✓=has it, ✓✓=strong impl, ✓✓✓=flagship feature, ✗=missing

## 2. TOP 8 FEATURES: Value × Feasibility for Study Bro

Ranked by (user impact for students) × (dev effort on Next.js+Supabase):

1. **Streaks & Daily Login Rewards** [HIGH]  
   *Habit formation driver; fire/flame badges reset at midnight UTC; store last_active_date in user table; 1-2 days* → Massive engagement lift for recurring users.

2. **Background Notifications (Service Worker Push)** [HIGH]  
   *Timer completes in background tab; wake user from sleep; 2-3 days* → Core UX need; separates from web-only competitors.

3. **Weekly Progress Email + In-App Report** [HIGH]  
   *7-day stats: sessions, focus time, streak, best day; template-based Resend API; 1-2 days* → Retention via email, social proof.

4. **Todoist/Google Calendar Sync** [HIGH]  
   *OAuth flow; read task lists; log completed pomodoros back; 3-4 days* → Plugs into student workflows; Study Bro becomes a capture point.

5. **Gamified Levels/XP System** [MEDIUM]  
   *Earned per session; unlocks themes/sounds; no paywalls; 2-3 days* → Engagement hook; lower cost than Forest's tree ecosystem.

6. **Mobile-Responsive + Installable PWA** [MEDIUM]  
   *Already have Next.js; add Web App Manifest + offline SW; 1-2 days* → Existing; polish notifications + offline fallback.

7. **CSV Data Export + Private Stats Dashboard** [MEDIUM]  
   *Download all sessions; total focus hrs/wk; best streak; build trust; 1 day* → Differentiator; appeals to privacy-conscious students.

8. **Keyboard Shortcuts (Start/Pause/Skip) + Dark Mode Theme Toggle** [MEDIUM]  
   *Global hotkey via Cmdk or native Electron-like binding; persistent theme choice; 1 day* → QoL for power users; cheap win.

## 3. BEST PRACTICES: Web Pomodoro Timers

**Accurate Timing (Never Use setInterval):**  
- Store `deadline = now + duration` on session start; recalculate display every 100ms from `Date.now()`
- Survives tab throttling, page refresh, device suspend
- Source: https://hackwild.com/article/web-worker-timers/

**Background Accuracy (Web Workers):**  
- Offload countdown to Worker thread; main thread stays responsive
- Worker posts updates every 100ms; keeps accuracy to millisecond over hours
- Source: GitHub pomodoro-pwa projects

**Offline + Push (Service Worker + Notification API):**  
- SW precaches app shell; IndexedDB stores sessions
- On timer end: SW triggers `showNotification()` even if page closed
- UX: Don't ask permission on load → user action → *then* requestPermission()
- Source: https://developer.chrome.com/blog/push-notifications-on-the-open-web/

**Screen Wakelock (Wake Lock API):**  
- `navigator.wakeLock.request('screen')` prevents sleep during focus session
- Handle `visibilitychange` → release lock when tab hidden, re-acquire on visible
- Browser support: Chrome 84+, Edge, Opera; not Safari/Firefox
- Source: https://whatpwacando.today/wake-lock/

**Page Visibility → Graceful Degradation:**  
- Pause visual updates if `document.hidden`; resume on visible
- Don't stop timer—only pause UI to save battery on background tab

## 4. MONETIZATION PATTERNS

**Freemium Playbook (Most Common):**  
- **Free Tier:** unlimited sessions, basic timer, task tracking, local history
- **Premium ($2.99–10/mo, $18–36/yr):** analytics, advanced reports, integrations (Todoist/Cal), themes, no ads
- **Examples:** Focus To-Do ($2.99/mo), Pomofocus Pro ($3/mo), TickTick ($3.99/mo)

**Focusmate Model (Body-Doubling):**  
- 3 sessions/wk free → $8/mo ($12/mo monthly) unlimited
- Proof: social/accountability is premium lever

**Forest Model (Aspirational Gamification):**  
- Free: core timer + basic trees
- IAP: $3.99 unlock 100+ species; real-tree planting charity (meta-monetization)

**Bundling Strategy:**  
- Offer "Study Bundle": timer + ambient sounds + pomodoro templates for $4.99/mo
- Cheaper than separate apps; perceived value high

**No-Paywall Alternative (Positioning):**  
- TomatoTimers (free, no ads, no premium) competes on *trust* → rare, memorable
- Study Bro could do hybrid: free core + optional "Pro" (integrations/reports) to differentiate

---

## Unresolved Questions

- Which student cohort (HS vs college vs working professionals) to target first for GTM?
- Price sensitivity for Vietnamese student audience vs US/EU?
- Roadmap priority: integrations (Todoist/Cal) vs gamification (trees/XP)?
- Feasibility of native mobile apps vs PWA-only for initial launch?
- Cross-device sync: Supabase RLS strategy for offline-first then sync-on-reconnect pattern?

---

**Sources:**
- https://pomofocus.io/app
- https://www.forestapp.cc/
- https://flat.social/guides/focusmate-review
- https://toggl.com/blog/best-work-timers
- https://hackwild.com/article/web-worker-timers/
- https://developer.chrome.com/blog/push-notifications-on-the-open-web/
- https://whatpwacando.today/wake-lock/
- https://goalsandprogress.com/pomodoro-apps-comparison/
- https://flocus.com/features/pomodoro-timer
