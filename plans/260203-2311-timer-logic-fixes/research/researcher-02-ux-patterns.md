# UX Patterns Research: Timer Mode Switching & Task Validation

## Mode Switch Confirmation Patterns

**Key Finding:** Use confirmation *only* for truly irreversible actions. For running timers:
- **AlertDialog recommended** when switching modes would lose unsaved timer data
- Timer operations are high-friction—users need clear confirmation before disruption
- Modals only effective when rare; overuse = background noise
- Modern approach: Use **Undo pattern** for reversible actions (timer continues, notification appears)

**Best Practice:** If mode switch cancels active session → AlertDialog. If preserving session → inline warning.

---

## AlertDialog vs Inline Confirmation

**Use AlertDialog (modal) for:**
- Irreversible destructive actions (deleting session without saving)
- Actions requiring explicit user focus
- High-stakes decisions in critical workflows

**Use Inline Warnings for:**
- Reversible or less critical actions (theme change, view toggle)
- Non-blocking alerts (bottom toast notifications)
- Preventive design: disable invalid actions upfront

**Mobile Consideration:** Full-screen dialogs, anchor to bottom, enlarge hit targets.

---

## Task-Timer Linking Validation

**Three Scenarios:**

1. **Task Deleted During Session**
   - Toggl Track pattern: Time entries persist even if task deleted
   - Allow session to continue; record with null/orphaned reference
   - Show inline warning: "Task no longer exists"

2. **Task Completed Mid-Session**
   - Similar to deletion
   - Allow session completion
   - Validate before *saving* session (not during)

3. **Before Recording Session**
   - Validate activeTaskId exists + has correct status
   - If invalid: show inline error, prevent save
   - Offer fallback: "Save without task" or "Select new task"

---

## Error Handling Strategy

**At Runtime:** Inline warnings (non-blocking)
- Task missing: "Task no longer available"
- Prevent save, don't kill running timer

**At Save:** AlertDialog
- "Task was deleted. Save session without task?" → Confirm/Cancel
- Or: "Select task before saving"

**Prevention:** Disable invalid action buttons upfront (gray out "Stop & Save" if no valid task).

---

## Implementation Approach

- **Mode switch with active timer** → AlertDialog ("Discard running session?")
- **Task validation on session record** → Inline check + modal only if actionable
- Use `activeTaskId` as source of truth; validate against task store on save
- Red button color for destructive actions (Undo requires special spacing)

---

**Sources:**
- [Modal UX Design Best Practices (LogRocket)](https://blog.logrocket.com/ux-design/modal-ux-design-patterns-examples-best-practices/)
- [Confirmation Dialogs Best Practices (NN/G)](https://www.nngroup.com/articles/confirmation-dialog/)
- [Managing Destructive Actions (Smashing Magazine)](https://www.smashingmagazine.com/2024/09/how-manage-dangerous-actions-user-interfaces/)
- [Toggl Track Task Management](https://support.toggl.com/en/articles/2220738-tasks)
