import { parseGaId } from './ga-id';

describe('parseGaId', () => {
  it.each([
    ['G-ABC123XYZ9', { kind: 'gtag', id: 'G-ABC123XYZ9' }],
    ['GTM-NXW9Z4LK', { kind: 'gtm', id: 'GTM-NXW9Z4LK' }],
    ['  G-ABC123  ', { kind: 'gtag', id: 'G-ABC123' }], // stray whitespace from an env file
  ])('accepts %j', (raw, expected) => {
    expect(parseGaId(raw)).toEqual(expected);
  });

  it.each([
    undefined,
    null,
    '',
    '   ',
    'UA-12345-1', // Universal Analytics: shut down
    'AW-123456789', // Google Ads
    'g-abc123', // lowercase
    'G-',
    'GTM-',
    'G-ABC-123',
    'GTM-nxw9z4lk',
    // the real-world bug: two env lines glued together
    'GTM-NXW9Z4LKGROQ_API_KEY=gsk_secret',
    'GTM-NXW9Z4LK GROQ_API_KEY=gsk_secret',
    "G-ABC'); alert(1);//", // never reaches an inline script
    'G-ABC\nG-DEF',
  ])('rejects %j', (raw) => {
    expect(parseGaId(raw as string | undefined)).toBeNull();
  });
});
