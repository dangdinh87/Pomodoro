/**
 * Open Graph / Twitter share image, one English version for every page (localised later).
 * Drawn with next/og: cream paper, a sticker card, Tomo, the wordmark and the tagline.
 */
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { TOMO_LIGHT_PALETTE, tomoSvg } from '@/components/brand/tomo-art';
import { SHARE_IMAGE_ALT, SHARE_IMAGE_SIZE } from '@/lib/seo/share-image';

export const alt = SHARE_IMAGE_ALT;
export const size = SHARE_IMAGE_SIZE;
export const contentType = 'image/png';

// Static assets: read once at module scope (see the next/og "Custom fonts" guide).
const baloo800 = await readFile(join(process.cwd(), 'assets/fonts/Baloo2-ExtraBold.ttf'));
const baloo700 = await readFile(join(process.cwd(), 'assets/fonts/Baloo2-Bold.ttf'));

// Colours from the light theme in globals.css (satori cannot read CSS variables).
const INK = '#2A1A14';
const PAPER = '#FFF3E0';
const CARD = '#FFFCF6';

const tomoSrc = `data:image/svg+xml;base64,${Buffer.from(
  tomoSvg('happy', TOMO_LIGHT_PALETTE, { size: 400, tight: true, strokeWidth: 3.5 }),
).toString('base64')}`;

/** Round sticker dot scattered on the paper. */
const dot = (left: number, top: number, d: number, fill: string) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width: d,
      height: d,
      borderRadius: d,
      background: fill,
      border: `5px solid ${INK}`,
    }}
  />
);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: PAPER,
          position: 'relative',
          fontFamily: 'Baloo 2',
        }}
      >
        {dot(26, 26, 34, '#FFD45C')}
        {dot(1146, 34, 28, '#7BDCB5')}
        {dot(1134, 560, 38, '#C9B6FF')}
        {dot(32, 566, 26, '#7CC8FF')}

        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 62,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 1040,
            height: 440,
            paddingBottom: 30,
            background: CARD,
            border: `6px solid ${INK}`,
            borderRadius: 44,
            boxShadow: `14px 14px 0 ${INK}`,
            transform: 'rotate(-1deg)',
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img src={tomoSrc} width={330} height={330} style={{ marginRight: 56 }} />
          <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1, letterSpacing: -2, color: INK, whiteSpace: 'nowrap' }}>
            Study Bro
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 462, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              padding: '10px 44px 14px',
              background: '#FFD45C',
              border: `5px solid ${INK}`,
              borderRadius: 999,
              boxShadow: `7px 7px 0 ${INK}`,
              transform: 'rotate(1deg)',
              fontSize: 42,
              fontWeight: 700,
              lineHeight: 1.2,
              color: INK,
              whiteSpace: 'nowrap',
            }}
          >
            Free Pomodoro timer · tasks · focus sounds
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Baloo 2', data: baloo800, style: 'normal', weight: 800 },
        { name: 'Baloo 2', data: baloo700, style: 'normal', weight: 700 },
      ],
    },
  );
}
