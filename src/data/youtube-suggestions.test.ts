import { getSuggestionsByCategory, youtubeSuggestions } from './youtube-suggestions';

describe('youtube suggestions', () => {
  it('no longer offers the removed video 04RM0CQPLHQ (its thumbnail answered 404 and the embed 403)', () => {
    expect(youtubeSuggestions.map((item) => item.url).join('\n')).not.toContain('04RM0CQPLHQ');
  });

  it('offers the lofi stream that replaced it, under Lofi', () => {
    const replacement = youtubeSuggestions.find((item) => item.url.includes('rUxyKA_-grg'));
    expect(replacement).toMatchObject({ category: 'Lofi' });
    expect(getSuggestionsByCategory('Lofi')).toContain(replacement);
  });

  it('gives every pick a label, a description, a category and a watch or playlist link', () => {
    for (const item of youtubeSuggestions) {
      expect(item.label.trim(), item.url).not.toBe('');
      expect(item.description.trim(), item.url).not.toBe('');
      expect(item.category.trim(), item.url).not.toBe('');
      expect(item.url, item.label).toMatch(/^https:\/\/www\.youtube\.com\/(watch\?v=|playlist\?list=)/);
    }
  });
});
