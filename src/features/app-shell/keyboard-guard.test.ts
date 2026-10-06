import { shouldIgnoreShortcut } from './keyboard-guard';

function keydown(target: EventTarget) {
  const event = new KeyboardEvent('keydown', { key: '?' });
  Object.defineProperty(event, 'target', { value: target });
  return event;
}

describe('shouldIgnoreShortcut', () => {
  it('does not throw and does not ignore when the target is the Document itself', () => {
    // Can happen for real: a keydown fires right after the previously-focused element was removed
    // from the DOM, so focus reverts to document before the next element claims it.
    expect(() => shouldIgnoreShortcut(keydown(document))).not.toThrow();
    expect(shouldIgnoreShortcut(keydown(document))).toBe(false);
  });

  it('ignores shortcuts while typing in an input', () => {
    const input = document.createElement('input');
    expect(shouldIgnoreShortcut(keydown(input))).toBe(true);
  });

  it('ignores shortcuts while a modifier key is held', () => {
    const event = keydown(document.body);
    Object.defineProperty(event, 'ctrlKey', { value: true });
    expect(shouldIgnoreShortcut(event)).toBe(true);
  });

  it('does not ignore a plain shortcut on a non-field element', () => {
    expect(shouldIgnoreShortcut(keydown(document.body))).toBe(false);
  });
});
