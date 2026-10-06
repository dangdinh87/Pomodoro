import { localePath, pathWithoutLocale, splitLocalePath, switchLocalePath } from './locale-path';

describe('localePath', () => {
  it('leaves English unprefixed (x-default)', () => {
    expect(localePath('en', '/')).toBe('/');
    expect(localePath('en', '/guide')).toBe('/guide');
    expect(localePath('en', '/?panel=tasks')).toBe('/?panel=tasks');
  });

  it('prefixes vi and ja, dropping the slash of the home page', () => {
    expect(localePath('vi', '/')).toBe('/vi');
    expect(localePath('ja', '/')).toBe('/ja');
    expect(localePath('vi', '/guide')).toBe('/vi/guide');
    expect(localePath('ja', '/privacy')).toBe('/ja/privacy');
  });

  it('keeps the query and the hash behind the prefixed path', () => {
    expect(localePath('vi', '/?panel=tasks')).toBe('/vi?panel=tasks');
    expect(localePath('vi', '/guide#shortcuts')).toBe('/vi/guide#shortcuts');
    expect(localePath('ja', '/#faq')).toBe('/ja#faq');
    expect(localePath('ja', '/guide?x=1#a')).toBe('/ja/guide?x=1#a');
  });
});

describe('splitLocalePath', () => {
  it.each([
    ['/', null, '/'],
    ['/guide', null, '/guide'],
    ['/vi', 'vi', '/'],
    ['/vi/', 'vi', '/'],
    ['/vi/guide', 'vi', '/guide'],
    ['/ja/guide/x', 'ja', '/guide/x'],
    ['/en', 'en', '/'],
    ['/en/guide', 'en', '/guide'],
    ['/vietnam', null, '/vietnam'],
    ['/fr/guide', null, '/fr/guide'],
  ])('%s -> lang %s, path %s', (pathname, lang, path) => {
    expect(splitLocalePath(pathname)).toEqual({ lang, path });
  });
});

describe('pathWithoutLocale', () => {
  it('is the page path whatever the prefix', () => {
    expect(pathWithoutLocale('/')).toBe('/');
    expect(pathWithoutLocale('/vi')).toBe('/');
    expect(pathWithoutLocale('/en')).toBe('/');
    expect(pathWithoutLocale('/ja/guide')).toBe('/guide');
  });
});

describe('switchLocalePath', () => {
  it('moves to the same page in the other locale', () => {
    expect(switchLocalePath('/guide', '', 'vi')).toBe('/vi/guide');
    expect(switchLocalePath('/vi/guide', '', 'ja')).toBe('/ja/guide');
    expect(switchLocalePath('/ja/privacy', '', 'en')).toBe('/privacy');
    expect(switchLocalePath('/', '', 'ja')).toBe('/ja');
    expect(switchLocalePath('/ja', '', 'en')).toBe('/');
  });

  it('preserves the query, with or without its leading ?', () => {
    expect(switchLocalePath('/', '?panel=tasks', 'vi')).toBe('/vi?panel=tasks');
    expect(switchLocalePath('/vi', 'panel=tasks', 'en')).toBe('/?panel=tasks');
    expect(switchLocalePath('/ja/guide', '?a=1&b=2', 'vi')).toBe('/vi/guide?a=1&b=2');
  });

  it('preserves the hash when given', () => {
    expect(switchLocalePath('/guide', '', 'vi', '#shortcuts')).toBe('/vi/guide#shortcuts');
    expect(switchLocalePath('/vi/guide', '?x=1', 'en', 'shortcuts')).toBe('/guide?x=1#shortcuts');
  });

  it('treats an empty search or hash as nothing', () => {
    expect(switchLocalePath('/vi', '?', 'en', '#')).toBe('/');
  });
});
