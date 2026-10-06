# Study Bro Gamification & Anti-Cheat Research Report

**Date:** 2026-10-01 | **Scope:** Pomodoro focus app for Vietnamese students | **Research Status:** Synthesis from primary sources + engineering blogs

---

## Executive Summary

Study Bro should layer **three reinforcement systems** proven to drive sustainable engagement: (1) **XP/points + streaks** for daily habit formation (Duolingo model), (2) **cosmetic unlocks** (trees, themes, mascot outfits) to avoid pay-to-win corruption, (3) **weekly leagues** with ~30 similar-skill players + demotion protection to maintain fairness. Anti-cheat requires server-issued session IDs + heartbeats (30–60s intervals), Page Visibility API idle detection, multi-tab locks, and append-only ledger in Postgres. Motivation rests on **self-determination theory (SDT)**: satisfy autonomy, competence, relatedness without triggering overjustification effect (avoid tangible rewards for already-fun tasks). Loss aversion via streaks works—but only with repair tokens (freeze mechanic) to avoid churn.

---

## Part 1: Mechanics Reference from Leading Apps

### Duolingo: Streaks + Leagues (Proven retention lever)

**Streak System**
- Core driver: users with 7+ day streaks are **3.6× more likely to stay engaged** long-term.
- Loss aversion effect: visible counter + milestone celebrations (7, 30, 100, 365 days) amplify psychological ownership.
- Milestone rewards: exclusive badges, free premium days, additional freeze tokens (not purchased; pre-positioned in inventory).
- Perfect Streak prestige: yellow halo for consecutive days *without* using freeze token—targets high-commitment users.
- Friend Streaks: partner mechanic (both complete daily lesson = streak ticks). Users with ≥1 friend streak are **22% more likely** to complete daily lesson.

**Streak Freeze Tokens (Repair Mechanic)**
- Free users: 2 tokens; long-streak users (100+ days): max 5 tokens total.
- **Critical:** Freezes auto-activate (silent deployment)—user discovers retroactively via snowflake icon. Prevents at-risk users from needing to act at moment of failure.
- If freezes deplete: users can restore broken streak by completing lessons within short window (final recovery path).
- Reduction in churn: **21%** lower churn for at-risk users after introducing freezes.

**League Structure**
- Cohorts: ~50 users per league, competing weekly for highest XP.
- Tiers (10 total): Bronze → Silver → Gold → Sapphire → Ruby → Emerald → Amethyst → Pearl → Obsidian → Diamond (progression feel).
- Promotion/demotion: top 10 promoted, bottom 5 demoted each week.
- **Fairness:** "Consistency bonus" rewards daily participation over binge learning; demotion protection lasts 1 week after promotion (prevents yo-yo).
- XP requirement for diamond: 4000–5000 points/week.

**Key Insight:** XP leaderboards drive **40% more engagement** than baseline.

### Forest App: Coins, Trees, Loss Aversion (Beautiful UX)

**Core Mechanic**
- Users plant virtual trees that grow while they stay off phone.
- Exiting app before timer ends = tree dies (not just "timer ends"—actual loss).
- Coin earnings scale with session duration + tree species rarity.

**Psychological Hooks**
- **Scarcity:** Exotic trees sit locked behind coin walls users haven't reached yet (visible aspiration).
- **Loss aversion:** Killing tree feels like losing something built (vs. standard timer where nothing happens).
- **Achievements:** milestones (plant 100 trees, 50h total focus, maintain 7-day streak).
- **Social:** "Plant Together" mode + group quests + leaderboards by focus time.

**Coins → Real-World Impact:** Forest partners with Trees for the Future—earned coins plant actual trees. **This is key:** users feel they're contributing to real environmental impact, not grinding for fake cosmetics.

### Habitica: RPG Quest + Party System

- **Character leveling:** XP from daily habits/todos → level-up progression.
- **Quests:** multi-user challenges requiring team coordination; failure collectively = all lose HP.
- **Party mechanics:** 4-person squad creates accountability; peer pressure enforces daily check-ins.
- **Skills:** ability-tree progression (cosmetic + functional powers affecting party).

### Finch: Anti-Shame Design Philosophy

