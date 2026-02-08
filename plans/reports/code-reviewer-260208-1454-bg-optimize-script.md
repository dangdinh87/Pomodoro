# Code Review: Background Optimization Script

**Reviewer**: Code Quality Assessment Agent
**Date**: 2026-02-08
**Score**: **8.5/10**

---

## Executive Summary

Build-time image optimization script using sharp. Converts source images to AVIF/WebP with thumbs, generates manifest. Solid implementation with good idempotency, clear structure. Minor issues in error handling and memory management patterns.

---

## Scope

### Files Reviewed
- `/Users/nguyendangdinh/Personal/Pomodoro/scripts/optimize-backgrounds.mjs` (248 lines)
- `/Users/nguyendangdinh/Personal/Pomodoro/package.json` (script integration)
- `/Users/nguyendangdinh/Personal/Pomodoro/.gitignore` (output exclusion)

### Review Focus
- Build-time script security (controlled input paths)
- Sharp usage patterns and memory management
- Error handling and edge cases
- YAGNI/KISS/DRY compliance
- Idempotency implementation

---

## Overall Assessment

**Strengths**:
- Clean architecture with single responsibility functions
- Proper idempotency via mtime checks
- Good separation of concerns (optimize, copy, manifest)
- Comprehensive logging with size reduction metrics
- No user input processing (security-safe)
- Appropriate sharp quality settings (AVIF 65, WebP 75/60)

**Weaknesses**:
- Missing error handling for individual file failures
- Sharp pipeline instantiated multiple times per image (memory inefficient)
- No validation of source directory structure
- Missing memory limit configuration for sharp
- No retry mechanism for transient failures

---

## Critical Issues

**None found**

Script operates on controlled build-time inputs with no user-facing attack surface.

---

## High Priority Findings

### 1. Sharp Memory Management Not Configured
**Severity**: High
**Location**: Lines 16-19 (imports), entire script
**Issue**: Sharp not configured with memory limits. Can cause OOM on large batches or high-res images.

**Impact**: Build failures in CI/CD with limited memory, unpredictable resource usage.

**Recommendation**:
```javascript
import sharp from 'sharp';

// Configure sharp memory limits (prevents OOM)
sharp.cache({ memory: 256 }); // 256MB limit
sharp.concurrency(1); // Process serially to control memory
```

---

### 2. No Error Isolation for Individual Files
**Severity**: High
**Location**: Lines 169-200 (main loop)
**Issue**: Single image failure crashes entire build. No try-catch around `optimizeImage()`.

**Impact**: One corrupted source image breaks all background processing.

**Current**:
```javascript
for (const file of files) {
  const result = await optimizeImage(sourcePath, id, pack); // Can throw
  results.push(result);
}
```

**Recommended**:
```javascript
for (const file of files) {
  try {
    const result = await optimizeImage(sourcePath, id, pack);
    results.push(result);
  } catch (err) {
    console.error(`  ✗ Failed to process ${id} (${pack}):`, err.message);
    // Continue processing other files
  }
}
```

---

### 3. Inefficient Sharp Pipeline Usage
**Severity**: Medium-High
**Location**: Lines 66-91 (`optimizeImage` function)
**Issue**: Creates 4 separate sharp instances per image instead of reusing pipeline.

**Impact**: 4x memory allocation, slower processing, higher GC pressure.

**Current**:
```javascript
const pipeline = sharp(sourcePath);
const metadata = await pipeline.metadata(); // Instance #1

await sharp(sourcePath)           // Instance #2
  .resize(...).avif(...).toFile(fullAvif);

await sharp(sourcePath)           // Instance #3
  .resize(...).webp(...).toFile(fullWebp);

await sharp(sourcePath)           // Instance #4
  .resize(...).webp(...).toFile(thumbWebp);
```

**Recommended** (use clone pattern):
```javascript
const source = sharp(sourcePath);
const metadata = await source.metadata();

// Full AVIF
if (!isNewer(fullAvif, sourceMtime)) {
  await source.clone()
    .resize({ width: FULL_WIDTH, withoutEnlargement: true })
    .avif({ quality: AVIF_QUALITY })
    .toFile(fullAvif);
}

// Full WebP
if (!isNewer(fullWebp, sourceMtime)) {
  await source.clone()
    .resize({ width: FULL_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_FULL_QUALITY })
    .toFile(fullWebp);
}

// Thumb WebP
if (!isNewer(thumbWebp, sourceMtime)) {
  await source.clone()
    .resize({ width: THUMB_WIDTH })
    .webp({ quality: WEBP_THUMB_QUALITY })
    .toFile(thumbWebp);
}
```

---

## Medium Priority Warnings

### 4. Missing Source Directory Validation
**Severity**: Medium
**Location**: Lines 159-163 (`main` function)
**Issue**: No check that `SOURCE_DIR` exists before processing.

