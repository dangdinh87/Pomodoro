# OG image fonts

Used only by `src/app/[lang]/opengraph-image.tsx` (satori reads TTF/OTF, not the variable woff2
that `next/font` serves). All are licensed under the SIL Open Font License 1.1.

- `Baloo2-Bold.ttf` (700) and `Baloo2-ExtraBold.ttf` (800): static instances of Baloo 2
  (c) Ek Type, from Google Fonts, subset to Latin + Vietnamese + common punctuation.
- `ZenMaruGothic-Bold-ja-subset.ttf` (700, ~8 KB): Zen Maru Gothic (c) Yoshimichi Ohira, a
  rounded Japanese face that matches Baloo. It holds ONLY the glyphs of the Japanese tagline
  (`site.meta.og.tagline` in `src/i18n/locales/ja.json`), so the whole CJK set is not bundled.

**If you change a tagline** (any language), regenerate the subset or the new characters render
as empty boxes. `src/app/[lang]/opengraph-image.test.tsx` fails when a glyph is missing. To rebuild
the Japanese subset, ask Google Fonts for exactly the characters of the tagline and download the
TrueType file it links:

```
curl -s 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@700&text=<URL-encoded characters>'
# take the url(...) with format('truetype') and save it as ZenMaruGothic-Bold-ja-subset.ttf
```