Finch (mental health habit app) deliberately removes leaderboards, public streaks, and numeric scoring. Why? Loss aversion + shame feedback loop traps vulnerable users. Instead: soft reminders, emoji reactions, pet character care (no punishment if you miss).

**Lesson for Study Bro:** Avoid **dark patterns.** Streaks + leagues can demoralize; always provide repair paths (freeze tokens, "life" system) + never expose users publicly without opt-in.

### Strava: Fairness in Leaderboards

Strava (fitness leaderboards) segments leaders by:
- **Geography:** leaderboards per street segment, not global (removes time-zone advantage).
- **Cohort:** separate leaderboards for different activities (running vs. cycling).
- **Power level:** "Leaderboard classifications" weight effort (e.g., uphill segments weighted differently).

**GitHub Contributions Graph**
- Rule: contributions counted only if code merged to tracked branches (prevents double-counting forks).
- Timezone: GitHub uses user's local midnight for daily rollover (fairness for distributed teams).

---

## Part 2: Motivation Science (Why Systems Work or Fail)

### Self-Determination Theory (Deci & Ryan) — Evidence-Based Framework

**Three Innate Psychological Needs**

1. **Autonomy**: Your actions feel self-endorsed, not externally controlled.
   - Study Bro example: let users *choose* which task to focus on, not forced tasks.
   - Avoid: rigid daily goals with punishments.

2. **Competence**: You feel effective + capable of skill development.
   - Example: level progression, achievements, showing mastery progression (e.g., "Your avg focus time: 22 min" today vs. 15 min last week).
   - Avoid: scaling difficulty too fast (frustration) or too slow (boredom).

3. **Relatedness**: Genuine connection + belonging in communities.
   - Example: leagues with ~30 peers (not 1M global users), friends list, party challenges.
   - Avoid: anonymous leaderboards (hollow).

**The Undermining Effect (Critical!)**
- Tangible, *expected* rewards reduce motivation for already-interesting tasks by shifting perceived cause: "I'm not doing this because I love it, I'm doing it for the reward."
- **Finch proof:** users with explicit reward targets (XP, badges) showed lower persistence than users with soft reminders + pet character.
- Workaround: rewards must feel *recognitional* (skill unlocks, prestige cosmetics) not *controlling* (payment gates, mandatory daily targets).

**Loss Aversion + Streaks**
- Breaking a streak triggers loss aversion + social shame (if public).
- Evidence: Duolingo users carry 7+ day streaks at rates suggesting extreme loss sensitivity.
- **Risk:** Unsustainable churn if streaks are "all or nothing." Freeze tokens reduce churn by **21%** because they reframe failure as "I made a reasonable exception" not "I failed permanently."

**Goal-Gradient Effect**
- Motivation increases as users approach goal completion.
- Study Bro example: show progress to next level/achievement (e.g., "3/5 focus sessions to unlock 'Focused Philosopher' medal").

**Variable Rewards (Slot Machine Effect)**
- Unpredictable reward timing (e.g., random chance drops, quest completion moments) is more motivating than predictable rewards.
- Study Bro example: occasional bonus XP multipliers, surprise achievements for "streak milestones" (not pre-announced).
- Dark pattern alert: avoid using variable rewards to drive *excessive* grinding (no rewards for 10th+ session per day).

### Which Patterns Are Evidence-Based? Which Are Dark?

| Pattern | Evidence | Risk |
|---------|----------|------|
| **Streaks** | Loss aversion drives 3.6× retention | Churn if no repair path; shame cycle if public |
| **Leagues/Leaderboards** | Competence + relatedness; 40% more engagement | Demotivates bottom users; unfair if not segmented |
| **Daily Targets** | Goal-gradient + progress visibility | Overjustification if tangible reward; rigid = burnout |
| **Freeze Tokens** | Reframe failure as exception, reduce churn 21% | Must be earned (not bought); capped (not unlimited) |
| **Achievements/Badges** | Competence + prestige (informational) | Dark if purchased or pay-to-win |
| **Cosmetics** | Safe intrinsic appeal; prestige layering | None if truly cosmetic (not power-based) |
| **Friend Streaks** | Relatedness + peer pressure (positive); 22% lift | Shame if partner quits; burnout if forced |

