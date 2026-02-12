# Translation Keys Quick Reference

## Category Summary (22 Categories)

| # | Category | Count | Primary Use |
|---|----------|-------|-------------|
| 1 | `auth` | 9 | Authentication flows |
| 2 | `brand` | 2 | Product identity |
| 3 | `common` | 23 | Reusable UI labels |
| 4 | `nav` | 13 | Navigation/sidebar |
| 5 | `timer` | 10 | Pomodoro modes & controls |
| 6 | `login` | 29 | Login page |
| 7 | `signup` | 21 | Signup page |
| 8 | `resetPassword` | 14 | Password reset |
| 9 | `tasks` | 45 | Task management |
| 10 | `history` | 9 | Stats page |
| 11 | `historyComponents` | 31 | Stats sub-components |
| 12 | `timerSettings` | 27 | Timer config UI |
| 13 | `timerGuide` | 28 | Help dialog |
| 14 | `timerComponents` | 5 | Timer UI elements |
| 15 | `audio` | 35 | Ambient sounds & presets |
| 16 | `settings` | 30 | Settings panels |
| 17 | `entertainment` | 52 | Games & minigames |
| 18 | `leaderboard` | 6 | Leaderboard page |
| 19 | `chat` | 35 | AI chat feature |
| 20 | `feedback` | 16 | Feedback form |
| 21 | `landing` | 54 | Marketing landing page |
| 22 | `errors` | 2 | Error messages |

**Total: 500+ translation keys**

## Most Used Categories
1. `landing` - 54 keys (landing page copy)
2. `entertainment` - 52 keys (game labels/instructions)
3. `tasks` - 45 keys (comprehensive task system)
4. `audio` - 35 keys (ambient + presets)
5. `chat` - 35 keys (AI assistant)

## New Keys Added (Audio Overhaul)
These categories were significantly expanded during the audio system overhaul:

- `audio.*` - Complete audio system overhaul
- `audio.presets.*` - Preset save/load system
- `audio.ambient.*` - Ambient sound management
- `audio.youtube.*` - YouTube integration

## Merge Conflict Resolution Checklist

- [ ] Ensure all 22 categories exist at root level
- [ ] Verify `audio` category has all sub-keys
- [ ] Check interpolated keys use correct parameters
- [ ] Test with: `grep -r "t\(" src/ --include="*.tsx" | wc -l`
- [ ] Run type-checking to catch missing keys
- [ ] Verify all 3 locales (en, vi, ja) are synchronized

## File Locations
- Implementation: `/src/i18n/locales/`
  - `en.json` - English
  - `vi.json` - Vietnamese
  - `ja.json` - Japanese
- Usage context: `/src/lib/server-translations.ts` and `/src/contexts/i18n-context.tsx`
- Consumer components: 100+ files in `/src/components/` and `/src/app/`

## Key Structure Pattern
```javascript
{
  "category": {
    "subcategory": {
      "key": "Translated value"
    },
    "action": "Value"
  }
}
```

## Testing Commands
```bash
# Count total translation calls
grep -r "t\(" src --include="*.tsx" | wc -l

# Find specific key usage
grep -r "t\('timer\." src --include="*.tsx"

# Verify key completeness
grep -r "t\(" src --include="*.tsx" | grep -o "t\('[^']*'" | sort -u
```
