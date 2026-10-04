// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';
import { allColorPresets } from '@/config/themes';
import { builtInPresets } from '@/data/sound-presets';
import { soundCategories } from '@/lib/audio/sound-catalog';

/**
 * i18n `t()` returns the KEY itself when it is missing, so a typo or a forgotten locale
 * entry shows up in the UI as "timerComponents.taskSelector.taskComplete.title".
 * i18n:check only compares the locale files with each other, not with the code, so this
 * test reads the source and fails on any literal key that en.json does not define.
 */

const SRC = path.join(process.cwd(), 'src');

function flatten(obj: Record<string, unknown>, prefix = '', out = new Set<string>()): Set<string> {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v as Record<string, unknown>, key, out);
    else out.add(key);
  }
  return out;
}

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts'))
      out.push(full);
  }
  return out;
}

/** `t('a.b')`, `t("a.b", {...})`, `i18n.t('a.b')`. Template literals are dynamic and skipped. */
const T_CALL = /(?<![\w$])t\(\s*(['"])([A-Za-z][\w-]*(?:\.[\w-]+)*)\1/g;
/** Config objects that carry a key for later lookup: `labelKey: 'a.b'`, `nameKey: 'a.b'`. */
const KEY_PROP = /\b\w*Key\s*:\s*(['"])([a-z][A-Za-z0-9]*(?:\.[\w-]+)+)\1/g;

function usedKeys(): Map<string, string[]> {
  const used = new Map<string, string[]>();
  for (const file of sourceFiles(SRC)) {
    const text = readFileSync(file, 'utf8');
    const rel = path.relative(process.cwd(), file);
    for (const re of [T_CALL, KEY_PROP]) {
      for (const match of text.matchAll(re)) {
        const key = match[2];
        used.set(key, [...(used.get(key) ?? []), rel]);
      }
    }
  }
  return used;
}

/**
 * Files that still carry `t(...) || fallback` but have uncommitted edits from another session,
 * so this batch does not touch them. Delete the entry once the file is free to edit.
 */
const FALLBACK_PENDING = new Set(['src/components/settings/general-settings.tsx']);

const known = flatten(en as unknown as Record<string, unknown>);

describe('translation keys used in code', () => {
  it('finds a believable number of keys (guards against a broken scanner)', () => {
    expect(usedKeys().size).toBeGreaterThan(300);
  });

  it('are all defined in en.json', () => {
    const missing = [...usedKeys()]
      .filter(([key]) => !known.has(key))
      .map(([key, files]) => `${key}  <-  ${[...new Set(files)].join(', ')}`)
      .sort();
    expect(missing, `Missing in en.json (add to en/vi/ja):\n${missing.join('\n')}`).toEqual([]);
  });

  it('never fall back to another value after t()', () => {
    // t('x') || 'fallback' never runs: t() returns the key itself when it is missing
    const fallback = /(?<![\w$])t\((?:[^()]|\([^()]*\))*\)\s*(?:\|\||\?\?)/g;
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const text = readFileSync(file, 'utf8');
      if (FALLBACK_PENDING.has(path.relative(process.cwd(), file))) continue;
      for (const match of text.matchAll(fallback)) {
        const line = text.slice(0, match.index).split('\n').length;
        offenders.push(`${path.relative(process.cwd(), file)}:${line}`);
      }
    }
    expect(offenders, `Remove the fallback and define the key:\n${offenders.join('\n')}`).toEqual([]);
  });
});

describe('translation keys built from ids', () => {
  const need = (keys: string[]) => keys.filter((k) => !known.has(k));

  it('has a name for every listed ambient sound and category', () => {
    const keys = [
      ...soundCategories.map((c) => `audio.categories.${c.key}`),
      ...soundCategories.flatMap((c) => c.sounds.map((s) => `audio.sounds.${s.id}`)),
    ];
    expect(need(keys)).toEqual([]);
  });

  it('has a name for every built-in preset', () => {
    expect(need(builtInPresets.map((p) => `audio.presets.builtIn.${p.id}`))).toEqual([]);
  });
});

describe('translation keys built from color presets', () => {
  it('has a name and a description for every color preset', () => {
    const keys = allColorPresets.flatMap((p) => [
      `settings.general.theme.themes.${p.key}`,
      `settings.general.theme.themeDescriptions.${p.key}`,
    ]);
    expect(keys.filter((k) => !known.has(k))).toEqual([]);
  });
});

describe('placeholders in locale strings', () => {
  const strings = (locale: unknown) => {
    const out: Record<string, string> = {};
    const walk = (node: unknown, prefix: string) => {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'string') out[key] = v;
        else if (v && typeof v === 'object') walk(v, key);
      }
    };
    walk(locale, '');
    return out;
  };
  const locales = { en: strings(en), vi: strings(vi), ja: strings(ja) };

  it('use single braces: t() only fills {name}, so {{name}} would show as "{2}"', () => {
    const bad = Object.entries(locales).flatMap(([lang, dict]) =>
      Object.entries(dict)
        .filter(([, text]) => /\{\{\s*\w+\s*\}\}/.test(text))
        .map(([key]) => `${lang}:${key}`),
    );
    expect(bad).toEqual([]);
  });

  it('are the same in every language', () => {
    const names = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
    const mismatched = Object.keys(locales.en)
      .filter((key) => ['vi', 'ja'].some((lang) => names(locales[lang as 'vi' | 'ja'][key] ?? '') !== names(locales.en[key])))
      .map((key) => `${key}: en={${names(locales.en[key])}} vi={${names(locales.vi[key] ?? '')}} ja={${names(locales.ja[key] ?? '')}}`);
    expect(mismatched).toEqual([]);
  });
});