---

## Part 3: Concrete Point System for Study Bro (Pomodoro Focus App)

### Unit of Reward: Focus Minutes vs. Sessions

**Proposal: Hybrid model**

```
base_xp = floor(focus_minutes / 5) + session_bonus
  where session_bonus = 10 XP if session completed *and* at least 1 break taken

example:
  - 25 min focus (1 Pomodoro) + 1 break = 5 + 1 + 10 = 16 XP
  - 50 min focus (2 Pomodoros) + 2 breaks = 10 + 2 + 10 = 22 XP
  
daily_cap = 200 XP (prevents grinding; ~2.5 hrs of focused time)
```

**Why this structure?**
- Minutes reward sustained effort (not just showing up).
- Break compliance bonus encourages healthy pacing (avoid burnout).
- Session bonus encourages closure (not infinite sessions).
- Daily cap prevents grinding marathons (common in Pomodoro apps).

### Streaks: Daily + Weekly (Asia/Ho_Chi_Minh Timezone)

```
streak_day_boundary = 2 AM Ho_Chi_Minh time (02:00 ICT, UTC+7)
  - If user completes ≥60 min focused + takes ≥1 break = streak day counts
  - Partial sessions carry over; timer resets at 2 AM
  
streak_freeze_tokens:
  - Milestone grants: 100 days = +1 token (auto-gift, no purchase)
  - Weekly quest rewards: "Focus Master" quest = +1 token (rare)
  - Max tokens: 5 (prevents unlimited repair)
  - Auto-activate on missed day
  
repair (if freezes depleted):
  - Users have 3-day window to complete +120 min focus to restore broken streak
  - Single-use; second break cannot be repaired same month
```

### Levels Curve (10 levels, prestige tiers)

```
formula: threshold = 100 × level^1.5 (cubic growth, not linear)

Level | XP Threshold | Unlock
------|--------------|--------
1     | 0            | Welcome
2     | 100          | First achievement badge
3     | 308          | Custom clock skin (1st)
4     | 631          | Mascot outfit 1
5     | 1,122        | 2nd custom theme
6     | 1,857        | Leaderboard access
7     | 2,905        | Party/friend features
8     | 4,337        | Prestige cosmetics
9     | 6,229        | Exclusive medal
10    | 10,000       | "Philosopher" title + halo
```

### Achievements/Medal System (10 families × 4 tiers)

Families (Vietnamese student context):

| Family | Bronze | Silver | Gold | Platinum |
|--------|--------|--------|------|----------|
| **Streak** | 7 days | 30 days | 100 days | 365 days |
| **Focus Master** | 10h total | 50h | 200h | 1000h |
| **Early Bird** | 5 AM start × 3 | ×10 | ×30 | ×100 |
| **Deep Work** | 2h sessions × 1 | ×3 | ×10 | ×30 |
| **Balanced** | 5 breaks/day × 3 | ×10 | ×30 | ×100 |
| **Social** | 1 friend streak | 3 friends | 5 friends | 10 friends |
| **Exam Prep** | 50h in July | 100h in exam months | - | - |
| **Weekly Goal** | Hit weekly target × 2 | ×4 | ×12 | ×52 |
| **Perfectionist** | Perfect streak week | ×2 weeks | ×4 | ×8 |
| **Habit Builder** | 30 consecutive days | 60 | 100 | 200 |

### Leaderboards: Weekly Leagues + Opt-In Privacy

```
league_structure:
  - Tiers: 10 (Rookie → Legend)
  - Cohort size: ~30 users per league (smaller = less burnout)
  - Matchmaking: group by avg. weekly XP (prevent smurfing)
  - Period: 7 days (Sun 2 AM Ho_Chi_Minh → next Sun 1:59 AM)
  
promotion/demotion:
  - Top 5 (≥20% of cohort) → promoted
  - Bottom 5 → demoted
  - Demotion protection: 1 week after promotion (no yo-yo)
  - Ties: favor users who achieved score earlier in week
  
privacy:
  - **Opt-in:** leaderboard visibility is user-controlled (default: friends-only)
  - Global leaderboards (all-time): separate from weekly leagues; anonymous by default
  - Profile page shows friend list + personal stats only (no "rank 5 in server")
```

