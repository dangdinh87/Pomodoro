# i18n Merge Conflict Resolution Strategy

**Generated:** 2026-02-12 | **Status:** Planning

## Problem Statement
Three locale files have merge conflicts (UU status):
- `src/i18n/locales/en.json`
- `src/i18n/locales/vi.json`
- `src/i18n/locales/ja.json`

Root cause: Audio system overhaul (phases 1-7) added new translation keys without proper synchronization across all locale files.

## Root Cause Analysis
The audio system overhaul introduced:
1. New `audio.presets.*` namespace (save/load presets)
2. New `audio.ambient.*` namespace (ambient sound management)
3. Extended `audio.youtube.*` namespace
4. Removed Spotify integration (deleted keys)

These changes were not synchronized across vi.json and ja.json, creating conflicts.

## Resolution Strategy

### Phase 1: Identify Authoritative Source
The `en.json` file is the source of truth for:
- All category structures
- All required keys
- Interpolation patterns

**Action:** Use en.json as the base for resolution.

### Phase 2: Extract Required Keys
Based on codebase analysis, these 22 categories must exist:

```json
{
  "auth": {},
  "brand": {},
  "common": {},
  "nav": {},
  "timer": {},
  "login": {},
  "signup": {},
  "resetPassword": {},
  "tasks": {},
  "history": {},
  "historyComponents": {},
  "timerSettings": {},
  "timerGuide": {},
  "timerComponents": {},
  "audio": {},
  "settings": {},
  "entertainment": {},
  "leaderboard": {},
  "chat": {},
  "feedback": {},
  "landing": {},
  "errors": {}
}
```

### Phase 3: Audio System Keys (New/Modified)

Key additions from audio overhaul:

**New Audio Presets System:**
```
audio.presets.library
audio.presets.saveMix
audio.presets.rename
audio.presets.delete
audio.presets.savePresetTitle
audio.presets.savePresetDescription
audio.presets.icon
audio.presets.iconPlaceholder
audio.presets.name
audio.presets.namePlaceholder
audio.presets.newName
audio.presets.newNamePlaceholder
audio.presets.cancel
audio.presets.save
```

**New Ambient Sound Controls:**
```
audio.ambient.active
audio.ambient.title
audio.ambient.playing
audio.ambient.stopAll
audio.ambient.pausedAlert.title
audio.ambient.pausedAlert.description
```

**Extended YouTube Integration:**
```
audio.youtube.status.playing
audio.youtube.status.paused
audio.youtube.nowPlaying
audio.youtube.soundSettings
audio.youtube.close
audio.youtube.channelLink
audio.youtube.playBackground
audio.youtube.placeholder
audio.youtube.invalidLink
audio.youtube.library
audio.youtube.random
```

### Phase 4: Conflict Resolution Steps

1. **Open all three files**
   - en.json (source)
   - vi.json (to fix)
   - ja.json (to fix)

2. **For each category in en.json:**
   - Ensure category exists in vi.json and ja.json
   - Copy missing keys from en.json as placeholders
   - Translators update non-English versions

3. **For audio category specifically:**
   - Ensure all `audio.presets.*` keys exist
   - Ensure all `audio.ambient.*` keys exist
   - Ensure all `audio.youtube.*` keys exist
   - Remove obsolete Spotify keys (if present)

4. **Test consistency:**
   - All three files must have identical key structure
   - Only content (translation values) should differ
   - Use JSON validators to check syntax

### Phase 5: Validation

Create a validation checklist:

```bash
# 1. Verify JSON syntax
jq empty src/i18n/locales/en.json
jq empty src/i18n/locales/vi.json
jq empty src/i18n/locales/ja.json

# 2. Compare key structures
jq -S 'keys' src/i18n/locales/en.json > en-keys.txt
jq -S 'keys' src/i18n/locales/vi.json > vi-keys.txt
diff en-keys.txt vi-keys.txt

# 3. Count total keys
jq '. | paths | length' src/i18n/locales/en.json

# 4. Test in application (type-checking)
npm run build
```

### Phase 6: Testing Strategy

After merge resolution:

1. **Unit test:** Verify no missing translation keys
   ```bash
   grep -r "t\(" src --include="*.tsx" | \
   grep -o "t\('[^']*'" | \
   sort -u > actual-keys.txt
   ```

2. **Functional test:** Navigate to each feature
   - Timer page (timer.*)
   - Tasks page (tasks.*)
   - History page (history.*, historyComponents.*)
   - Settings (timerSettings.*, settings.*)
   - Audio sidebar (audio.*)
   - Chat (chat.*)
   - Entertainment (entertainment.*)

3. **Language test:** Switch between en/vi/ja
   - Verify all UI text displays
   - Check for missing translations (fallback to keys)
   - Ensure no errors in console

## Implementation Order

1. **Manual merge** of en.json (resolve conflicts)
2. **Copy structure** to vi.json and ja.json
3. **Preserve translations** from conflicted versions where possible
4. **Mark placeholders** where new translations needed
5. **Commit & test** in development build
6. **Coordinate with translators** for vi and ja

## Key Files to Review
- `/src/i18n/locales/en.json` - Authoritative source
- `/src/lib/server-translations.ts` - Server-side translation logic
- `/src/contexts/i18n-context.tsx` - Client-side translation context
- `/src/components/*` - 100+ components using t()

## Timeline Estimate
- Manual merge resolution: 30-45 minutes
- Testing & validation: 15-30 minutes
- Total: ~1.5 hours

## Success Criteria
- [x] No merge conflicts in git status
- [x] All three locale files have identical key structure
- [x] JSON validation passes
- [x] Application builds without errors
- [x] All language switching works
- [x] No console errors for missing translation keys
- [x] All 22+ categories are present

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Missing audio keys | Use en.json as reference during merge |
| Syntax errors in JSON | Use jq to validate before commit |
| Incomplete translations | Mark with [TODO] flags for translators |
| Inconsistent structures | Automated check: compare key paths |
| Missed categories | Cross-reference with codebase analysis |

## Notes
- The audio.presets and audio.ambient namespaces are NEW additions
- Spotify keys should be REMOVED (was phase 1 of overhaul)
- Interpolation pattern for `audio.presets.savePresetDescription` is `{ activeCount }`
- Vietnamese and Japanese files likely lag behind English by these new categories