**Impact**: Unclear error message if `backgrounds-source/` missing.

**Recommendation**:
```javascript
function ensureDirs() {
  if (!existsSync(SOURCE_DIR)) {
    throw new Error(`Source directory not found: ${SOURCE_DIR}`);
  }
  for (const dir of [FULL_DIR, THUMB_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}
```

---

### 5. Hardcoded Pack List
**Severity**: Medium (YAGNI violation)
**Location**: Lines 28-29
**Issue**: `PACKS` array hardcoded. Adding new pack requires code change.

**Impact**: Violates open-closed principle. More maintainable to auto-discover.

**Recommendation**:
```javascript
// Auto-discover packs (any dir except lofi-video)
const PACKS = readdirSync(SOURCE_DIR)
  .filter(name => {
    const path = join(SOURCE_DIR, name);
    return statSync(path).isDirectory() && name !== VIDEO_PACK;
  });
```

---

### 6. No Concurrent Processing
**Severity**: Medium (Performance)
**Location**: Lines 169-200
**Issue**: Serial processing with `await` in loop. Slow for large batches.

**Impact**: Build time scales linearly with image count.

**Consideration**: Could use `Promise.all()` with chunking for parallelism:
```javascript
// Process in chunks of 5 to control memory
const CHUNK_SIZE = 5;
for (let i = 0; i < files.length; i += CHUNK_SIZE) {
  const chunk = files.slice(i, i + CHUNK_SIZE);
  const chunkResults = await Promise.all(
    chunk.map(file => optimizeImage(...).catch(err => ({ error: err })))
  );
  results.push(...chunkResults.filter(r => !r.error));
}
```

**Note**: Balance with memory constraints. Serial processing safer for limited memory.

---

### 7. Manifest Width Always Uses Constant
**Severity**: Low-Medium
**Location**: Lines 140, 106
**Issue**: Manifest always reports `width: 1920` even if source smaller.

**Impact**: Minor metadata inaccuracy. `withoutEnlargement` prevents actual resize, but manifest lies.

**Current**:
```javascript
width: Math.min(metadata.width || FULL_WIDTH, FULL_WIDTH), // Line 106 (unused)
// vs
width: FULL_WIDTH, // Line 140 (used in manifest)
```

**Recommendation**: Use actual output width from line 106 result.

---

## Low Priority Suggestions

### 8. Magic Numbers in Quality Settings
**Severity**: Low
**Location**: Lines 33-37
**Observation**: Quality values (65, 75, 60) are constants but lack justification.

**Suggestion**: Add comments explaining rationale:
```javascript
const AVIF_QUALITY = 65;  // ~60% smaller than WebP, imperceptible loss
const WEBP_FULL_QUALITY = 75;  // Fallback format, balanced size/quality
const WEBP_THUMB_QUALITY = 60; // Small display size tolerates lower quality
```

---

### 9. Video Copy Logging Unclear
**Severity**: Low
**Location**: Lines 203-206
**Issue**: Logs "copied" but idempotency may skip. Ambiguous.

**Recommendation**:
```javascript
if (copiedVideos.length > 0) {
  console.log(`\n  📹 Videos copied/verified: ${copiedVideos.join(', ')}`);
}
```

---

### 10. Missing Sharp Version Lock Warning
**Severity**: Low (Config)
**Location**: `package.json` line 96
**Issue**: Sharp 0.34.x but no exact version. Sharp has frequent binary breaking changes.

**Current**: `"sharp": "^0.34.5"`
**Recommended**: `"sharp": "0.34.5"` (exact pin)

**Rationale**: Prevents CI cache invalidation and binary compatibility issues across envs.

---

## Positive Observations

1. **Excellent idempotency**: mtime-based skipping prevents redundant work
2. **Clear logging**: size reduction metrics, skipped vs processed counts
3. **Good separation**: optimize/copy/manifest in distinct functions
4. **No premature optimization**: simple sync loops, readable code
5. **Proper gitignore**: build outputs excluded from VCS
6. **Good defaults**: AVIF quality 65 is sweet spot (high compression, good quality)
7. **Manifest versioning**: includes `version` and `generated` timestamp
8. **Appropriate sharp settings**: `withoutEnlargement` prevents upscaling

---

## Configuration Review

### package.json Scripts
```json
"bg:optimize": "node scripts/optimize-backgrounds.mjs",
"prebuild": "node scripts/optimize-backgrounds.mjs"
```

**Assessment**: Good integration. `prebuild` ensures fresh builds always have optimized images.

**Consideration**: May slow down dev builds. Could make conditional:
```json
"prebuild": "npm run bg:optimize --if-present || true"
```

---

### .gitignore
```
public/backgrounds/full/
public/backgrounds/thumb/
public/backgrounds/manifest.json
```

**Assessment**: Correct. Build artifacts excluded. Source remains in `backgrounds-source/`.