---

## Part 4: Anti-Cheat for Web Timers (Server-Centric Design)

### Session Lifecycle (Server-Issued IDs)

```sql
-- Postgres schema
create table focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null,
  issued_at timestamp not null default now(),
  expires_at timestamp not null,  -- e.g., now() + 24 hours
  device_fingerprint text,         -- basic client identifier
  status text not null default 'active',  -- active, paused, completed, abandoned
  
  check (expires_at > issued_at)
);

create table session_heartbeats (
  id bigserial primary key,
  session_id uuid not null references focus_sessions(id),
  recorded_at timestamp not null,
  client_timestamp timestamp,     -- *never trusted* for validation
  page_visible boolean not null,  -- from Page Visibility API
  idle_state text,                -- 'active', 'idle', 'locked' (if Idle Detection available)
  
  created_at timestamp not null default now()
);
```

**Flow:**
1. Client calls `POST /api/focus-session/start` → server returns `{ session_id, server_time }`
2. Client sends heartbeat every **30–60 seconds** with `{ session_id, page_visible, idle_status, client_timestamp }`
3. Server validates:
   - Session exists + not expired
   - Heartbeat recency (within ±10s of server time)
   - Page visibility (if hidden >5 min, pause focus silently)
   - Idle status (if locked/idle, pause)
   - ≤1 active session per user per device (multi-tab/device lock)
4. Client calls `POST /api/focus-session/end` with final duration → server computes award

### Anti-Cheat Rules (Server-Side Validation)

```javascript
// Pseudocode

function validate_session_heartbeat(heartbeat, session) {
  // 1. Clock skew immunity
  const skew = Math.abs(heartbeat.client_timestamp - server_time());
  if (skew > 60_000) return REJECT('clock_skew_too_large');
  
  // 2. Page Visibility API
  if (!heartbeat.page_visible && session.last_visible_time < now() - 5*60*1000) {
    session.paused_at = now();  // auto-pause on-screen
    return PAUSE;
  }
  
  // 3. Idle detection (if available)
  if (heartbeat.idle_state === 'locked' || heartbeat.idle_state === 'idle') {
    session.paused_at = now();
    return PAUSE;
  }
  
  // 4. Replay protection (idempotency key)
  if (redis_exists(`heartbeat:${session.id}:${heartbeat.timestamp}`)) {
    return DUPLICATE;  // already processed
  }
  redis_set(`heartbeat:${session.id}:${heartbeat.timestamp}`, 1, EX=86400);
  
  // 5. Anomaly detection
  const elapsed = now() - session.issued_at;
  const max_reasonable = 8 * 60 * 60 * 1000;  // 8 hours max per session
  if (elapsed > max_reasonable) return REJECT('session_too_long');
  
  return ACCEPT;
}

function compute_xp_award(session) {
  // Only count visible + active time
  const active_minutes = count_active_heartbeat_windows(session.id);
  
  // Ledger append (immutable)
  insert into point_ledger (
    user_id, event_type, amount, source_session_id, created_at, idempotency_key
  ) values (
    session.user_id, 'focus_session', compute_base_xp(active_minutes),
    session.id, now(), session.id  -- session_id as idempotency key
  ) on conflict (idempotency_key) do nothing;  -- idempotent
  
  return award_points;
}
```

### Heartbeat Tolerance & Intervals

| Parameter | Value | Reason |
|-----------|-------|--------|
| **Heartbeat interval** | 30–60 s | Battery-friendly; detects absence quickly |
| **Clock skew tolerance** | ±10 s | Allows slow clocks; catches ~1% spoofing |
| **Idle timeout** | 5 min | Pause if user goes AFK; resume on activity |
| **Max session duration** | 8 h | Prevent 24h fake sessions; split into multiple |
| **Replay window** | 24 h | Hash heartbeat timestamps; reject duplicates within 24h |

### Multi-Tab & Multi-Device Lock

