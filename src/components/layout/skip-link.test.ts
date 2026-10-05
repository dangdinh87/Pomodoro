import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SKIP_LINK_CLASS } from './skip-link';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');

describe('skip link', () => {
  it('is a sticker on focus (outline, hard shadow, focus ring) and invisible otherwise', () => {
    expect(SKIP_LINK_CLASS).toContain('sr-only');
    for (const part of ['focus:border-outline', 'focus:shadow-sticker-sm', 'focus:outline-brand', 'focus:font-heading']) {
      expect(SKIP_LINK_CLASS).toContain(part);
    }
  });

  it('is the same one in the app layout and the content-page layout', () => {
    for (const file of ['src/app/[lang]/(main)/layout.tsx', 'src/app/[lang]/(landing)/layout.tsx']) {
      expect(read(file), file).toContain('className={SKIP_LINK_CLASS}');
    }
  });
});
