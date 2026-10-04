import { describe, expect, it } from 'vitest';
import { youtubeErrorKey } from './youtube-utils';

describe('youtubeErrorKey', () => {
  it.each([
    [100, 'audio.youtube.errors.notFound'], // removed or private
    [101, 'audio.youtube.errors.embedBlocked'], // owner disallows embedding
    [150, 'audio.youtube.errors.embedBlocked'], // same as 101
    [2, 'audio.youtube.errors.cannotPlay'], // bad parameter: the link is wrong
    [5, 'audio.youtube.errors.cannotPlay'], // HTML5 player error
  ])('maps player error %i to %s', (code, key) => {
    expect(youtubeErrorKey(code)).toBe(key);
  });

  it('falls back to the generic message for an unknown code', () => {
    expect(youtubeErrorKey(153)).toBe('audio.youtube.errors.cannotPlay');
    expect(youtubeErrorKey(undefined)).toBe('audio.youtube.errors.cannotPlay');
  });
});
