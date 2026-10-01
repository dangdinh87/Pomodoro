// Fails (exit 1) when the leaf-key sets of en/vi/ja locale files differ.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'locales');
const langs = ['en', 'vi', 'ja'];

function flatten(obj, prefix = '', out = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key);
  }
  return out;
}

const keys = Object.fromEntries(
  langs.map((l) => [l, flatten(JSON.parse(readFileSync(join(dir, `${l}.json`), 'utf8')))])
);
const union = new Set(langs.flatMap((l) => [...keys[l]]));

let failed = false;
for (const l of langs) {
  const missing = [...union].filter((k) => !keys[l].has(k)).sort();
  if (missing.length) {
    failed = true;
    console.error(`\n${l}.json is missing ${missing.length} key(s):`);
    missing.forEach((k) => console.error(`  - ${k}`));
  }
}

if (failed) {
  console.error('\ni18n key sets differ across locales.');
  process.exit(1);
}
console.log(`i18n keys OK: ${union.size} keys in ${langs.join('/')}`);
