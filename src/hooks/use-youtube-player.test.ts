import { parseYouTubeUrl } from './use-youtube-player';

describe('parseYouTubeUrl', () => {
  it.each([
    ['https://www.youtube.com/watch?v=abc123XYZ_-', { videoId: 'abc123XYZ_-' }],
    ['https://youtube.com/watch?v=abc123&list=PL1', { videoId: 'abc123', listId: 'PL1' }],
    ['https://m.youtube.com/watch?v=abc123', { videoId: 'abc123' }],
    ['https://music.youtube.com/watch?v=abc123', { videoId: 'abc123' }],
    ['https://youtu.be/abc123?t=5', { videoId: 'abc123' }],
    ['https://www.youtube.com/shorts/abc123', { videoId: 'abc123' }],
    ['https://www.youtube.com/live/abc123', { videoId: 'abc123' }],
    ['https://www.youtube.com/playlist?list=PL42', { listId: 'PL42' }],
    ['https://www.youtube.com/channel/UC1', { isChannel: true }],
  ])('reads %s', (url, expected) => {
    expect(parseYouTubeUrl(url)).toMatchObject(expected);
  });

  it.each([
    'https://youtube.com.evil.example/watch?v=abc123',
    'https://evilyoutube.com/watch?v=abc123',
    'https://notyoutube.com/watch?v=abc123',
    'https://youtube.com@evil.example/watch?v=abc123',
    'https://evil.example/youtube.com/watch?v=abc123',
    'https://youtu.be.evil.example/abc123',
  ])('does not take %s for YouTube', (url) => {
    expect(parseYouTubeUrl(url)).toEqual({});
  });

  it('ignores text that is not a url', () => {
    expect(parseYouTubeUrl('')).toEqual({});
    expect(parseYouTubeUrl('youtube.com/watch?v=abc')).toEqual({});
  });
});