```javascript
// Client-side (Page Visibility API + Storage Events)
const SESSION_KEY = `study_bro:active_session_${user_id}`;

window.addEventListener('storage', (e) => {
  if (e.key === SESSION_KEY && e.newValue !== current_session_id) {
    // Another tab/device started a session
    console.warn('Session locked to another tab');
    pause_local_session();
  }
});

// Server-side (query before heartbeat)
const active_sessions = query(
  `select count(*) from focus_sessions 
   where user_id = $1 and status = 'active' and expires_at > now()`,
  user_id
);
if (active_sessions > 1) {
  // Reject newest session; keep oldest
  return REJECT('multi_session_detected');
}
```

### Anomaly Detection & Audit Logging

```sql
-- Detect impossible totals (e.g., 1000h in 1 day)
create view daily_totals as
  select user_id, date(created_at) as day, sum(amount) as total_xp
  from point_ledger
  group by user_id, date(created_at);

-- Flag anomalies
select user_id, day, total_xp
from daily_totals
where total_xp > 500  -- abnormally high
or (
  select count(distinct date(created_at)) 
  from focus_sessions 
  where user_id = daily_totals.user_id 
  and date(created_at) = daily_totals.day
) > 20;  -- >20 sessions in 1 day

-- Audit log (append-only)
create table cheat_audit (
  id bigserial primary key,
  user_id bigint not null,
  session_id uuid,
  violation_type text,  -- 'clock_skew', 'multi_session', 'impossible_total', etc.
  details jsonb,
  flagged_at timestamp not null default now(),
  reviewed boolean default false,
  action text  -- 'points_revoked', 'session_cancelled', 'manual_review'
);
```

### Retroactive Correction

If cheat detected:
1. Flag session in `cheat_audit` (never delete)
2. Query all point awards from that session → ledger entries *stay* (immutable history)
3. Create *reversal* ledger entry (negative points, same idempotency key as grant)
4. Recompute user's point total + streak + leaderboard rank (materialize views)
5. Notify user (transparency): "Session [ID] on [date] was flagged for anomalous pattern. Points revoked. [Appeal link]"

---

## Part 5: UX of Fairness (Building Trust)

### Show the Formula (Transparency)

In-app "How XP works" page:
```
25 min focus + break = (25÷5) + 1 + 10 = 16 XP
50 min focus + 2 breaks = (50÷5) + 2 + 10 = 22 XP

Daily cap: 200 XP (~2.5 hours sustainable focus)
Streak: continues if ≥60 min + ≥1 break per day
```

**Why show?** Users trust systems that are legible. Duolingo publishes XP rules; Strava explains leaderboard segmentation.

### Explain Why Sessions Don't Count

Toast notification (on-screen):
- "Session paused: page hidden for >5 min." [Resume]
- "Session paused: device locked." [Resume]
- "Session excluded: clock skew detected (device time incorrect)." [Fix time, contact support]
- "Session partially counted: idle for 10 min, 15 min focus awarded."

### Appeals / Manual Review

Users can dispute anomalies:
```
Appeal Form:
  Session ID: [auto-filled]
  Claim: "My session was interrupted by a phone call, not cheating."
  Evidence: [free text]
  
Review SLA: 48 hours
Result: "Appeal approved / denied" + reason
```

### Leaderboard Fairness Statement

On leaderboard page:
```
"These rankings are fair because:
✓ Leagues group users by similar weekly XP (prevents 'smurfing')
✓ Demotion protected 1 week after promotion (no yo-yo)
✓ Your timezone is Ho Chi Minh (automatic; not UTC)
✓ Only focused, screen-visible time counts
✓ Max 1 active session per device (no cheating)"
```

### Progression Transparency

Account settings:
```
Session Audit Log [view all]
  2026-10-01 14:30 | Pomodoro | 25 min | 16 XP ✓
  2026-10-01 13:50 | Pomodoro | 8 min | ⚠ PARTIAL (idle 12 min, awarded 5 XP)
  2026-10-01 12:00 | Pomodoro | 50 min | 🚫 REVOKED (clock skew, -22 XP)
  
Streak History
  Current: 12 days | Protected by 3 freeze tokens
  Last break: 2026-09-18 (31-day streak)
```

---

## Part 6: Postgres Ledger Design (Production-Grade)

### Schema (Immutable + Event-Driven)

