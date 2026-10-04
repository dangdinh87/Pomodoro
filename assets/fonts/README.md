# OG image fonts

`Baloo2-Bold.ttf` (700) and `Baloo2-ExtraBold.ttf` (800): static instances of Baloo 2 from Google Fonts,
subset to Latin + Vietnamese + common punctuation. Used only by `src/app/opengraph-image.tsx`
(satori cannot read the variable woff2 that `next/font` serves). Baloo 2 is (c) Ek Type,
licensed under the SIL Open Font License 1.1.

Japanese is not covered: add a subset of a JP font here when the OG image is localised.
