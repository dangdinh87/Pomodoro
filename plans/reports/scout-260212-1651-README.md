# Translation Keys Scout Report - Complete Analysis

**Date:** 2026-02-12 | **Time:** 16:51 UTC | **Status:** Complete

## Overview
Comprehensive analysis of all translation (i18n) keys used across the Pomodoro codebase. This report helps resolve merge conflicts in locale files by identifying which keys are actually needed and where they're used.

## Reports Included

### 1. Translation Keys Inventory Report
**File:** `scout-260212-1651-translation-keys-inventory.md` (20 KB)

Complete catalog of all 500+ translation keys organized by 22 categories:
- Detailed key listing with descriptions
- Usage patterns (interpolated, conditional)
- Category-by-category breakdown
- Merge conflict recommendations

**Use this when:** You need the complete reference of every translation key in the system.

### 2. Quick Reference Guide  
**File:** `scout-260212-1651-translation-quick-reference.md` (2.7 KB)

Executive summary with tables and quick lookup:
- Category summary table (22 categories)
- Most used categories ranking
- New keys added by audio overhaul
- Merge conflict resolution checklist
- Testing commands

**Use this when:** You want a quick overview or need to verify a few keys.

### 3. Merge Conflict Resolution Strategy
**File:** `scout-260212-1651-merge-conflict-strategy.md` (5.9 KB)

Step-by-step guide to resolve conflicts in:
- `src/i18n/locales/en.json`
- `src/i18n/locales/vi.json`
- `src/i18n/locales/ja.json`

Includes:
- Root cause analysis
- Phase-by-phase resolution steps
- Validation & testing procedures
- Risk mitigation strategies
- Implementation timeline

**Use this when:** You're actively resolving the merge conflicts.

### 4. Files Using Translations Report
**File:** `scout-260212-1651-files-using-translations.md` (8.5 KB)

Map of all 90+ component files that use translations:
- Organized by feature (auth, timer, tasks, etc.)
- File locations and descriptions
- Feature-specific key prefixes
- Translation key dependency map
- Files modified by audio overhaul

**Use this when:** You need to understand which components use which keys.

## Key Findings

### Statistics
- **Total Translation Keys:** 500+
- **Categories:** 22
- **Component Files:** 90+
- **Conflicted Files:** 3
- **Affected Features:** 15+

### Top Categories (by key count)
1. `landing` - 54 keys (marketing copy)
2. `entertainment` - 52 keys (games)
3. `tasks` - 45 keys (task management)
4. `audio` - 35 keys (sounds + presets)
5. `chat` - 35 keys (AI assistant)

### Root Cause of Conflicts
Audio system overhaul (phases 1-7) introduced:
- New `audio.presets.*` namespace (preset save/load/rename)
- New `audio.ambient.*` namespace (ambient sound controls)
- Extended `audio.youtube.*` namespace
- Removed Spotify integration keys

Changes were not synchronized across all 3 locale files.

## How to Use This Report

### For Merge Conflict Resolution
1. Start with **Merge Conflict Resolution Strategy** report
2. Reference **Translation Keys Inventory** for exact key structures
3. Use **Files Using Translations** to understand context
4. Apply **Quick Reference** checklists for validation

### For Code Review
1. Check **Files Using Translations** for feature-specific keys
2. Verify in **Translation Keys Inventory** that all used keys exist
3. Test with commands in **Quick Reference**

### For New Feature Development
1. Reference **Translation Keys Inventory** for naming conventions
2. Check **Files Using Translations** for similar features
3. Ensure new keys follow category structure
4. Update all 3 locale files simultaneously

## Current State

### Merge Conflicts (UU Status)
```
src/i18n/locales/en.json - English locale (conflict)
src/i18n/locales/vi.json - Vietnamese locale (conflict)
src/i18n/locales/ja.json - Japanese locale (conflict)
```

### Root Cause
The three locale files diverged due to the audio system overhaul. The en.json file has all new audio keys, but vi.json and ja.json are missing these keys.

### Solution Path
1. Use en.json as authoritative source
2. Ensure all 3 files have identical key structure
3. Preserve existing translations in vi.json and ja.json
4. Add placeholders for new audio keys
5. Coordinate with translators for final translations

## Translation Key Structure

All keys follow dot-notation pattern:
```
category.subcategory.key
```

Example hierarchy:
```
audio/
├── ambient/
│   ├── active
│   ├── title
│   └── playing
├── presets/
│   ├── library
│   ├── saveMix
│   └── rename
└── youtube/
    ├── status.playing
    └── placeholder
```

## Files Modified by Audio Overhaul

**New Components:**
- `/src/components/audio/preset-chips.tsx`
- `/src/components/audio/ambient-mixer.tsx`
- `/src/data/sound-presets.ts`

**Enhanced Components:**
- `/src/components/audio/youtube/youtube-input-section.tsx`
- `/src/stores/audio-store.ts`
- `/src/lib/audio/sound-catalog.ts`

## Next Steps

1. **Immediate (Today):**
   - Review all 4 reports
   - Understand the 22 translation categories
   - Identify which keys are new (audio.*)

2. **Conflict Resolution (1-2 hours):**
   - Open all 3 locale files
   - Use en.json as template
   - Sync vi.json and ja.json structures
   - Test with provided validation commands

3. **Validation (15-30 mins):**
   - Run JSON validators
   - Check application builds
   - Test language switching
   - Verify no console errors

4. **Handoff (If needed):**
   - Mark [TODO] for new translations
   - Coordinate with Vietnamese/Japanese translators
   - Provide them with list of new keys

## Testing Commands Reference

```bash
# Validate JSON syntax
jq empty src/i18n/locales/en.json

# Count total keys
grep -r "t\(" src --include="*.tsx" | wc -l

# Find specific key usage
grep -r "t\('audio.presets" src --include="*.tsx"

# Check for missing keys
grep -r "t\(" src --include="*.tsx" | \
  grep -o "t\('[^']*'" | sort -u | while read key; do
    grep -q "$key" src/i18n/locales/en.json || echo "MISSING: $key"
  done
```

## Questions Resolved

- Which translation keys are actually used? (All 22 categories listed)
- Where are they used? (90+ component files mapped)
- What changed with audio overhaul? (New audio.* keys documented)
- How to resolve conflicts? (Step-by-step guide provided)
- How to verify completeness? (Validation checklist included)

## Contact & Support

For questions about:
- **Key structure:** See Translation Keys Inventory
- **Implementation:** See Merge Conflict Resolution Strategy
- **Component usage:** See Files Using Translations
- **Quick lookup:** See Quick Reference Guide

---

**Scout Status:** Complete
**Report Quality:** High confidence (100+ file analysis)
**Recommendations:** Follow merge conflict strategy guide step-by-step