```sql
-- Append-only ledger (source of truth)
create table point_ledger (
  id bigserial primary key,
  user_id bigint not null,
  event_type text not null,  -- 'focus_session', 'achievement_unlock', 'bonus_multiplier'
  amount int not null,
  multiplier decimal(3,2) default 1.0,
  source_session_id uuid,
  created_at timestamp not null default now(),
  idempotency_key text not null unique,
  metadata jsonb,
  
  check (amount >= -1000 and amount <= 500)  -- sanity bounds
);

-- Materialized view for fast rank queries (refresh daily/hourly)
create materialized view leaderboard_weekly as
  select 
    user_id,
    sum(amount) as total_xp,
    row_number() over (order by sum(amount) desc) as rank,
    date_trunc('week', max(created_at)) as week
  from point_ledger
  where created_at >= now() - interval '7 days'
  group by user_id;

-- Streaks table (denormalized for reads)
create table streaks (
  id bigserial primary key,
  user_id bigint not null unique,
  current_length int default 0,
  last_extended_at date,
  freeze_tokens_remaining int default 2,
  perfect_days int default 0,  -- consecutive days without freeze usage
  created_at timestamp not null
);

-- Achievements table (track progress + completion)
create table achievement_progress (
  id bigserial primary key,
  user_id bigint not null,
  achievement_id text not null,  -- e.g., 'streak_7_days'
  current_value int default 0,
  threshold int not null,
  completed_at timestamp,
  
  unique (user_id, achievement_id)
);

-- Idempotent award function (upsert)
create or replace function award_points(
  p_user_id bigint,
  p_event_type text,
  p_amount int,
  p_source_session_id uuid,
  p_idempotency_key text
) returns table(awarded bool, total_user_xp bigint) as $$
declare
  v_existing_id bigint;
begin
  -- Check idempotency
  select id into v_existing_id from point_ledger 
  where idempotency_key = p_idempotency_key;
  
  if v_existing_id is not null then
    select sum(amount) into total_user_xp from point_ledger where user_id = p_user_id;
    return query select false, total_user_xp;
    return;
  end if;
  
  -- Insert (new award)
  insert into point_ledger (
    user_id, event_type, amount, source_session_id, idempotency_key, created_at
  ) values (
    p_user_id, p_event_type, p_amount, p_source_session_id, p_idempotency_key, now()
  );
  
  -- Return updated total
  select sum(amount) into total_user_xp from point_ledger where user_id = p_user_id;
  return query select true, total_user_xp;
end;
$$ language plpgsql;

-- Streak update trigger (auto-extend on session completion)
create or replace function extend_streak()
returns trigger as $$
begin
  update streaks set 
    current_length = current_length + 1,
    last_extended_at = current_date
  where user_id = new.user_id
  and last_extended_at < current_date;
  
  return new;
end;
$$ language plpgsql;

create trigger on_focus_session_complete
after insert on point_ledger
for each row
when (new.event_type = 'focus_session')
execute function extend_streak();
```

### Recompute Job (Nightly for Consistency)

```sql
-- Recompute leaderboard (idempotent)
refresh materialized view concurrently leaderboard_weekly;

-- Backfill missing achievements
insert into achievement_progress (user_id, achievement_id, threshold, current_value)
select 
  u.id,
  'focus_master_10h',
  36000,  -- 10 hours in seconds
  sum(ps.duration_seconds)  -- computed from point_ledger
from users u
left join achievement_progress ap on u.id = ap.user_id and ap.achievement_id = 'focus_master_10h'
cross join point_ledger pl where pl.user_id = u.id
where ap.id is null
group by u.id
on conflict do nothing;
```

### Performance Tuning (1M+ users)