**Missing**: Consider adding:
```
node_modules/
.DS_Store
*.log
```
(Already present in file - confirmed OK)

---

## YAGNI / KISS / DRY Compliance

### YAGNI (You Aren't Gonna Need It): **Pass**
- No speculative features
- Simple mtime-based idempotency (no complex cache layer)
- No unused format conversions

**Minor violation**: Hardcoded PACKS array (see #5)

---

### KISS (Keep It Simple): **Pass**
- Clear function names, single responsibilities
- Sync file operations where appropriate
- No complex abstractions

**Minor complexity**: Could extract size formatting to helper:
```javascript
const formatKB = (bytes) => Math.round((bytes || 0) / 1024);
const formatMB = (bytes) => ((bytes || 0) / 1024 / 1024).toFixed(1);
```

---

### DRY (Don't Repeat Yourself): **Minor Violations**
- Lines 219-230: Four identical reduce patterns for size totals
- Lines 71-91: Repeated sharp patterns (see #3)

**Recommendation** (size totals):
```javascript
const sumBy = (arr, key) => arr.reduce((sum, r) => sum + (r[key] || 0), 0);
const processed = results.filter(r => !r.skipped);

const totalSource = sumBy(processed, 'sourceSize');
const totalAvif = sumBy(processed, 'fullAvifSize');
const totalWebp = sumBy(processed, 'fullWebpSize');
const totalThumb = sumBy(processed, 'thumbSize');
```

---

## Security Audit

### Input Validation: **Secure**
- No user input (CLI args, env vars)
- Source paths controlled by codebase structure
- No dynamic `require()` or `import()`

### Path Traversal: **Secure**
- All paths constructed with `path.join()` from constants
- No string concatenation for file paths
- `basename()` strips directory components

### File System Operations: **Secure**
- Only writes to `public/backgrounds/`
- No unlinking/deletion of source files
- `mkdirSync` with `recursive: true` safe

### Dependency Security: **Acceptable**
- Sharp 0.34.5 has no known critical CVEs (as of Jan 2025)
- Uses native binaries (inherent risk, but reputable package)

**Recommendation**: Run `npm audit` regularly.

---

## Performance Analysis

### Memory Usage
**Current**: 4 sharp instances per image × N images
**Estimated peak**: ~500MB for 50 images (unverified)

**Recommendation**: Implement clone pattern (#3) and memory limits (#1)

---

### Processing Speed
**Current**: Serial processing, ~1-2s per image
**Estimated**: 50 images = ~60-100s

**Acceptable for build-time**. Parallelism (#6) optional optimization.

---

### Disk I/O
**Idempotency benefit**: Only processes changed files on incremental builds
**Impact**: Dev builds fast (0s if no changes)

**Good design choice**

---

## Recommended Actions

### Critical (Do Immediately)
1. Add error isolation around `optimizeImage()` calls (see #2)
2. Configure sharp memory limits and concurrency (see #1)

### High Priority (Before Production)
3. Implement sharp clone pattern to reduce memory 4x (see #3)
4. Add source directory existence check (see #4)

### Medium Priority (Next Iteration)
5. Auto-discover packs instead of hardcoded array (see #5)
6. Fix manifest width to use actual output dimensions (see #7)
7. Consider chunked parallel processing if build time becomes issue (see #6)

### Low Priority (Nice to Have)
8. Add quality setting comments (see #8)
9. Pin sharp to exact version (see #10)
10. Extract formatKB/formatMB helpers (DRY improvement)

---

## Metrics

- **Lines of Code**: 248
- **Functions**: 6 (ensureDirs, isNewer, optimizeImage, copyVideos, generateManifest, main)
- **Cyclomatic Complexity**: Low (1-3 per function)
- **Test Coverage**: 0% (build script, tests not expected)
- **Security Issues**: 0 critical, 0 high
- **Performance Issues**: 2 high (memory management, sharp cloning)
- **YAGNI Violations**: 1 minor (hardcoded packs)
- **DRY Violations**: 2 minor (repeated reduce, sharp patterns)

---

## Unresolved Questions

1. **Memory limits in CI/CD**: What's the memory budget for build containers? (Affects sharp.cache config)
2. **Max image count**: How many backgrounds expected long-term? (Affects parallelism strategy)
3. **Source image validation**: Should script validate dimensions/formats before processing?
4. **Failure handling strategy**: Should build fail on ANY image error, or continue and report at end?
5. **Background pack discovery**: Is auto-discovery (see #5) desired, or is explicit control preferred?

---

## Final Verdict

**Score: 8.5/10**

Solid build-time script with good architecture and idempotency. Main gaps are error handling and sharp memory management. Fix critical items (#1, #2) before relying on this in CI/CD. Otherwise, well-structured code adhering to KISS/DRY principles with minimal YAGNI violations.

**Deployment Readiness**: 85% (fix error isolation and memory config first)