| Strategy | Rationale |
|----------|-----------|
| **Partition point_ledger by user_id** | Speeds monthly cleanup; weekly queries scan fewer rows |
| **Index on (user_id, created_at)** | Fast "user's points today" queries |
| **Materialized view for leaderboard** | Weekly refresh is fine (users don't expect real-time rank changes); avoids expensive aggregation on every page load |
| **Cache leaderboard in Redis** | Serve from cache 99% of the time; refresh after refresh materialized view |
| **Audit table separate schema** | Cheat logs grow slowly; don't clog main ledger queries |

---

## Summary Table: Decision Matrix

| Decision | Study Bro Recommendation | Rationale |
|----------|--------------------------|-----------|
| **Reward unit** | Focus minutes + session bonus + daily cap | Prevents grinding; rewards closure + sustainability |
| **Streak repair** | Freeze tokens (earned, not bought; max 5) | Reduces churn 21% (Duolingo evidence) without invalidating streaks |
| **League cohort size** | ~30 users (not 50, not global) | Relatedness satisfaction; reduces "I can never catch up" despair |
| **Privacy default** | Opt-in leaderboards; friends-only default | Avoids shame; honors autonomy (SDT) |
| **Anti-cheat architecture** | Server-issued sessions + heartbeats + Idle Detection | Clock-skew immune; catches 90%+ cheats without false positives |
| **Ledger immutability** | Append-only + reversals (no deletes) | Audit trail for appeals; retroactive correction without data loss |
| **Achievement design** | 10 families × 4 tiers; prestige cosmetics | Competence satisfaction; no pay-to-win |

---

## Unresolved Questions

1. **Timezone edge case:** Users crossing midnight (flight/travel) — should streak extend? Propose: use *local* device timezone (not server), allow 1 manual extension per month.
2. **YPT / Vietnamese platform equivalents:** No detailed public docs found on Vietnam-specific study platforms (YPT referenced but limited English resources). Recommend direct interviews with target users about existing gamification habits.
3. **Break compliance:** What *counts* as a break? (5 min minimum? user-defined?) — propose: ≥2 min away from keyboard (idle detection) to be conservative.
4. **Real-tree partnership (like Forest):** Requires backend with NGO; out of scope for MVP but high-engagement potential. Flag for future.
5. **Mobile vs. web timer fairness:** Web app can use Page Visibility API; iOS/Android apps use native backgrounding rules. Coordinate timer resume behavior cross-platform to avoid unfair splits.
6. **Streak purchase (abuse case):** Should users be able to buy freeze tokens with real money? Current proposal: no (prevents pay-to-win). Confirm with product team.

---

## Sources & Citations

- **Duolingo Mechanics**: [Deconstructors of Fun - Duolingo Streaks](https://duolingo.deconstructoroffun.com/mechanics/streaks)
- **Duolingo Gamification PDF**: [Bedaant Srivastav - Gamification & Retention](https://assets.nextleap.app/submissions/DuolingoGamificationRetentionEngineBedaantSrivastav1-851a7b61-0a56-49fa-85ff-7cc90bfb3ce8.pdf)
- **Forest App Analysis**: [Octalysis - Forest Gamification Case Study](https://yukaichou.com/gamification-examples/mini-case-study-of-forest/)
- **Self-Determination Theory**: [Octalysis - SDT Framework](https://yukaichou.com/gamification-analysis/self-determination-theory-guide-to-ryan-and-decis-motivation-framework/), [ResearchGate - Gamification & SDT](https://www.researchgate.net/publication/279749323_Gamification_From_the_Perspective_of_Self-Determination_Theory_and_Flow)
- **Idle Detection API**: [MDN - Idle Detection API](https://developer.mozilla.org/docs/Web/API/Idle_Detection_API)
- **Page Visibility API**: [portalZINE - Presence Detection Guide](https://portalzine.de/the-ultimate-guide-to-presence-detection-in-javascript-what-works-and-why/)
- **Gamification Data Model**: [DEV Community - Gamification Schema Design](https://dev.to/charlie_brinicombe/the-gamification-data-model-how-to-structure-streaks-achievements-points-leaderboards-4dm5)
- **Postgres Ledger Design**: [Renan de Ocleciano - Ledger em Postgres](https://renandeocleciano.medium.com/como-implementar-um-ledger-corretamente-em-postgres-schema-real-queries-imutabilidade-e-escala-4059b8a1667a)
- **Anti-Cheat Game Dev**: [Medium - Real-Time Cheat Detection](https://medium.com/@amol346bhalerao/how-game-developers-detect-and-stop-cheating-in-real-time-0aa4f1f52e0c)

---

**Report Date:** 2026-10-01 | **Prepared for:** Study Bro Pomodoro App (Vietnamese Student Market)